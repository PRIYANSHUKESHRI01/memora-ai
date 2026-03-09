"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UpgradeButton } from "@/components/UpgradeButton";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

const PLANS = [
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
            "100 questions per day",
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
    const isSuccess = searchParams.get("success") === "true";
    const isCancelled = searchParams.get("cancelled") === "true";

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade Your Plan
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

            {/* Success / Cancel banners */}
            {isSuccess && (
                <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center animate-fade-in">
                    <strong>Payment submitted!</strong> Your subscription is being
                    processed. Your plan will be activated shortly once PayPal confirms
                    the payment.
                </div>
            )}

            {isCancelled && (
                <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center animate-fade-in">
                    Payment was cancelled. You can try again whenever you&apos;re ready.
                </div>
            )}

            {/* Free tier info */}
            <div className="mb-8 glass-card p-5 text-center">
                <p className="text-zinc-400 text-sm">
                    You&apos;re currently on the{" "}
                    <span className="text-zinc-200 font-medium">Free plan</span> — 2 MB
                    uploads, 10 pages, 10 questions/day.
                </p>
            </div>

            {/* Plan cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`
                relative glass-card p-6 flex flex-col
                transition-all duration-300
                hover:border-${plan.glowColor}-500/30
                ${plan.popular ? "ring-1 ring-violet-500/30" : ""}
              `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-[10px] font-bold uppercase tracking-wider text-white">
                                    Most Popular
                                </div>
                            )}

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
                                <span className="text-zinc-500 text-sm">{plan.period}</span>
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
                            <UpgradeButton plan={plan.id} />
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

