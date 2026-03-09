import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/chat/message-service";

// GET /api/messages?conversationId=xyz
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversationId = req.nextUrl.searchParams.get("conversationId");
        if (!conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
        }

        const messages = await getMessages(conversationId, session.user.id);
        if (messages === null) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("[MESSAGES_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
