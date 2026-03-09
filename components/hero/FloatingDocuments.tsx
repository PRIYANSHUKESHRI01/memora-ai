"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const docs = [
    { name: "research.pdf", left: "5%", top: "15%", rotate: -6, delay: 0 },
    { name: "notes.pdf", left: "75%", top: "10%", rotate: 4, delay: 1.5 },
    { name: "report.pdf", left: "8%", top: "60%", rotate: -3, delay: 3 },
    { name: "thesis.pdf", left: "72%", top: "58%", rotate: 5, delay: 2 },
    { name: "data.pdf", left: "40%", top: "82%", rotate: -2, delay: 4 },
];

interface Props {
    paused: boolean;
}

export function FloatingDocuments({ paused }: Props) {
    if (paused) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {docs.map((doc, i) => (
                <motion.div
                    key={doc.name}
                    className="absolute w-[100px]"
                    style={{
                        left: doc.left,
                        top: doc.top,
                        transform: `rotate(${doc.rotate}deg)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0.25, 0.45, 0.25],
                        y: [0, -14, 0],
                        x: [0, (i % 2 === 0 ? 5 : -5), 0],
                    }}
                    transition={{
                        duration: 12 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: doc.delay,
                    }}
                >
                    <div className="p-2.5 flex items-center gap-2 bg-zinc-900/30 border border-zinc-700/30 backdrop-blur-sm rounded-lg shadow-lg">
                        <FileText className="w-3.5 h-3.5 text-blue-400/50 shrink-0" />
                        <span className="text-[9px] text-zinc-400/70 truncate font-medium tracking-wide">{doc.name}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
