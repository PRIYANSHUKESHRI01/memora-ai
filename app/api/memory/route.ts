import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!dbUser) {
            return NextResponse.json({ memories: [] });
        }

        const chunks = await prisma.chunk.findMany({
            where: { userId: dbUser.id },
            include: {
                document: {
                    select: { title: true, fileType: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        return NextResponse.json({
            memories: chunks.map((c: any) => ({
                id: c.id,
                content: c.content.slice(0, 200),
                documentTitle: c.document.title,
                documentId: c.documentId,
                createdAt: c.createdAt,
            })),
            total: chunks.length,
        });
    } catch (error) {
        console.error("[MEMORY_GET_ERROR]", error);
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
        const chunkId = searchParams.get("id");

        if (!chunkId) {
            return NextResponse.json(
                { error: "Memory ID is required" },
                { status: 400 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure chunk belongs to user
        const chunk = await prisma.chunk.findFirst({
            where: { id: chunkId, userId: dbUser.id },
        });

        if (!chunk) {
            return NextResponse.json(
                { error: "Memory not found" },
                { status: 404 }
            );
        }

        await prisma.chunk.delete({ where: { id: chunkId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[MEMORY_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
