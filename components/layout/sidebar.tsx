"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Brain,
    LayoutDashboard,
    Upload,
    Database,
    MessageSquare,
    Settings,
    Sparkles,
    Menu,
    X,
    LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Upload", href: "/upload", icon: Upload },
    { label: "Memory", href: "/memory", icon: Database },
    { label: "Ask AI", href: "/ask", icon: MessageSquare },
    { label: "Upgrade", href: "/upgrade", icon: Sparkles },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            if (res.ok) {
                // Full page redirect clears Next.js client cache and prevents
                // the browser back-button from showing stale authenticated pages.
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-300 backdrop-blur-md shadow-md"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800/60 z-40 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="h-14 flex items-center px-5 border-b border-zinc-800/60 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-white">
                            Memora<span className="text-blue-500">AI</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200",
                                    isActive
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                )}
                            >
                                <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-3 border-t border-zinc-800/60 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium tracking-tight text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
