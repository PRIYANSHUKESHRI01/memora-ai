"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UpgradeButton } from "@/components/UpgradeButton";
import { Check, Sparkles, Crown, Zap, Shield, CheckCircle2 } from "lucide-react";

const PLANS = [
    {
        id: "free" as const,
        name: "Free",
        price: "$0",
        period: "",
        icon: Shield,
        description: "Perfect for trying out Memora AI",
        gradient: "from-zinc-500 to-zinc-600",
        glowColor: "zinc",
        features: [
            "Upload files up to 2 MB",
            "Up to 10 pages per document",
            "10 questions per day",
            "Basic semantic search",
            "Document summaries",
        ],
    },
    {
        id: "pro" as const,
        name: "Pro",
        price: "$9.99",
        period: "/month",
        icon: Zap,
        description: "For power users who need more capacity",
        gradient: "from-blue-500 to-violet-500",
        glowColor: "blue",
        features: [
            "Upload files up to 10 MB",
            "Up to 50 pages per document",
            "50 questions per day",
            "Priority processing",
            "Advanced analytics",
        ],
    },
    {
        id: "enterprise" as const,
        name: "Enterprise",
        price: "$29.99",
        period: "/month",
        icon: Crown,
        description: "Unlimited power for teams and organizations",
        gradient: "from-violet-500 to-purple-600",
        glowColor: "violet",
        popular: true,
        features: [
            "Upload files up to 50 MB",
            "Up to 200 pages per document",
            "Unlimited questions",
            "Priority processing",
            "Advanced analytics",
            "Dedicated support",
        ],
    },
];

export default function UpgradePage() {
    return (
        <Suspense fallback={<div className="text-center text-zinc-500 py-20">Loading plans…</div>}>
            <UpgradeContent />
        </Suspense>
    );
}

function UpgradeContent() {
    const searchParams = useSearchParams();
    const isCancelled = searchParams.get("cancelled") === "true";

    const [currentPlan, setCurrentPlan] = useState<string>("free");
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("inactive");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSubscription() {
            try {
                const res = await fetch("/api/user/subscription", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPlan(data.planType || "free");
                    setSubscriptionStatus(data.subscriptionStatus || "inactive");
                }
            } catch (err) {
                console.error("Failed to load subscription:", err);
            } finally {
                setLoading(false);
            }
        }
        loadSubscription();
    }, []);

    const currentPlanLabel =
        currentPlan === "enterprise" ? "Enterprise"
            : currentPlan === "pro" ? "Pro"
                : "Free";

    const currentPlanLimits =
        currentPlan === "enterprise" ? "50 MB uploads, 200 pages, Unlimited questions"
            : currentPlan === "pro" ? "10 MB uploads, 50 pages, 50 questions/day"
                : "2 MB uploads, 10 pages, 10 questions/day";

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    Manage Your Plan
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-3">
                    Unlock the full power of{" "}
                    <span className="gradient-text">Memora AI</span>
                </h1>
                <p className="text-zinc-400 text-base max-w-xl mx-auto">
                    Choose the plan that fits your workflow. Upgrade anytime and instantly
                    unlock higher limits and premium features.
                </p>
            </div>

            {isCancelled && (
                <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center">
                    Payment was cancelled. You can try again whenever you&apos;re ready.
                </div>
            )}

            {/* Current plan info */}
            {!loading && (
                <div className="mb-8 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 text-center">
                    <p className="text-zinc-400 text-sm">
                        You&apos;re currently on the{" "}
                        <span className="text-zinc-200 font-medium">{currentPlanLabel} plan</span>
                        {" "}— {currentPlanLimits}
                    </p>
                </div>
            )}

            {/* Plan cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrentPlan = plan.id === currentPlan && subscriptionStatus === "active";
                    const isFreeAndCurrent = plan.id === "free" && currentPlan === "free";
                    const isDowngrade =
                        (currentPlan === "enterprise" && (plan.id === "pro" || plan.id === "free")) ||
                        (currentPlan === "pro" && plan.id === "free");
                    const showUpgrade = !isFreeAndCurrent && !isCurrentPlan && !isDowngrade && plan.id !== "free";

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative rounded-2xl p-6 flex flex-col
                                bg-zinc-900/60 border backdrop-blur-md
                                transition-all duration-300
                                ${isCurrentPlan || isFreeAndCurrent
                                    ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
                                    : plan.popular && showUpgrade
                                        ? "border-violet-500/30 ring-1 ring-violet-500/20"
                                        : "border-zinc-800/60 hover:border-zinc-700/60"
                                }
                            `}
                        >
                            {isCurrentPlan || isFreeAndCurrent ? (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold uppercase tracking-wider text-white">
                                    Current Plan
                                </div>
                            ) : plan.popular && showUpgrade ? (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-[10px] font-bold uppercase tracking-wider text-white">
                                    Most Popular
                                </div>
                            ) : null}

                            {/* Plan header */}
                            <div className="mb-6">
                                <div
                                    className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${plan.gradient} mb-4`}
                                >
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-100">{plan.name}</h2>
                                <p className="text-zinc-500 text-sm mt-1">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-zinc-100">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2.5 text-sm text-zinc-300"
                                    >
                                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {isCurrentPlan || isFreeAndCurrent ? (
                                <div className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-center
                                    border border-emerald-500/30 text-emerald-400 bg-emerald-500/5
                                    flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Current Plan
                                </div>
                            ) : showUpgrade ? (
                                <UpgradeButton plan={plan.id as "pro" | "enterprise"} />
                            ) : (
                                <div className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-center
                                    border border-zinc-700/50 text-zinc-600 cursor-not-allowed">
                                    {plan.id === "free" ? "Free Tier" : "Included in your plan"}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Fine print */}
            <p className="text-center text-zinc-600 text-xs mt-8">
                Payments are securely processed via PayPal. Cancel anytime from your
                PayPal account. Subscription activates after PayPal confirms payment.
            </p>
        </div>
    );
}
