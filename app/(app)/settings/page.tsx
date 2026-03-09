"use client";

import { useEffect, useState } from "react";
import {
    User,
    Shield,
    Zap,
    Database,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me", { credentials: "include" })
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-2xl space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="-ml-2">
                    <BackButton />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Manage your account and preferences.
                    </p>
                </div>
            </div>

            {/* Profile */}
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
                    Profile
                </h2>
                {!loading && user ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-2xl font-semibold text-blue-400">
                                {user.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-200">
                                    {user.email?.split("@")[0] || "User"}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-14 rounded-xl bg-zinc-800/30 animate-pulse" />
                )}
            </div>

            {/* Usage */}
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
                    Usage
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
                        <div className="text-xs text-zinc-500 mb-1">Plan</div>
                        <div className="text-sm font-semibold text-white">Free</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
                        <div className="text-xs text-zinc-500 mb-1">Storage</div>
                        <div className="text-sm font-semibold text-white">&mdash; / 1GB</div>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
                    Security
                </h2>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
                        <span className="text-zinc-400">Data Isolation</span>
                        <span className="text-emerald-400 text-xs font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
                        <span className="text-zinc-400">Encryption</span>
                        <span className="text-emerald-400 text-xs font-medium">Enabled</span>
                    </div>
                </div>
            </div>

            {/* Data */}
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
                    Data Management
                </h2>
                <p className="text-sm text-zinc-500 mb-4">
                    Export or delete all your data from Memora AI.
                </p>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl border border-zinc-800/60 text-sm text-zinc-300 hover:bg-zinc-800 transition-all duration-200">
                        Export Data
                    </button>
                    <button className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all duration-200">
                        Delete All Data
                    </button>
                </div>
            </div>
        </div>
    );
}
