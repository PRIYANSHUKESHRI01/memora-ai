"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    MessageSquare,
    Database,
    Upload,
    ArrowRight,
    TrendingUp,
    Clock,
    Crown,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { cn, formatDate, formatFileSize } from "@/lib/utils";

interface Document {
    id: string;
    title: string;
    fileType: string;
    fileSize: number;
    chunkCount: number;
    summary: string | null;
    uploadedAt: string;
}

interface QuestionLog {
    id: string;
    question: string;
    answer: string;
    tokenUsage: number;
    createdAt: string;
}

interface SubscriptionInfo {
    planType: string;
    subscriptionStatus: string;
    paymentProvider: string | null;
    subscriptionCreatedAt: string | null;
    subscriptionEndsAt: string | null;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <div className="h-7 w-32 bg-zinc-800/50 rounded animate-pulse" />
                <div className="h-4 w-64 bg-zinc-800/30 rounded animate-pulse mt-2" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-zinc-900/60 animate-pulse" />
                ))}
            </div>
        </div>
    );
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const paymentSuccess = searchParams.get("payment") === "success";
    const subscriptionIdParam = searchParams.get("subscription_id");

    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState({
        totalDocs: 0,
        totalChunks: 0,
        totalQuestions: 0,
        totalTokens: 0,
    });
    const [recentQuestions, setRecentQuestions] = useState<QuestionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [showPaymentBanner, setShowPaymentBanner] = useState(paymentSuccess);

    useEffect(() => {
        async function loadData() {
            try {
                // If returning from PayPal, verify subscription first
                if (paymentSuccess && subscriptionIdParam) {
                    try {
                        await fetch("/api/paypal/verify-subscription", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ subscription_id: subscriptionIdParam }),
                        });
                    } catch (err) {
                        console.error("Subscription verification failed:", err);
                    }
                }

                const [docsRes, memRes, subRes] = await Promise.all([
                    fetch("/api/documents", { credentials: "include" }),
                    fetch("/api/memory", { credentials: "include" }),
                    fetch("/api/user/subscription", { credentials: "include" }),
                ]);

                if (docsRes.ok) {
                    const docsData = await docsRes.json();
                    setDocuments(docsData.documents ?? []);
                    const totalChunks = (docsData.documents ?? []).reduce(
                        (acc: number, d: Document) => acc + d.chunkCount,
                        0
                    );
                    setStats((prev) => ({
                        ...prev,
                        totalDocs: docsData.documents?.length ?? 0,
                        totalChunks,
                    }));
                }

                if (subRes.ok) {
                    const subData = await subRes.json();
                    setSubscription(subData);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [paymentSuccess, subscriptionIdParam]);

    // Auto-dismiss payment banner after 8 seconds
    useEffect(() => {
        if (showPaymentBanner) {
            const timer = setTimeout(() => setShowPaymentBanner(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [showPaymentBanner]);

    const planDisplayName =
        subscription?.planType === "pro"
            ? "Pro"
            : subscription?.planType === "enterprise"
                ? "Enterprise"
                : "Free";

    const statusDisplayName =
        subscription?.subscriptionStatus === "active"
            ? "Active"
            : subscription?.subscriptionStatus === "cancelled"
                ? "Cancelled"
                : "Inactive";

    const statCards = [
        {
            label: "Documents",
            value: stats.totalDocs,
            icon: FileText,
            iconColor: "text-blue-400",
            iconBg: "bg-zinc-800",
        },
        {
            label: "Memory Chunks",
            value: stats.totalChunks,
            icon: Database,
            iconColor: "text-violet-400",
            iconBg: "bg-zinc-800",
        },
        {
            label: "Questions Asked",
            value: stats.totalQuestions,
            icon: MessageSquare,
            iconColor: "text-emerald-400",
            iconBg: "bg-zinc-800",
        },
        {
            label: "Tokens Used",
            value: stats.totalTokens.toLocaleString(),
            icon: TrendingUp,
            iconColor: "text-amber-400",
            iconBg: "bg-zinc-800",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Payment Success Banner */}
            {showPaymentBanner && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center animate-fade-in flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                        <strong>Subscription activated successfully!</strong>{" "}
                        Your plan will be updated once PayPal confirms the payment.
                    </span>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1 text-sm">
                    Welcome back. Here&apos;s your knowledge base overview.
                </p>
            </div>

            {/* Subscription Status Card */}
            {subscription && (
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl flex items-center justify-center",
                            subscription.planType === "enterprise"
                                ? "bg-violet-600/20"
                                : subscription.planType === "pro"
                                    ? "bg-blue-600/20"
                                    : "bg-zinc-800"
                        )}>
                            <Crown className={cn(
                                "w-5 h-5",
                                subscription.planType === "enterprise"
                                    ? "text-violet-400"
                                    : subscription.planType === "pro"
                                        ? "text-blue-400"
                                        : "text-zinc-500"
                            )} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-zinc-200">
                                    {planDisplayName} Plan
                                </span>
                                {subscription.subscriptionStatus === "active" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {statusDisplayName}
                                    </span>
                                )}
                                {subscription.subscriptionStatus === "cancelled" && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium">
                                        {statusDisplayName}
                                    </span>
                                )}
                                {subscription.subscriptionStatus === "inactive" && (
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500 text-[10px] font-medium">
                                        {statusDisplayName}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {subscription.planType === "free"
                                    ? "2 MB uploads · 10 pages · 10 questions/day"
                                    : subscription.planType === "pro"
                                        ? "10 MB uploads · 50 pages · 50 questions/day"
                                        : "50 MB uploads · 200 pages · Unlimited questions"}
                            </p>
                        </div>
                    </div>
                    {subscription.planType === "free" && (
                        <Link
                            href="/upgrade"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-semibold hover:from-blue-400 hover:to-violet-400 transition-all duration-300 shadow-lg shadow-blue-500/20 shrink-0"
                        >
                            <Sparkles className="w-3 h-3" />
                            Upgrade
                        </Link>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={cn(
                                    "p-3 rounded-xl flex items-center justify-center",
                                    stat.iconBg
                                )}
                            >
                                <stat.icon className={cn("w-[18px] h-[18px]", stat.iconColor)} strokeWidth={1.8} />
                            </div>
                        </div>
                        <div className="text-3xl font-semibold text-white">{stat.value}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Uploads */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            Recent Uploads
                        </h2>
                        <Link
                            href="/memory"
                            className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                        >
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-lg bg-zinc-800/50 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8">
                            <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">No documents yet.</p>
                            <Link
                                href="/upload"
                                className="text-sm text-blue-500 hover:text-blue-400 mt-1 inline-block transition-colors"
                            >
                                Upload your first PDF
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {documents.slice(0, 5).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-zinc-900/60 transition-colors border-b border-zinc-800/40 last:border-none"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-blue-400" strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-zinc-200 truncate">
                                            {doc.title}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {doc.chunkCount} chunks · {formatFileSize(doc.fileSize)} ·{" "}
                                            {formatDate(doc.uploadedAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-5">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link
                            href="/upload"
                            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:bg-zinc-900 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                <Upload className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-200">Upload PDF</div>
                                <div className="text-xs text-zinc-500">
                                    Add a new document to your knowledge base
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                            href="/ask"
                            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:bg-zinc-900 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                                <MessageSquare className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-200">Ask a Question</div>
                                <div className="text-xs text-zinc-500">
                                    Query your knowledge base with AI
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                            href="/memory"
                            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:bg-zinc-900 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-violet-600/20 transition-colors">
                                <Database className="w-5 h-5 text-violet-400" strokeWidth={1.8} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-zinc-200">Browse Memory</div>
                                <div className="text-xs text-zinc-500">
                                    View and manage your stored knowledge
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
