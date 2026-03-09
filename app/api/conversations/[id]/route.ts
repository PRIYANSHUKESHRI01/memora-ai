import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { renameConversation, deleteConversation } from "@/lib/chat/conversation-service";
import { z } from "zod";

const renameSchema = z.object({
    title: z.string().min(1).max(200),
});

// PATCH /api/conversations/[id] — Rename conversation
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = renameSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const conversation = await renameConversation(params.id, session.user.id, validation.data.title);
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error("[CONVERSATION_PATCH_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/conversations/[id] — Delete conversation
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await deleteConversation(params.id, session.user.id);
        if (!result) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CONVERSATION_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
