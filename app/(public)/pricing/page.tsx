import Link from "next/link";
import { Brain, Check, ArrowRight } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const plans = [
    {
        name: "Starter",
        price: "Free",
        description: "Perfect for trying out Memora AI",
        features: [
            "5 document uploads",
            "50 questions per month",
            "Basic semantic search",
            "1GB storage",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        description: "For power users building a serious knowledge base",
        features: [
            "Unlimited uploads",
            "Unlimited questions",
            "Advanced semantic search",
            "10GB storage",
            "Priority processing",
            "Auto summaries",
            "Topic filtering",
        ],
        cta: "Start Pro Trial",
        highlighted: true,
    },
    {
        name: "Team",
        price: "$49",
        period: "/month",
        description: "Shared knowledge base for teams",
        features: [
            "Everything in Pro",
            "5 team members",
            "50GB storage",
            "Shared knowledge base",
            "Admin dashboard",
            "API access",
            "Priority support",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background subtle-grid">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Memora<span className="text-primary">AI</span>
                        </span>
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton className="mb-8 -ml-3" />
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Choose the plan that fits your knowledge-building needs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl p-8 flex flex-col ${plan.highlighted
                                    ? "bg-primary/5 border-2 border-primary/30 glow relative"
                                    : "glass-card"
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {plan.description}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.period && (
                                            <span className="text-muted-foreground text-sm">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <li
                                            key={j}
                                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                        >
                                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${plan.highlighted
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "border border-border hover:bg-accent"
                                        }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
