"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { TERMINAL_LINES, CHAR_SPEED, PHASE } from "./animationConfig";

interface Props {
    paused: boolean;
}

export function TypingTerminal({ paused }: Props) {
    const [lines, setLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState("");
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
        if (cycleRef.current) clearTimeout(cycleRef.current);
    }, []);

    const reset = useCallback(() => {
        setLines([]);
        setCurrentLine("");
        setLineIndex(0);
        setCharIndex(0);
    }, []);

    useEffect(() => {
        if (paused) {
            clearTimers();
            return;
        }

        // Start after phase delay
        const startDelay = setTimeout(() => {
            reset();
        }, PHASE.TERMINAL_START * 1000);

        return () => {
            clearTimeout(startDelay);
            clearTimers();
        };
    }, [paused, clearTimers, reset]);

    useEffect(() => {
        if (paused) return;
        if (lineIndex >= TERMINAL_LINES.length) {
            // Restart after loop
            cycleRef.current = setTimeout(() => {
                reset();
            }, (PHASE.TOTAL - PHASE.TERMINAL_START - TERMINAL_LINES.length * 0.5) * 1000);
            return;
        }

        const fullLine = TERMINAL_LINES[lineIndex];

        if (charIndex <= fullLine.length) {
            intervalRef.current = setTimeout(() => {
                setCurrentLine(fullLine.slice(0, charIndex + 1));
                setCharIndex((c) => c + 1);
            }, CHAR_SPEED * 1000);
        } else {
            // Line done — move to next
            intervalRef.current = setTimeout(() => {
                setLines((prev) => [...prev, fullLine]);
                setCurrentLine("");
                setCharIndex(0);
                setLineIndex((l) => l + 1);
            }, 200);
        }

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [lineIndex, charIndex, paused, reset]);

    // Cursor blink
    useEffect(() => {
        const id = setInterval(() => setShowCursor((c) => !c), 530);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: PHASE.TERMINAL_START, duration: 0.4 }}
            className="w-full max-w-xs mx-auto"
        >
            <div className="rounded-lg bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-400/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                    <span className="ml-2 text-[9px] text-zinc-500 font-mono tracking-wider">memora-cli</span>
                </div>
                {/* Content */}
                <div className="p-3 font-mono text-[11px] leading-relaxed min-h-[120px]">
                    {lines.map((line, i) => (
                        <div key={i} className="text-zinc-500">
                            <span className="text-blue-400/50">$ </span>
                            <span
                                className={
                                    line.includes("✓")
                                        ? "text-blue-400/90"
                                        : "text-zinc-400"
                                }
                            >
                                {line}
                            </span>
                        </div>
                    ))}
                    {lineIndex < TERMINAL_LINES.length && (
                        <div className="text-zinc-500">
                            <span className="text-blue-400/50">$ </span>
                            <span className="text-zinc-300">{currentLine}</span>
                            <span
                                className={`inline-block w-[6px] h-[13px] bg-blue-400/80 ml-px align-middle ${showCursor ? "opacity-100" : "opacity-0"
                                    }`}
                                style={{ transition: "opacity 0.1s" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
