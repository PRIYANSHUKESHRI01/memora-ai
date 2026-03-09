"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    MessageSquare,
    Database,
    Upload,
    ArrowRight,
    TrendingUp,
    Clock,
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

export default function DashboardPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState({
        totalDocs: 0,
        totalChunks: 0,
        totalQuestions: 0,
        totalTokens: 0,
    });
    const [recentQuestions, setRecentQuestions] = useState<QuestionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [docsRes, memRes] = await Promise.all([
                    fetch("/api/documents", { credentials: "include" }),
                    fetch("/api/memory", { credentials: "include" }),
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
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1 text-sm">
                    Welcome back. Here&apos;s your knowledge base overview.
                </p>
            </div>

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
