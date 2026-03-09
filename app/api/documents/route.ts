import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { deleteVectorsByDocument } from "@/lib/vector/vector-client";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!dbUser) {
            return NextResponse.json({ documents: [] });
        }

        const documents = await prisma.document.findMany({
            where: {
                userId: dbUser.id,
                title: { contains: query, mode: "insensitive" },
            },
            orderBy: { uploadedAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ documents });
    } catch (error) {
        console.error("[DOCUMENTS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get("id");

        if (!documentId) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure document belongs to user
        const document = await prisma.document.findFirst({
            where: { id: documentId, userId: dbUser.id },
        });

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // 1. Delete vectors from Supabase
        await deleteVectorsByDocument(documentId, dbUser.id);

        // 2. Delete document from PostgreSQL (cascades to chunks)
        await prisma.document.delete({ where: { id: documentId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DOCUMENTS_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
