"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { PHASE } from "./animationConfig";

interface Props {
    paused: boolean;
}

export function QuerySimulation({ paused }: Props) {
    const queryStart = PHASE.QUERY_ENTER / PHASE.TOTAL;
    const answerStart = PHASE.ANSWER_REVEAL / PHASE.TOTAL;
    const fadeOut = (PHASE.LOOP_PAUSE - 0.2) / PHASE.TOTAL;

    return (
        <div className="mt-3 space-y-2">
            {/* Query bubble */}
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={
                    paused
                        ? { opacity: 0.7, x: 0 }
                        : {
                            opacity: [0, 0, 1, 1, 0],
                            x: [-12, -12, 0, 0, 0],
                        }
                }
                transition={
                    paused
                        ? { duration: 0.3 }
                        : {
                            duration: PHASE.TOTAL,
                            repeat: Infinity,
                            times: [0, queryStart - 0.01, queryStart + 0.04, fadeOut, fadeOut + 0.04],
                        }
                }
                className="flex items-start gap-2 max-w-[260px]"
            >
                <div className="shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5">
                    <MessageSquare className="w-3 h-3 text-violet-400" />
                </div>
                <div className="px-3 py-2 rounded-lg rounded-tl-none bg-violet-500/10 border border-violet-500/20">
                    <p className="text-[11px] text-violet-200">
                        What are the key findings?
                    </p>
                </div>
            </motion.div>

            {/* Answer box */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={
                    paused
                        ? { opacity: 0.7, y: 0 }
                        : {
                            opacity: [0, 0, 1, 1, 0],
                            y: [6, 6, 0, 0, 0],
                        }
                }
                transition={
                    paused
                        ? { duration: 0.3 }
                        : {
                            duration: PHASE.TOTAL,
                            repeat: Infinity,
                            times: [0, answerStart - 0.01, answerStart + 0.05, fadeOut, fadeOut + 0.04],
                        }
                }
                className="ml-7 max-w-[260px]"
            >
                <div className="px-3 py-2.5 rounded-lg rounded-tl-none bg-zinc-800/60 border border-zinc-700/40 shadow-lg shadow-indigo-500/5">
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                        The study identified three key findings: reduced latency by{" "}
                        <span className="text-blue-400 font-medium">42%</span>, improved
                        accuracy to{" "}
                        <span className="text-blue-400 font-medium">97.3%</span>, and
                        decreased resource usage.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        <span className="text-[9px] text-zinc-500">
                            Source: research.pdf, p.12
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
