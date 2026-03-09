"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";

import { TypingTerminal } from "./TypingTerminal";
import { FloatingDocuments } from "./FloatingDocuments";
import { QuerySimulation } from "./QuerySimulation";
import { EmbeddingNetwork } from "./EmbeddingNetwork";

export function HeroDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check reduced motion preference
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Check mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Pause when out of viewport
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => setPaused(!entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const effectivePaused = paused || prefersReducedMotion;

    if (prefersReducedMotion) {
        return (
            <div ref={containerRef} className="w-full aspect-square max-w-sm mx-auto bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-3xl border border-white/5 flex items-center justify-center">
                <Terminal className="w-12 h-12 text-blue-500/50" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center p-4 lg:p-8"
        >
            {/* Background: Embedding network spanning full container */}
            <div className="absolute inset-0 z-0">
                <EmbeddingNetwork isMobile={isMobile} paused={effectivePaused} />
            </div>

            {/* Background: Floating document cards */}
            <div className="absolute inset-x-0 -top-8 sm:top-0 h-64 z-10 pointer-events-none">
                <FloatingDocuments paused={effectivePaused} />
            </div>

            {/* Foreground: Terminal + Query stack */}
            <div className="relative z-20 w-full max-w-[320px] mx-auto flex flex-col items-center justify-center pt-8">

                {/* Decorative depth glow behind the terminal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full relative"
                >
                    <TypingTerminal paused={effectivePaused} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-6 w-[95%]"
                >
                    <QuerySimulation paused={effectivePaused} />
                </motion.div>
            </div>
        </div>
    );
}
