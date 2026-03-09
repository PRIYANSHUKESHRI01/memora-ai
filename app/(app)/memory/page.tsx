"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Trash2,
    Database,
    Search,
    Loader2,
} from "lucide-react";
import { cn, formatDate, formatFileSize, truncate } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

interface Document {
    id: string;
    title: string;
    fileType: string;
    fileSize: number;
    chunkCount: number;
    summary: string | null;
    uploadedAt: string;
}

export default function MemoryPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadDocuments();
    }, []);

    async function loadDocuments() {
        try {
            const res = await fetch("/api/documents", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents ?? []);
            }
        } catch (err) {
            console.error("Failed to load documents", err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteDocument(id: string) {
        setDeleting(id);
        try {
            const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                setDocuments((prev) => prev.filter((d) => d.id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeleting(null);
        }
    }

    const filtered = documents.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0);
    const totalSize = documents.reduce((acc, d) => acc + d.fileSize, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="-ml-2">
                    <BackButton />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Memory Bank</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Manage your uploaded documents and knowledge.
                    </p>
                </div>
            </div>

            {/* Memory Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 text-center backdrop-blur-md transition-all duration-300 hover:border-blue-500/30">
                    <div className="text-2xl font-semibold text-white">{documents.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">Documents</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 text-center backdrop-blur-md transition-all duration-300 hover:border-blue-500/30">
                    <div className="text-2xl font-semibold text-white">{totalChunks}</div>
                    <div className="text-xs text-zinc-500 mt-1">Memory Chunks</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 text-center backdrop-blur-md transition-all duration-300 hover:border-blue-500/30">
                    <div className="text-2xl font-semibold text-white">{formatFileSize(totalSize)}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Size</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:shadow-sm focus:shadow-blue-500/10 transition-all duration-300 backdrop-blur-md"
                />
            </div>

            {/* Document List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 rounded-xl bg-zinc-800/30 animate-pulse"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Database className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-sm text-zinc-500">
                        {search ? "No documents match your search." : "No documents yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-zinc-200 truncate">{doc.title}</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 uppercase">
                                            {doc.fileType}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-3">
                                        <span>{doc.chunkCount} chunks</span>
                                        <span>·</span>
                                        <span>{formatFileSize(doc.fileSize)}</span>
                                        <span>·</span>
                                        <span>{formatDate(doc.uploadedAt)}</span>
                                    </div>
                                    {doc.summary && (
                                        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                                            {truncate(doc.summary, 150)}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteDocument(doc.id)}
                                    disabled={deleting === doc.id}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    {deleting === doc.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
