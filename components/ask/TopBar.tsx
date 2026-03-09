"use client";

import { Brain, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
    onToggleApp: () => void;
    appSidebarOpen: boolean;
}

export function TopBar({ onToggleApp, appSidebarOpen }: TopBarProps) {
    return (
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800/60 backdrop-blur-md bg-black/60 shadow-[0_1px_0_0_rgba(255,255,255,0.03)] shrink-0 z-20">
            {/* Left: App Toggle + Logo grouped */}
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-1.5">
                <button
                    onClick={onToggleApp}
                    title={appSidebarOpen ? "Collapse App Nav" : "Expand App Nav"}
                    className="text-zinc-300 hover:text-white transition-colors"
                >
                    <Menu className="w-5 h-5" strokeWidth={1.8} />
                </button>
                <div className="h-5 w-px bg-zinc-800" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-blue-500" strokeWidth={1.8} />
                    </div>
                    <span className="font-semibold text-white tracking-tight text-sm hidden sm:inline-block">
                        Memora<span className="text-blue-500">AI</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3" />
        </div>
    );
}
