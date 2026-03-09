import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserConversations, createConversation } from "@/lib/chat/conversation-service";
import { z } from "zod";

const createSchema = z.object({
    title: z.string().min(1).max(200),
});

// GET /api/conversations — List user conversations
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await getUserConversations(session.user.id);
        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("[CONVERSATIONS_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/conversations — Create new conversation
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = createSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const conversation = await createConversation(session.user.id, validation.data.title);
        return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
    } catch (error) {
        console.error("[CONVERSATIONS_POST_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
