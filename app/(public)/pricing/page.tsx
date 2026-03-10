"use client";

import Link from "next/link";
import { Brain, Check, ArrowRight, Sparkles, Zap, Crown, Shield } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const plans = [
    {
        id: "free" as const,
        name: "Free",
        price: "$0",
        period: "",
        description: "Perfect for trying out Memora AI",
        icon: Shield,
        gradient: "from-zinc-500 to-zinc-600",
        glowColor: "zinc",
        features: [
            "Upload files up to 2 MB",
            "Up to 10 pages per document",
            "10 questions per day",
            "Basic semantic search",
            "Document summaries",
        ],
        cta: "Current Plan",
        highlighted: false,
    },
    {
        id: "pro" as const,
        name: "Pro",
        price: "$9.99",
        period: "/month",
        description: "For power users who need more capacity",
        icon: Zap,
        gradient: "from-blue-500 to-violet-500",
        glowColor: "blue",
        features: [
            "Upload files up to 10 MB",
            "Up to 50 pages per document",
            "50 questions per day",
            "Priority processing",
            "Advanced analytics",
        ],
        cta: "Upgrade to Pro",
        highlighted: false,
    },
    {
        id: "enterprise" as const,
        name: "Enterprise",
        price: "$29.99",
        period: "/month",
        description: "Unlimited power for teams and organizations",
        icon: Crown,
        gradient: "from-violet-500 to-purple-600",
        glowColor: "violet",
        features: [
            "Upload files up to 50 MB",
            "Up to 200 pages per document",
            "Unlimited questions",
            "Priority processing",
            "Advanced analytics",
            "Dedicated support",
        ],
        cta: "Upgrade to Enterprise",
        highlighted: true,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-zinc-950 subtle-grid">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            Memora<span className="text-blue-500">AI</span>
                        </span>
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <BackButton className="mb-8 -ml-3" />

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            Pricing Plans
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                            Choose the plan that fits your knowledge-building needs.
                            Upgrade anytime and unlock higher limits instantly.
                        </p>
                    </div>

                    <Suspense fallback={<div className="text-center text-zinc-500 py-10">Loading…</div>}>
                        <PricingContent />
                    </Suspense>
                </div>
            </section>

            {/* Fine print */}
            <div className="text-center pb-12 px-6">
                <p className="text-zinc-600 text-xs max-w-md mx-auto">
                    Payments are securely processed via PayPal. Cancel anytime from your
                    PayPal account. Subscription activates after PayPal confirms payment.
                </p>
            </div>
        </div>
    );
}

function PricingContent() {
    const searchParams = useSearchParams();
    const isCancelled = searchParams.get("cancelled") === "true";

    return (
        <>
            {isCancelled && (
                <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center max-w-2xl mx-auto">
                    Payment was cancelled. You can try again whenever you&apos;re ready.
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative rounded-2xl p-8 flex flex-col
                                bg-zinc-900/60 border backdrop-blur-md
                                transition-all duration-300
                                ${plan.highlighted
                                    ? "border-violet-500/30 ring-1 ring-violet-500/20 shadow-lg shadow-violet-500/5"
                                    : "border-zinc-800/60 hover:border-zinc-700/60"
                                }
                            `}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-[10px] font-bold uppercase tracking-wider text-white">
                                    Most Popular
                                </div>
                            )}

                            {/* Plan header */}
                            <div className="mb-6">
                                <div
                                    className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4`}
                                >
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-100">
                                    {plan.name}
                                </h2>
                                <p className="text-zinc-500 text-sm mt-1">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-zinc-100">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-zinc-500 text-sm">
                                        {plan.period}
                                    </span>
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
                            {plan.id === "free" ? (
                                <Link
                                    href="/register"
                                    className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-center
                                        border border-zinc-700 text-zinc-300 hover:bg-zinc-800
                                        transition-all duration-300 inline-flex items-center justify-center gap-2"
                                >
                                    Get Started
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            ) : (
                                <Link
                                    href={`/login?redirect_url=/upgrade`}
                                    className={`
                                        w-full py-3 px-6 rounded-xl font-semibold text-sm text-center
                                        transition-all duration-300 inline-flex items-center justify-center gap-2
                                        ${plan.id === "enterprise"
                                            ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                                            : "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                        }
                                    `}
                                >
                                    Upgrade to {plan.name}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
