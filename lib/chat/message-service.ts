import { prisma } from "@/lib/db/prisma";

export async function getMessages(conversationId: string, userId: string) {
    // Verify conversation ownership
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
    });
    if (!conversation) return null;

    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });
}

export async function addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
) {
    const message = await prisma.message.create({
        data: {
            conversationId,
            role,
            content,
        },
    });

    // Touch the conversation's updatedAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    return message;
}
