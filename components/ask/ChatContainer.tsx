"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, Sparkles, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Source {
    chunkId: string;
    documentId: string;
    content: string;
    similarity: number;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
    error?: boolean;
}

interface ChatContainerProps {
    messages: Message[];
    loading: boolean;
    loadingMessages: boolean;
    conversationId: string | null;
    onSendMessage: (message: string) => void;
}

export function ChatContainer({
    messages,
    loading,
    loadingMessages,
    conversationId,
    onSendMessage,
}: ChatContainerProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (!loading) {
            inputRef.current?.focus();
        }
    }, [conversationId, loading]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const question = input.trim();
        setInput("");
        onSendMessage(question);
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto pt-6 pb-6 px-4 sm:px-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto space-y-6">
                    {loadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center mt-20">
                            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-6 shadow-inner shadow-blue-500/20">
                                <Sparkles className="w-10 h-10 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                {conversationId ? "Start the conversation" : "How can I help you today?"}
                            </h2>
                            <p className="text-zinc-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                                Ask me anything about your uploaded documents, and I&apos;ll search through your knowledge base to provide accurate answers.
                            </p>
                            {!conversationId && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
                                    {[
                                        "Summarize my most recent document",
                                        "What are the key takeaways from my knowledge base?",
                                        "Find information related to specific topics",
                                        "Draft a report based on my uploads",
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(suggestion)}
                                            className="text-left p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-blue-500/40 hover:bg-zinc-900 hover:scale-[1.02] transition-all duration-300 text-sm text-zinc-300"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-md",
                                            msg.role === "user" ? "bg-blue-600" : "bg-black border border-white/10"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : (
                                            <Brain className="w-4 h-4 text-blue-500" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={cn(
                                            "max-w-[85%] rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-tr-sm shadow-md"
                                                : "bg-zinc-800/80 text-zinc-100 rounded-tl-sm border border-white/5 shadow-md",
                                            msg.error && "bg-red-950/50 border-red-500/20 text-red-200"
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>

                                        {/* Sources */}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                                <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    Sources Context
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {msg.sources.map((src, i) => (
                                                        <div key={i} className="px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-[12px] text-zinc-400 italic">
                                                            &quot;{src.content.slice(0, 150)}...&quot;
                                                            <span className="block mt-1 text-[10px] text-zinc-600 not-italic">
                                                                Relevance: {(src.similarity * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Loading Indicator */}
                            {loading && (
                                <div className="flex gap-4 w-full animate-in fade-in duration-300">
                                    <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-md">
                                        <Brain className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="bg-zinc-800/80 rounded-3xl rounded-tl-sm border border-white/5 px-5 py-4 shadow-md flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Form Box */}
            <div className="shrink-0 px-4 sm:px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-end bg-zinc-900/70 border border-zinc-800/60 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-blue-500/10"
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Message Memora AI..."
                            rows={1}
                            className="flex-1 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-500 resize-none max-h-40 scrollbar-thin scrollbar-thumb-zinc-700"
                            style={{ minHeight: '24px' }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="ml-3 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:bg-zinc-700 transition-colors"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </form>
                    <div className="text-center mt-2 text-[11px] text-zinc-600">
                        Memora AI can make mistakes. Consider verifying important information.
                    </div>
                </div>
            </div>
        </div>
    );
}
