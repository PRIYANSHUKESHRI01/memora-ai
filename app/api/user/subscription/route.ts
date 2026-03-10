import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                planType: true,
                subscriptionStatus: true,
                paymentProvider: true,
                paymentSubscriptionId: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            planType: user.planType,
            subscriptionStatus: user.subscriptionStatus,
            paymentProvider: user.paymentProvider,
        });
    } catch (error) {
        console.error("[SUBSCRIPTION] Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription info" },
            { status: 500 }
        );
    }
}
