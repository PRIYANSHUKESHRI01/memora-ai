import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { prisma } from "@/lib/db/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// Map PayPal plan IDs → our PlanType enum
function getPlanTypeFromPlanId(planId: string): PlanType {
    if (planId === process.env.PAYPAL_PRO_PLAN_ID) return PlanType.pro;
    if (planId === process.env.PAYPAL_ENTERPRISE_PLAN_ID) return PlanType.enterprise;
    return PlanType.free;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Read raw body for signature verification
        const rawBody = await req.text();

        // 2. Extract verification headers
        const headers = {
            "paypal-transmission-id": req.headers.get("paypal-transmission-id") || "",
            "paypal-transmission-time": req.headers.get("paypal-transmission-time") || "",
            "paypal-cert-url": req.headers.get("paypal-cert-url") || "",
            "paypal-auth-algo": req.headers.get("paypal-auth-algo") || "",
            "paypal-transmission-sig": req.headers.get("paypal-transmission-sig") || "",
        };

        // 3. Verify webhook signature
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) {
            console.error("[WEBHOOK] PAYPAL_WEBHOOK_ID not configured");
            return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
        }

        const isValid = await verifyWebhookSignature(headers, rawBody, webhookId);
        if (!isValid) {
            console.error("[WEBHOOK] Signature verification failed");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 4. Parse event
        const event = JSON.parse(rawBody);
        const eventType: string = event.event_type;
        const resource = event.resource;

        console.log(`[WEBHOOK] Received event: ${eventType}`);

        // 5. Handle subscription events
        switch (eventType) {
            case "BILLING.SUBSCRIPTION.ACTIVATED": {
                const subscriptionId: string = resource.id;
                const customId: string = resource.custom_id; // userId
                const planId: string = resource.plan_id;

                if (!customId) {
                    console.error("[WEBHOOK] ACTIVATED event missing custom_id");
                    break;
                }

                const planType = getPlanTypeFromPlanId(planId);

                await prisma.user.update({
                    where: { id: customId },
                    data: {
                        planType,
                        subscriptionStatus: SubscriptionStatus.active,
                        paymentProvider: "paypal",
                        paymentSubscriptionId: subscriptionId,
                    },
                });

                console.log(`[WEBHOOK] User ${customId} activated: ${planType}`);
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.SUSPENDED": {
                const subscriptionId: string = resource.id;
                const customId: string = resource.custom_id;

                if (!customId) {
                    // Try to find user by subscription ID
                    const user = await prisma.user.findFirst({
                        where: { paymentSubscriptionId: subscriptionId },
                    });

                    if (user) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                subscriptionStatus: SubscriptionStatus.cancelled,
                                planType: PlanType.free,
                            },
                        });
                        console.log(`[WEBHOOK] User ${user.id} subscription ${eventType.split(".").pop()?.toLowerCase()}`);
                    } else {
                        console.error(`[WEBHOOK] No user found for subscription ${subscriptionId}`);
                    }
                    break;
                }

                await prisma.user.update({
                    where: { id: customId },
                    data: {
                        subscriptionStatus: SubscriptionStatus.cancelled,
                        planType: PlanType.free,
                    },
                });

                console.log(`[WEBHOOK] User ${customId} subscription ${eventType.split(".").pop()?.toLowerCase()}`);
                break;
            }

            case "PAYMENT.SALE.COMPLETED": {
                // Log only — subscription is already active via ACTIVATED event
                console.log(`[WEBHOOK] Payment completed for subscription ${resource.billing_agreement_id}`);
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
        }

        // Always return 200 after successful verification
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("[WEBHOOK] Error processing webhook:", error);
        // Return 200 even on error to prevent PayPal retries for bad events
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
