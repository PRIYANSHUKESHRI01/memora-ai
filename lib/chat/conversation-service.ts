import { prisma } from "@/lib/db/prisma";

export async function getUserConversations(userId: string) {
    return prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createConversation(userId: string, title: string) {
    return prisma.conversation.create({
        data: {
            userId,
            title: title.slice(0, 100),
        },
    });
}

export async function getConversation(id: string, userId: string) {
    return prisma.conversation.findFirst({
        where: { id, userId },
    });
}

export async function renameConversation(id: string, userId: string, title: string) {
    // Verify ownership first
    const conversation = await prisma.conversation.findFirst({
        where: { id, userId },
    });
    if (!conversation) return null;

    return prisma.conversation.update({
        where: { id },
        data: { title: title.slice(0, 100) },
    });
}

export async function deleteConversation(id: string, userId: string) {
    // Verify ownership first
    const conversation = await prisma.conversation.findFirst({
        where: { id, userId },
    });
    if (!conversation) return null;

    return prisma.conversation.delete({
        where: { id },
    });
}
