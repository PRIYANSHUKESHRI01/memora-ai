"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { HeroDemo } from "./HeroDemo";

export function Hero() {
    return (
        <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 px-6 overflow-hidden">
            {/* ── Depth gradient background ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-900/80" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
            </div>

            {/* ── Soft animated background glow pulse ── */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0.18, 0.4, 0.18],
                        scale: [1, 1.06, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-blue-500/[0.04] rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.12, 0.3, 0.12],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[35%] left-[30%] w-[350px] h-[350px] bg-violet-500/[0.03] rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.08, 0.2, 0.08],
                        scale: [1, 1.04, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-[30%] right-[25%] w-[300px] h-[300px] bg-emerald-500/[0.02] rounded-full blur-[90px]"
                />
            </div>

            <div className="relative max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: copy */}
                    <div className="text-center lg:text-left z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm mb-8"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs text-zinc-300 font-medium tracking-wide">
                                The AI-Powered Knowledge Engine
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-zinc-100"
                        >
                            Your Personal
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">Second Brain</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-zinc-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed font-light"
                        >
                            Upload documents, ask questions, and retrieve knowledge instantly.
                            Memora AI synthesizes your PDFs into a searchable, intelligent network.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-lg bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
                            >
                                Start Building for Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                Learn More
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="grid grid-cols-3 gap-8 max-w-sm mx-auto lg:mx-0 mt-12 pt-8 border-t border-zinc-800/50"
                        >
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-zinc-200">∞</div>
                                <div className="text-xs text-zinc-500 mt-1 uppercase font-semibold tracking-wider">Documents</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-zinc-200">{"<"}1s</div>
                                <div className="text-xs text-zinc-500 mt-1 uppercase font-semibold tracking-wider">Search Latency</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-400">100%</div>
                                <div className="text-xs text-zinc-500 mt-1 uppercase font-semibold tracking-wider">Source Cited</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Animation demo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex justify-center relative z-10"
                    >
                        <HeroDemo />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
