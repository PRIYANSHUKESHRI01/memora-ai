"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    Brain,
    Upload,
    Search,
    Shield,
    Zap,
    ArrowRight,
    FileText,
    MessageSquare,
    Database,
} from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { ProductDemo } from "@/components/hero/ProductDemo";
import { ScrollReveal } from "@/components/hero/ScrollReveal";

export default function LandingPage() {
    const mainRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: mainRef,
        offset: ["start start", "end end"]
    });

    // Background color/light shift
    const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.03, 0.05, 0.02]);
    const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <div ref={mainRef} className="min-h-screen bg-background subtle-grid selection:bg-violet-500/30 selection:text-white relative">

            {/* dynamic global lighting shift */}
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none bg-blue-500/20 mix-blend-screen"
                style={{ opacity: bgOpacity }}
            />
            <motion.div
                className="fixed left-0 right-0 h-[500px] bg-violet-500/10 blur-[150px] -z-10 pointer-events-none"
                style={{ top: glowY }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                            <Brain className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            Memora<span className="text-blue-500">AI</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="#features"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Pricing
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-zinc-950 text-sm font-semibold hover:bg-white transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col">
                {/* Animated Hero Section */}
                <Hero />

                {/* Scroll-triggered Product Demo */}
                <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <ProductDemo />
                </div>

                {/* Features Grid */}
                <section id="features" className="py-24 px-6 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />
                    <div className="max-w-6xl mx-auto relative z-10">
                        <ScrollReveal variant="fadeUp">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-zinc-100">
                                    Total Recall for Your Documents
                                </h2>
                                <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
                                    Upload your institutional knowledge and instantly query it.
                                    Every finding is cited and anchored to reality.
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Upload,
                                    title: "Smart Document Pipeline",
                                    description:
                                        "Native parsing, hybrid OCR fallback, and optimized chunking guarantee high-fidelity extraction of even the toughest PDFs.",
                                },
                                {
                                    icon: Database,
                                    title: "Semantic Embedding",
                                    description:
                                        "Documents are transformed into high-dimensional vector space using state-of-the-art embedding models for context-aware retrieval.",
                                },
                                {
                                    icon: Search,
                                    title: "Deep Search",
                                    description:
                                        "Not just keyword matching. Search by conceptual meaning to find exactly what you need across hundreds of pages.",
                                },
                                {
                                    icon: MessageSquare,
                                    title: "Citations Included",
                                    description:
                                        "AI generation isn't enough. Our engine pins every answer directly to the uploaded source text, preventing hallucinations.",
                                },
                                {
                                    icon: FileText,
                                    title: "Auto-Summarization",
                                    description:
                                        "Receive comprehensive structured summaries for every uploaded document before you even ask your first question.",
                                },
                                {
                                    icon: Shield,
                                    title: "Private & Secure by Design",
                                    description:
                                        "Your documents remain isolated and private. Build a bespoke knowledge base that belongs strictly to you.",
                                },
                            ].map((feature, i) => (
                                <ScrollReveal key={i} variant="scaleUp">
                                    <div className="glass-card p-6 group h-full transition-all duration-300 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                            <feature.icon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-100 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute -left-1/4 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-4xl mx-auto relative z-10">
                        <ScrollReveal variant="fadeUp">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-zinc-100">
                                    How It Works
                                </h2>
                                <p className="text-zinc-400 text-lg font-light">
                                    Three simple steps to build your second brain.
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Decorative connection line */}
                            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent -z-10" />

                            {[
                                {
                                    step: "01",
                                    title: "Upload",
                                    description:
                                        "Drop your PDFs and documents. We handle extraction, chunking, and embedding.",
                                    icon: Upload,
                                },
                                {
                                    step: "02",
                                    title: "Ask",
                                    description:
                                        "Ask any question in natural language. Our AI evaluates concept similarity.",
                                    icon: MessageSquare,
                                },
                                {
                                    step: "03",
                                    title: "Learn",
                                    description:
                                        "Get precise answers with exact page sources. Build lasting knowledge.",
                                    icon: Zap,
                                },
                            ].map((item, i) => (
                                <ScrollReveal key={i} variant="slideUp">
                                    <div className="text-center group relative">
                                        <div className="absolute inset-x-0 -top-6 text-[80px] font-black text-white/[0.02] -z-10 select-none group-hover:-translate-y-2 transition-transform duration-500">
                                            {item.step}
                                        </div>
                                        <div className="relative w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:border-zinc-500 transition-colors">
                                            <item.icon className="w-6 h-6 text-zinc-300" />
                                            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-100 mb-3 tracking-wide">{item.title}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed px-4">
                                            {item.description}
                                        </p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <ScrollReveal variant="scaleUp">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-100">
                                Ready to Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Second Brain?</span>
                            </h2>
                            <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto font-light">
                                Start organizing your knowledge with AI today. Join thousands of researchers, analysts, and professionals.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]"
                            >
                                Get Started for Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </ScrollReveal>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10 bg-black/40 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Brain className="w-4 h-4 text-zinc-500" strokeWidth={2} />
                        <span className="text-sm text-zinc-500 font-medium tracking-tight">
                            Memora AI © {new Date().getFullYear()}
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/pricing"
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
