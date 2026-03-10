import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createPayPalSubscription } from "@/lib/paypal";

const PLAN_MAP: Record<string, string | undefined> = {
    pro: process.env.PAYPAL_PRO_PLAN_ID,
    enterprise: process.env.PAYPAL_ENTERPRISE_PLAN_ID,
};

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse body
        const body = await req.json();
        const plan = body?.plan as string;

        if (!plan || !["pro", "enterprise"].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "pro" or "enterprise".' },
                { status: 400 }
            );
        }

        // 3. Map to PayPal plan ID
        const planId = PLAN_MAP[plan];
        if (!planId) {
            return NextResponse.json(
                { error: `PayPal plan ID not configured for "${plan}"` },
                { status: 500 }
            );
        }

        // 4. Build return/cancel URLs
        const origin = req.nextUrl.origin;
        const returnUrl = `${origin}/dashboard?payment=success`;
        const cancelUrl = `${origin}/pricing?cancelled=true`;

        // 5. Create subscription via PayPal API
        const result = await createPayPalSubscription({
            planId,
            userId: session.user.id,
            returnUrl,
            cancelUrl,
        });

        // 6. Return approval URL — do NOT activate user here
        return NextResponse.json({
            approvalUrl: result.approvalUrl,
            subscriptionId: result.subscriptionId,
        });
    } catch (error) {
        console.error("[PAYPAL] Create subscription error:", error);
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}
