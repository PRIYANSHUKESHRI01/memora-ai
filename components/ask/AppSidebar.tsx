"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UploadCloud,
    Database,
    Settings,
    MessageSquare,
    LogOut,
    Brain
} from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: UploadCloud },
    { href: "/memory", label: "Memory", icon: Database },
    { href: "/ask", label: "Ask AI", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            if (res.ok) {
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside
            className={cn(
                "h-full bg-zinc-950 border-r border-zinc-800/60 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0",
                isOpen ? "w-64" : "w-16"
            )}
        >
            <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!isOpen ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative overflow-hidden",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-blue-500")} />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300",
                                isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 absolute left-12"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-3 border-t border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    title={!isOpen ? "Sign Out" : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group overflow-hidden relative"
                >
                    <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                    <span className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 absolute left-12"
                    )}>
                        Sign Out
                    </span>
                </button>
            </div>
        </aside>
    );
}
