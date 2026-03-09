import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { chunkText } from "@/lib/ai/chunker";
import { generateEmbedding } from "@/lib/ai/embedding";
import { upsertVectors } from "@/lib/vector/vector-client";
import { summarizeText } from "@/lib/ai/summarizer";
import { extractPDFText, MAX_PDF_SIZE, MAX_PDF_PAGES } from "@/lib/pdf/extract-hybrid";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        console.log("[UPLOAD] Session:", session ? "found" : "NOT FOUND");
        if (!session || !session.user) {
            console.log("[UPLOAD] Auth failed - no session or no user in session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        console.log("[UPLOAD] Authenticated userId:", userId);

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_PDF_SIZE) {
            return NextResponse.json(
                { error: "File exceeds 2MB limit." },
                { status: 400 }
            );
        }

        // Ensure user exists in DB
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Step 1: Extract text from PDF (native → OCR hybrid)
        console.log("[UPLOAD] Step 1: Extracting text from PDF…");
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log("[UPLOAD] Buffer size:", buffer.length);

        let rawText = "";
        try {
            rawText = await extractPDFText(buffer);
            console.log("[UPLOAD] Extraction complete, text length:", rawText.trim().length);
        } catch (err) {
            const msg = (err as Error).message;
            console.error("[UPLOAD] Extraction failed:", msg);

            // Return 400 for validation errors (size/page limits)
            if (msg.includes("page limit") || msg.includes("MB limit")) {
                return NextResponse.json({ error: msg }, { status: 400 });
            }
        }

        if (!rawText || rawText.trim().length === 0) {
            return NextResponse.json(
                { error: "Could not extract text from PDF. The file may be corrupted, contain only graphics, or OCR credentials may not be configured." },
                { status: 422 }
            );
        }

        // Step 2: Chunk text
        console.log("[UPLOAD] Step 2: Chunking text...");
        const chunks = chunkText(rawText);
        console.log("[UPLOAD] Chunking done:", chunks.length, "chunks");

        if (chunks.length === 0) {
            return NextResponse.json(
                { error: "Text was extracted but could not be chunked." },
                { status: 422 }
            );
        }

        // Step 3: Create document record in DB
        console.log("[UPLOAD] Step 3: Creating document record...");
        const document = await prisma.document.create({
            data: {
                userId: dbUser.id,
                title: file.name.replace(".pdf", ""),
                fileType: "pdf",
                fileSize: file.size,
                chunkCount: chunks.length,
            },
        });
        console.log("[UPLOAD] Document created:", document.id);

        // Step 4: Generate embeddings (Gemini API call)
        console.log("[UPLOAD] Step 4: Generating embeddings for", chunks.length, "chunks...");
        const embeddings: number[][] = [];
        try {
            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk.content);
                console.log("Embedding length:", embedding.length);
                embeddings.push(embedding);
            }
            console.log("[UPLOAD] Embeddings generated:", embeddings.length);
        } catch (err) {
            console.error("[UPLOAD] Embedding failed:", (err as Error).message);
            // Clean up the document record we already created
            await prisma.document.delete({ where: { id: document.id } }).catch(() => { });
            return NextResponse.json(
                { error: `Embedding generation failed: ${(err as Error).message}` },
                { status: 500 }
            );
        }

        // Step 5: Store chunks in Prisma DB
        console.log("[UPLOAD] Step 5: Storing chunks in database...");
        let dbChunks;
        try {
            dbChunks = await Promise.all(
                chunks.map((chunk, i) =>
                    prisma.chunk.create({
                        data: {
                            documentId: document.id,
                            userId: dbUser.id,
                            content: chunk.content,
                            embeddingId: `${document.id}_chunk_${i}`,
                        },
                    })
                )
            );
            console.log("[UPLOAD] Chunks stored:", dbChunks.length);
        } catch (err) {
            console.error("[UPLOAD] Chunk storage failed:", (err as Error).message);
            return NextResponse.json(
                { error: `Database chunk storage failed: ${(err as Error).message}` },
                { status: 500 }
            );
        }

        // Step 6: Upsert vectors to Supabase
        console.log("[UPLOAD] Step 6: Upserting vectors to Supabase...");
        try {
            await Promise.race([
                upsertVectors(
                    chunks.map((chunk, i) => ({
                        userId: dbUser.id,
                        documentId: document.id,
                        chunkId: dbChunks[i].id,
                        content: chunk.content,
                        embedding: embeddings[i],
                        metadata: {
                            title: document.title,
                            chunkIndex: chunk.index,
                        },
                    }))
                ),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Vector upsert timed out after 30s")), 30_000)
                ),
            ]);
            console.log("[UPLOAD] Vectors upserted successfully");
        } catch (err) {
            console.error("[UPLOAD] Vector upsert failed:", (err as Error).message);
            return NextResponse.json(
                { error: `Vector storage failed: ${(err as Error).message}` },
                { status: 500 }
            );
        }

        // Step 7: Generate summary (Gemini)
        console.log("[UPLOAD] Step 7: Generating summary...");
        let summary = "Summary not available.";
        try {
            const summaryText = rawText.slice(0, 30000); // Gemini specific limit
            summary = await Promise.race([
                summarizeText(summaryText),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Summary generation timed out after 30s")), 30_000)
                ),
            ]);
            console.log("[UPLOAD] Summary generated:", summary.length, "chars");
        } catch (err) {
            // Non-fatal — we still have the document, just no summary
            console.error("[UPLOAD] Summary failed (non-fatal):", (err as Error).message);
        }

        // Step 8: Update document with summary
        console.log("[UPLOAD] Step 8: Updating document with summary...");
        await prisma.document.update({
            where: { id: document.id },
            data: { summary },
        });

        console.log("[UPLOAD] ✅ Upload complete!");

        return Response.json({ success: true });
    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
