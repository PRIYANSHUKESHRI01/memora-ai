import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { askQuestion } from "@/lib/ai/ask-engine";
import { addMessage } from "@/lib/chat/message-service";
import { getConversation } from "@/lib/chat/conversation-service";

const askSchema = z.object({
    question: z.string().min(1).max(1000),
    conversationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const validation = askSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { question, conversationId } = validation.data;

        // Verify user exists
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please upload a document first." },
                { status: 404 }
            );
        }

        // Verify conversation ownership
        const conversation = await getConversation(conversationId, dbUser.id);
        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Check if user has any documents before hitting the RAG pipeline
        const documentCount = await prisma.document.count({
            where: { userId: dbUser.id },
        });

        // Store user message
        const userMsg = await addMessage(conversationId, "user", question);

        if (documentCount === 0) {
            const noDocsMessage =
                "You haven't uploaded any documents yet. Please upload a PDF first, and then I'll be able to answer your questions based on its contents.";
            const assistantMsg = await addMessage(conversationId, "assistant", noDocsMessage);
            return NextResponse.json({
                answer: noDocsMessage,
                sources: [],
                tokenUsage: 0,
                userMessageId: userMsg.id,
                assistantMessageId: assistantMsg.id,
            });
        }

        // Ask the question (RAG pipeline — unchanged)
        const answer = await askQuestion(question, dbUser.id);

        console.log("Final answer:", answer);

        // Store assistant message
        const assistantMsg = await addMessage(conversationId, "assistant", answer);

        // Log the question (backward compat)
        await prisma.questionLog.create({
            data: {
                userId: dbUser.id,
                question,
                answer,
                sources: [],
                tokenUsage: 0,
            },
        });

        return NextResponse.json({
            answer,
            sources: [],
            tokenUsage: 0,
            userMessageId: userMsg.id,
            assistantMessageId: assistantMsg.id,
        });
    } catch (error) {
        console.error("[ASK_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
