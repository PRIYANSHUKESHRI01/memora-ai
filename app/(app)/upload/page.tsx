"use client";

import { useState, useCallback } from "react";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

interface UploadResult {
    success: boolean;
    document?: {
        id: string;
        title: string;
        chunkCount: number;
        summary: string;
    };
    error?: string;
}

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === "application/pdf") {
            setFile(droppedFile);
            setResult(null);
        }
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
                setFile(selectedFile);
                setResult(null);
            }
        },
        []
    );

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                setResult({ success: true, document: data.document });
                setFile(null);
            } else {
                setResult({ success: false, error: data.error });
            }
        } catch {
            setResult({ success: false, error: "Upload failed. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="-ml-2">
                    <BackButton />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Upload Document</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Upload a PDF to add to your knowledge base.
                    </p>
                </div>
            </div>

            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer bg-zinc-900/60 backdrop-blur-md",
                    isDragging
                        ? "border-blue-500/60 bg-blue-500/5 scale-[1.01]"
                        : "border-zinc-800/60 hover:border-blue-500/40 hover:bg-zinc-900",
                    uploading && "pointer-events-none opacity-60"
                )}
                onClick={() => document.getElementById("file-input")?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Upload
                        className={cn(
                            "w-6 h-6 text-blue-400 transition-transform duration-300",
                            isDragging && "scale-110"
                        )}
                        strokeWidth={1.8}
                    />
                </div>
                <p className="text-zinc-200 font-medium text-sm mb-1">
                    {isDragging
                        ? "Drop your PDF here"
                        : "Drag & drop your PDF here"}
                </p>
                <p className="text-xs text-zinc-500">
                    or click to browse · PDF only · Max 10MB
                </p>
            </div>

            {/* Selected File */}
            {file && !result?.success && (
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-200 truncate">{file.name}</div>
                        <div className="text-xs text-zinc-500">
                            {formatFileSize(file.size)}
                        </div>
                    </div>
                    {!uploading && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                        }}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Result */}
            {result && (
                <div
                    className={cn(
                        "bg-zinc-900/60 border rounded-2xl p-5 backdrop-blur-md animate-[fadeIn_0.3s_ease]",
                        result.success ? "border-emerald-500/30" : "border-red-500/30"
                    )}
                >
                    {result.success ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload Successful!</span>
                            </div>
                            <div className="text-sm text-zinc-400 space-y-1">
                                <p>
                                    <span className="text-zinc-200 font-medium">
                                        {result.document?.title}
                                    </span>{" "}
                                    has been processed.
                                </p>
                                <p>
                                    {result.document?.chunkCount} memory chunks created and
                                    embedded.
                                </p>
                                {result.document?.summary && (
                                    <div className="mt-3 p-3 rounded-xl bg-zinc-800/50 text-sm text-zinc-300 border border-zinc-800/60">
                                        <span className="font-medium text-zinc-200">
                                            Summary:{" "}
                                        </span>
                                        {result.document.summary}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{result.error}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
