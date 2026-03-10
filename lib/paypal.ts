/**
 * PayPal Service Layer — Server-only
 *
 * Handles OAuth2 token generation, subscription creation,
 * and webhook signature verification against the PayPal sandbox API.
 */

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

// ─── Access Token ───────────────────────────────────────────

interface PayPalTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;

    if (!clientId || !secret) {
        throw new Error("PayPal credentials not configured");
    }

    const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("[PAYPAL] Token request failed:", text);
        throw new Error(`PayPal token request failed: ${res.status}`);
    }

    const data: PayPalTokenResponse = await res.json();
    return data.access_token;
}

// ─── Create Subscription ────────────────────────────────────

interface CreateSubscriptionOptions {
    planId: string;
    userId: string;
    returnUrl: string;
    cancelUrl: string;
}

interface PayPalLink {
    href: string;
    rel: string;
    method: string;
}

interface PayPalSubscriptionResponse {
    id: string;
    status: string;
    links: PayPalLink[];
}

export async function createPayPalSubscription(
    options: CreateSubscriptionOptions
): Promise<{ subscriptionId: string; approvalUrl: string }> {
    const token = await getPayPalAccessToken();

    const body = {
        plan_id: options.planId,
        custom_id: options.userId,
        application_context: {
            brand_name: "Memora AI",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            return_url: options.returnUrl,
            cancel_url: options.cancelUrl,
        },
    };

    const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("[PAYPAL] Create subscription failed:", text);
        throw new Error(`PayPal subscription creation failed: ${res.status}`);
    }

    const data: PayPalSubscriptionResponse = await res.json();

    const approvalLink = data.links.find((l) => l.rel === "approve");
    if (!approvalLink) {
        throw new Error("PayPal approval URL not found in response");
    }

    return {
        subscriptionId: data.id,
        approvalUrl: approvalLink.href,
    };
}

// ─── Verify Webhook Signature ───────────────────────────────

interface WebhookVerifyHeaders {
    "paypal-transmission-id": string;
    "paypal-transmission-time": string;
    "paypal-cert-url": string;
    "paypal-auth-algo": string;
    "paypal-transmission-sig": string;
}

export async function verifyWebhookSignature(
    headers: WebhookVerifyHeaders,
    rawBody: string,
    webhookId: string
): Promise<boolean> {
    const token = await getPayPalAccessToken();

    const verifyBody = {
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
    };

    const res = await fetch(
        `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(verifyBody),
        }
    );

    if (!res.ok) {
        console.error("[PAYPAL] Webhook verification request failed:", res.status);
        return false;
    }

    const data = await res.json();
    return data.verification_status === "SUCCESS";
}

// ─── Get Subscription Details ───────────────────────────────

export interface PayPalSubscriptionDetails {
    id: string;
    status: string;
    plan_id: string;
    custom_id?: string;
    create_time: string;
}

export async function getPayPalSubscription(
    subscriptionId: string
): Promise<PayPalSubscriptionDetails | null> {
    try {
        const token = await getPayPalAccessToken();

        const res = await fetch(
            `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        if (!res.ok) {
            console.error("[PAYPAL] Get subscription failed:", res.status);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("[PAYPAL] Get subscription error:", error);
        return null;
    }
}
