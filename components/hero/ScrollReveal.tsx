"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
    children: React.ReactNode;
    delay?: number;
    variant?: "fadeUp" | "scaleUp" | "slideUp";
}

export function ScrollReveal({ children, delay = 0, variant = "scaleUp" }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Scroll-linked transforms — bidirectional
    const opacity = useTransform(
        scrollYProgress,
        [0, 0.15, 0.35, 0.75, 0.95],
        [0, 0.4, 1, 1, 0]
    );

    const scaleValue = useTransform(
        scrollYProgress,
        [0, 0.15, 0.35, 0.75, 0.95],
        [0.92, 0.96, 1, 1, 0.96]
    );

    const yFade = useTransform(
        scrollYProgress,
        [0, 0.2, 0.4, 0.7, 0.95],
        [30, 12, 0, 0, -12]
    );

    const ySlide = useTransform(
        scrollYProgress,
        [0, 0.2, 0.4, 0.7, 0.95],
        [50, 20, 0, 0, -20]
    );

    const getStyle = () => {
        switch (variant) {
            case "fadeUp":
                return { opacity, y: yFade };
            case "slideUp":
                return { opacity, y: ySlide, scale: scaleValue };
            case "scaleUp":
            default:
                return { opacity, scale: scaleValue };
        }
    };

    return (
        <motion.div
            ref={ref}
            style={{
                ...getStyle(),
                willChange: "transform, opacity",
                transitionDelay: `${delay}s`,
            }}
        >
            {children}
        </motion.div>
    );
}
