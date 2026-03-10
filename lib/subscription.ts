/**
 * Subscription & Feature Gating Utility
 *
 * Plan-based access control without modifying existing routes.
 * Import these helpers where needed — they are opt-in.
 */

import { prisma } from "@/lib/db/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// ─── Plan Checks ────────────────────────────────────────────

export async function isProUser(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, subscriptionStatus: true },
    });

    if (!user) return false;

    return (
        (user.planType === PlanType.pro || user.planType === PlanType.enterprise) &&
        user.subscriptionStatus === SubscriptionStatus.active
    );
}

export async function isEnterpriseUser(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, subscriptionStatus: true },
    });

    if (!user) return false;

    return (
        user.planType === PlanType.enterprise &&
        user.subscriptionStatus === SubscriptionStatus.active
    );
}

// ─── Plan Limits ────────────────────────────────────────────

export interface PlanLimits {
    maxUploadSizeMB: number;
    maxPages: number;
    maxQuestionsPerDay: number;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    [PlanType.free]: {
        maxUploadSizeMB: 2,
        maxPages: 10,
        maxQuestionsPerDay: 10,
    },
    [PlanType.pro]: {
        maxUploadSizeMB: 10,
        maxPages: 50,
        maxQuestionsPerDay: 50,
    },
    [PlanType.enterprise]: {
        maxUploadSizeMB: 50,
        maxPages: 200,
        maxQuestionsPerDay: -1, // unlimited
    },
};

export async function getUserPlanLimits(
    userId: string
): Promise<PlanLimits> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, subscriptionStatus: true },
    });

    if (!user || user.subscriptionStatus !== SubscriptionStatus.active) {
        return PLAN_LIMITS[PlanType.free];
    }

    return PLAN_LIMITS[user.planType];
}

// ─── Usage Limit Guard ──────────────────────────────────────

export interface UsageLimitResult {
    allowed: boolean;
    reason?: string;
    limits: PlanLimits;
}

export async function checkQuestionLimit(
    userId: string
): Promise<UsageLimitResult> {
    const limits = await getUserPlanLimits(userId);

    // Unlimited questions
    if (limits.maxQuestionsPerDay === -1) {
        return { allowed: true, limits };
    }

    // Count today's questions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.questionLog.count({
        where: {
            userId,
            createdAt: { gte: startOfDay },
        },
    });

    if (todayCount >= limits.maxQuestionsPerDay) {
        return {
            allowed: false,
            reason: `Daily question limit reached (${limits.maxQuestionsPerDay}). Upgrade your plan for more.`,
            limits,
        };
    }

    return { allowed: true, limits };
}

export async function checkUploadLimits(
    userId: string,
    fileSizeBytes: number,
    pageCount: number
): Promise<UsageLimitResult> {
    const limits = await getUserPlanLimits(userId);

    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    if (fileSizeMB > limits.maxUploadSizeMB) {
        return {
            allowed: false,
            reason: `File exceeds ${limits.maxUploadSizeMB}MB limit. Upgrade your plan for larger uploads.`,
            limits,
        };
    }

    if (pageCount > limits.maxPages) {
        return {
            allowed: false,
            reason: `PDF exceeds ${limits.maxPages} page limit. Upgrade your plan for longer documents.`,
            limits,
        };
    }

    return { allowed: true, limits };
}
