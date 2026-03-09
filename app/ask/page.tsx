"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatSidebar } from "@/components/ask/ChatSidebar";
import { ChatContainer } from "@/components/ask/ChatContainer";
import { AppSidebar } from "@/components/ask/AppSidebar";
import { TopBar } from "@/components/ask/TopBar";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";

interface ConversationItem {
    id: string;
    title: string;
    updatedAt: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    error?: boolean;
}

function AskPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationIdParam = searchParams.get("c");

    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(
        conversationIdParam
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [appSidebarOpen, setAppSidebarOpen] = useState(false);
    const [chatSidebarOpen, setChatSidebarOpen] = useState(true);

    const handleToggleApp = () => {
        setAppSidebarOpen((prev) => !prev);
        if (!appSidebarOpen) setChatSidebarOpen(false);
    };

    const handleToggleChat = () => {
        setChatSidebarOpen((prev) => !prev);
        if (!chatSidebarOpen) setAppSidebarOpen(false);
    };

    // Fetch conversations on mount
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/conversations", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations ?? []);
            }
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Sync URL param
    useEffect(() => {
        setCurrentConversationId(conversationIdParam);
    }, [conversationIdParam]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!currentConversationId) {
            setMessages([]);
            return;
        }

        async function loadMessages() {
            setLoadingMessages(true);
            try {
                const res = await fetch(
                    `/api/messages?conversationId=${currentConversationId}`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const data = await res.json();
                    setMessages(
                        (data.messages ?? []).map((m: any) => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            sources: m.sources,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoadingMessages(false);
            }
        }

        loadMessages();
    }, [currentConversationId]);

    // Select a conversation
    const handleSelect = (id: string) => {
        router.push(`/ask?c=${id}`, { scroll: false });
        // Auto-close chat sidebar on mobile/smaller screens after selection
        if (window.innerWidth < 1024) {
            setChatSidebarOpen(false);
        }
    };

    // New chat
    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages([]);
        router.push("/ask", { scroll: false });
        if (window.innerWidth < 1024) {
            setChatSidebarOpen(false);
        }
    };

    // Send message
    const handleSendMessage = async (question: string) => {
        let convId = currentConversationId;

        if (!convId) {
            try {
                const title = question.slice(0, 50);
                const res = await fetch("/api/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title }),
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to create conv");

                const data = await res.json();
                convId = data.conversationId;
                setCurrentConversationId(convId);
                router.push(`/ask?c=${convId}`, { scroll: false });

                setConversations((prev) => [
                    { id: convId!, title, updatedAt: new Date().toISOString() },
                    ...prev,
                ]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Failed to create conversation. Please try again.",
                        error: true,
                    },
                ]);
                return;
            }
        }

        // Optimistic UI
        const userMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: question,
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, conversationId: convId }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => {
                    const updated = prev.map((m) =>
                        m.id === userMsg.id ? { ...m, id: data.userMessageId || m.id } : m
                    );
                    return [
                        ...updated,
                        {
                            id: data.assistantMessageId || (Date.now() + 1).toString(),
                            role: "assistant" as const,
                            content: data.answer,
                            sources: data.sources,
                        },
                    ];
                });

                setConversations((prev) => {
                    const existing = prev.find((c) => c.id === convId);
                    if (!existing) return prev;
                    return [
                        { ...existing, updatedAt: new Date().toISOString() },
                        ...prev.filter((c) => c.id !== convId),
                    ];
                });
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: data.error || "Something went wrong.",
                        error: true,
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Failed to connect. Please try again.",
                    error: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Delete conversation
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/conversations/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setConversations((prev) => prev.filter((c) => c.id !== id));
                if (currentConversationId === id) {
                    handleNewChat();
                }
            }
        } catch (err) {
            console.error("Failed to delete conversation", err);
        }
    };

    // Rename conversation
    const handleRename = async (id: string, title: string) => {
        try {
            const res = await fetch(`/api/conversations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
                credentials: "include",
            });
            if (res.ok) {
                setConversations((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, title } : c))
                );
            }
        } catch (err) {
            console.error("Failed to rename conversation", err);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden">
            <TopBar
                onToggleApp={handleToggleApp}
                appSidebarOpen={appSidebarOpen}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* App Sidebar — always in flow */}
                <AppSidebar isOpen={appSidebarOpen} />

                {/* Chat Sidebar — w-72 open, w-0 closed */}
                <div
                    className={cn(
                        "h-full shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-zinc-800/60",
                        chatSidebarOpen ? "w-72" : "w-0 border-r-0"
                    )}
                >
                    <ChatSidebar
                        isOpen={chatSidebarOpen}
                        conversations={conversations}
                        activeId={currentConversationId}
                        onSelect={handleSelect}
                        onNewChat={handleNewChat}
                        onDelete={handleDelete}
                        onRename={handleRename}
                        onToggleChat={handleToggleChat}
                        loading={loadingConversations}
                    />
                </div>

                {/* Chat Area — flex-1 fills remaining space */}
                <div className="relative flex-1 min-w-0 overflow-hidden h-full bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.06),_transparent_60%)]">
                    {/* Floating reopen button when chat sidebar is closed */}
                    {!chatSidebarOpen && (
                        <button
                            onClick={handleToggleChat}
                            className="absolute left-4 top-4 z-10 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 hover:bg-zinc-800 transition-all duration-300 shadow-md backdrop-blur-md animate-[fadeIn_0.2s_ease_forwards]"
                            title="Open Chat List"
                        >
                            <PanelLeft className="w-4 h-4 text-zinc-300" />
                        </button>
                    )}
                    <ChatContainer
                        messages={messages}
                        loading={loading}
                        loadingMessages={loadingMessages}
                        conversationId={currentConversationId}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
}

export default function AskPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen bg-zinc-950">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <AskPageContent />
        </Suspense>
    );
}
