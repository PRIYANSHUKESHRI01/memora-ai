"use client";

import { motion } from "framer-motion";

interface Props {
    paused: boolean;
    isMobile: boolean;
}

// 8 nodes spread across the container for full-area coverage
const NODES = [
    { cx: 15, cy: 20 },
    { cx: 40, cy: 12 },
    { cx: 70, cy: 18 },
    { cx: 88, cy: 35 },
    { cx: 75, cy: 65 },
    { cx: 50, cy: 80 },
    { cx: 22, cy: 70 },
    { cx: 10, cy: 48 },
];

// Sparse, elegant connection web
const EDGES = [
    [0, 1], [1, 2], [2, 3],
    [3, 4], [4, 5], [5, 6],
    [6, 7], [7, 0],
    [1, 5], [2, 6], [0, 4],
];

export function EmbeddingNetwork({ paused, isMobile }: Props) {
    if (isMobile) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Edges — very subtle connecting lines */}
                {EDGES.map(([a, b], i) => (
                    <motion.line
                        key={`edge-${i}`}
                        x1={NODES[a].cx}
                        y1={NODES[a].cy}
                        x2={NODES[b].cx}
                        y2={NODES[b].cy}
                        stroke="rgba(139,92,246,0.15)"
                        strokeWidth="0.2"
                        initial={{ opacity: 0.05 }}
                        animate={{
                            opacity: paused ? 0.1 : [0.06, 0.22, 0.06],
                        }}
                        transition={{
                            duration: 4 + (i % 3) * 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.25,
                        }}
                    />
                ))}

                {/* Nodes — faint pulse animation */}
                {NODES.map((node, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        cx={node.cx}
                        cy={node.cy}
                        r="1.8"
                        fill="rgba(139,92,246,0.5)"
                        initial={{ opacity: 0.2 }}
                        animate={{
                            opacity: paused ? 0.3 : [0.15, 0.55, 0.15],
                            scale: paused ? 1 : [0.85, 1.3, 0.85],
                        }}
                        transition={{
                            duration: 3.5 + (i % 3) * 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4,
                        }}
                    />
                ))}

                {/* Faint glow rings on alternating nodes */}
                {[0, 2, 4, 6].map((idx) => (
                    <motion.circle
                        key={`glow-${idx}`}
                        cx={NODES[idx].cx}
                        cy={NODES[idx].cy}
                        r="4"
                        fill="none"
                        stroke="rgba(99,102,241,0.06)"
                        strokeWidth="0.4"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: paused ? 0.04 : [0.02, 0.12, 0.02],
                            scale: paused ? 1 : [0.8, 1.25, 0.8],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: idx * 0.5,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
