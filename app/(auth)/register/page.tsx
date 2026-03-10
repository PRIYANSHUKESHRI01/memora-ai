"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Brain, ArrowRight, Lock, Mail, FileText, Cpu, Network } from "lucide-react";

/* ── Floating background elements ── */
function AuthBackground() {
    return (
        <div className="auth-animate absolute inset-0 overflow-hidden pointer-events-none" style={{ animation: "auth-bg-fade 0.8s ease-out" }}>
            {/* Gradient blobs */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[100px]"
                style={{
                    background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
                    top: "15%", right: "20%",
                    animation: "auth-gradient-shift 12s ease-in-out infinite",
                }}
            />
            <div
                className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
                style={{
                    background: "radial-gradient(circle, #6366f1, transparent 70%)",
                    bottom: "20%", left: "15%",
                    animation: "auth-gradient-shift 15s ease-in-out infinite 2s",
                }}
            />
            <div
                className="absolute w-[350px] h-[350px] rounded-full opacity-[0.04] blur-[80px]"
                style={{
                    background: "radial-gradient(circle, #3b82f6, transparent 70%)",
                    top: "50%", left: "50%",
                    animation: "auth-gradient-shift 18s ease-in-out infinite 4s",
                }}
            />

            {/* Subtle grid */}
            <div className="absolute inset-0 subtle-grid opacity-40" />

            {/* Floating document cards — hidden on mobile */}
            <div className="hidden md:block">
                {/* Card 1 */}
                <div
                    className="absolute top-[15%] left-[10%] w-36 h-24 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-sm p-3 opacity-[0.3]"
                    style={{ animation: "auth-float-reverse 9s ease-in-out infinite" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-3.5 h-3.5 text-violet-500/60" />
                        <div className="h-2 w-14 rounded bg-zinc-700/50" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-3/4 rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-5/6 rounded bg-zinc-700/30" />
                    </div>
                </div>

                {/* Card 2 */}
                <div
                    className="absolute top-[20%] right-[8%] w-32 h-20 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-sm p-3 opacity-[0.25]"
                    style={{ animation: "auth-float 10s ease-in-out infinite 1.5s" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500/60" />
                        <div className="h-2 w-10 rounded bg-zinc-700/50" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-2/3 rounded bg-zinc-700/30" />
                    </div>
                </div>

                {/* Card 3 */}
                <div
                    className="absolute bottom-[18%] left-[6%] w-28 h-20 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-sm p-3 opacity-[0.2]"
                    style={{ animation: "auth-float 8s ease-in-out infinite 3s" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Network className="w-3.5 h-3.5 text-purple-500/60" />
                        <div className="h-2 w-8 rounded bg-zinc-700/50" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-4/5 rounded bg-zinc-700/30" />
                    </div>
                </div>

                {/* Card 4 */}
                <div
                    className="absolute bottom-[22%] right-[12%] w-36 h-24 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-sm p-3 opacity-[0.35]"
                    style={{ animation: "auth-float-reverse 11s ease-in-out infinite 2s" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500/60" />
                        <div className="h-2 w-12 rounded bg-zinc-700/50" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-2/3 rounded bg-zinc-700/30" />
                        <div className="h-1.5 w-4/5 rounded bg-zinc-700/30" />
                    </div>
                </div>

                {/* Orbiting particles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                        className="w-2 h-2 rounded-full bg-violet-500/20"
                        style={{ animation: "auth-orbit 30s linear infinite" }}
                    />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                        className="w-1.5 h-1.5 rounded-full bg-blue-500/15"
                        style={{ animation: "auth-orbit 40s linear infinite reverse" }}
                    />
                </div>

                {/* Pulse rings */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-zinc-800/20"
                    style={{ animation: "auth-pulse-ring 6s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-zinc-800/10"
                    style={{ animation: "auth-pulse-ring 8s ease-in-out infinite 1s" }}
                />
            </div>
        </div>
    );
}

/* ── Register page ── */
export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden p-4">
            <AuthBackground />

            {/* Auth card */}
            <div
                className="auth-animate relative z-10 w-full max-w-md"
                style={{ animation: "auth-card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            >
                {/* Logo + heading */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Memora<span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">AI</span>
                        </span>
                    </Link>
                    <h1
                        className="auth-animate text-2xl font-bold text-zinc-100 tracking-tight"
                        style={{ animation: "auth-field-enter 0.5s ease-out 0.15s both" }}
                    >
                        Create your account
                    </h1>
                    <p
                        className="auth-animate text-sm text-zinc-500 mt-1.5"
                        style={{ animation: "auth-field-enter 0.5s ease-out 0.25s both" }}
                    >
                        Get started for free — no credit card required
                    </p>
                </div>

                {/* Glass card */}
                <div
                    className="auth-animate bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/30"
                    style={{
                        boxShadow: "0 0 0 1px rgba(139,92,246,0.05), 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.03)",
                    }}
                >
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div
                            className="auth-animate space-y-2"
                            style={{ animation: "auth-field-enter 0.5s ease-out 0.3s both" }}
                        >
                            <label htmlFor="email" className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" />
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 text-zinc-100
                                    placeholder:text-zinc-600 text-sm
                                    focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-zinc-800/60
                                    disabled:opacity-50 transition-all duration-300"
                            />
                        </div>
                        <div
                            className="auth-animate space-y-2"
                            style={{ animation: "auth-field-enter 0.5s ease-out 0.4s both" }}
                        >
                            <label htmlFor="password" className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" />
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 text-zinc-100
                                    placeholder:text-zinc-600 text-sm
                                    focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-zinc-800/60
                                    disabled:opacity-50 transition-all duration-300"
                            />
                        </div>
                        <div
                            className="auth-animate space-y-2"
                            style={{ animation: "auth-field-enter 0.5s ease-out 0.5s both" }}
                        >
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" />
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 text-zinc-100
                                    placeholder:text-zinc-600 text-sm
                                    focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-zinc-800/60
                                    disabled:opacity-50 transition-all duration-300"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div
                            className="auth-animate"
                            style={{ animation: "auth-field-enter 0.5s ease-out 0.6s both" }}
                        >
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white
                                    bg-gradient-to-r from-violet-500 to-purple-600
                                    shadow-lg shadow-violet-500/20
                                    hover:shadow-xl hover:shadow-violet-500/30 hover:from-violet-400 hover:to-purple-500
                                    active:scale-[0.98]
                                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div
                        className="auth-animate mt-6 text-center text-sm"
                        style={{ animation: "auth-field-enter 0.5s ease-out 0.7s both" }}
                    >
                        <span className="text-zinc-500">Already have an account?{" "}</span>
                        <Link
                            href="/login"
                            className="font-medium text-violet-400 hover:text-violet-300 transition-colors relative
                                after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-violet-400
                                hover:after:w-full after:transition-all after:duration-300"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Back to home */}
                <div
                    className="auth-animate text-center mt-6"
                    style={{ animation: "auth-field-enter 0.5s ease-out 0.8s both" }}
                >
                    <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
