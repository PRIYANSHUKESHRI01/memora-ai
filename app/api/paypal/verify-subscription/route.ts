import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getPayPalSubscription } from "@/lib/paypal";
import { prisma } from "@/lib/db/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

function getPlanTypeFromPlanId(planId: string): PlanType {
    if (planId === process.env.PAYPAL_PRO_PLAN_ID) return PlanType.pro;
    if (planId === process.env.PAYPAL_ENTERPRISE_PLAN_ID) return PlanType.enterprise;
    return PlanType.free;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const subscriptionId = body?.subscription_id as string;

        if (!subscriptionId) {
            return NextResponse.json(
                { error: "subscription_id is required" },
                { status: 400 }
            );
        }

        // Fetch subscription status directly from PayPal
        const subscription = await getPayPalSubscription(subscriptionId);

        if (!subscription) {
            return NextResponse.json(
                { error: "Could not verify subscription with PayPal" },
                { status: 502 }
            );
        }

        console.log(`[VERIFY] Subscription ${subscriptionId}: status=${subscription.status}, plan=${subscription.plan_id}`);

        // Only activate if PayPal confirms ACTIVE status
        if (subscription.status === "ACTIVE") {
            const planType = getPlanTypeFromPlanId(subscription.plan_id);

            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    planType,
                    subscriptionStatus: SubscriptionStatus.active,
                    paymentProvider: "paypal",
                    paymentSubscriptionId: subscriptionId,
                },
            });

            console.log(`[VERIFY] User ${session.user.id} upgraded to ${planType}`);

            return NextResponse.json({
                verified: true,
                planType,
                subscriptionStatus: "active",
            });
        }

        // Subscription exists but not active yet (APPROVAL_PENDING, etc.)
        return NextResponse.json({
            verified: false,
            paypalStatus: subscription.status,
            message: "Subscription is not yet active on PayPal",
        });
    } catch (error) {
        console.error("[VERIFY] Error verifying subscription:", error);
        return NextResponse.json(
            { error: "Failed to verify subscription" },
            { status: 500 }
        );
    }
}
