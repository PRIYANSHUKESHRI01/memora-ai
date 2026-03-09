import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(null, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { documents: true, chunks: true },
                },
            },
        });

        if (!user) {
            return NextResponse.json(null, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[ME_ERROR]", error);
        return NextResponse.json(null, { status: 500 });
    }
}
