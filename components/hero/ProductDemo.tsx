"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Play, Loader2 } from "lucide-react";

export function ProductDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const isInView = useInView(containerRef, { amount: 0.3 });
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // Hide loading overlay once video has enough data
    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        // If video already has data (cached), mark as loaded immediately
        if (video.readyState >= 3) {
            setIsVideoLoaded(true);
        }

        const handleCanPlay = () => setIsVideoLoaded(true);
        video.addEventListener("canplay", handleCanPlay);
        return () => video.removeEventListener("canplay", handleCanPlay);
    }, []);

    // IntersectionObserver for lazy loading and strict autoplay control
    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        // Ensure muted is explicitly set before load to satisfy browser autoplay policies
        video.muted = true;
        video.defaultMuted = true;

        if (isInView) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented. Usually okay if muted, but catch just in case.
                });
            }
        } else {
            video.pause();
        }
    }, [isInView]);

    // Scroll-linked transforms
    const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.7, 0.95], [0, 0.5, 1, 1, 0]);
    const contentScale = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.7, 0.95], [0.92, 0.96, 1, 1, 0.96]);
    const videoScale = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.7, 0.9], [0.9, 0.95, 1, 1, 0.95]);

    return (
        <section ref={containerRef} className="py-24 px-6 overflow-hidden relative">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left: Copy */}
                <motion.div style={{ opacity: contentOpacity, scale: contentScale }} className="max-w-lg">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                        See <span className="gradient-text">Memora AI</span> in Action
                    </h2>
                    <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                        Stop skimming endless documents. Simply upload your PDFs and let AI
                        synthesize the insights you need instantly.
                    </p>

                    <div className="space-y-6">
                        {[
                            {
                                title: "Upload large documents instantly",
                                description: "Process up to 50-page PDFs with rich parsing in seconds.",
                            },
                            {
                                title: "Ask natural language questions",
                                description: "Interact with your data just like chatting with an expert.",
                            },
                            {
                                title: "Source-backed precise answers",
                                description: "Every answer includes citations pointing exactly to the source text.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                key={i}
                                className="flex items-start gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Play className="w-3.5 h-3.5 text-blue-400 ml-0.5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-200">{feature.title}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Video Container */}
                <motion.div style={{ y, opacity: contentOpacity, scale: videoScale }} className="relative">
                    {/* Subtle glow behind video */}
                    <div className="absolute inset-0 bg-violet-500/10 rounded-2xl blur-3xl z-0" />

                    <div className="relative z-10 glass-card rounded-2xl overflow-hidden aspect-[16/9] border border-border/50 bg-black/50 shadow-2xl flex items-center justify-center">

                        {/* Loading Placeholder */}
                        {!isVideoLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                <span className="text-sm text-zinc-500">Loading demo...</span>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            src="/demo.mp4"
                            className="w-full h-full object-cover rounded-2xl"
                            preload="auto"
                            muted
                            loop
                            playsInline
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
