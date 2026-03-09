"use client";

import { useState } from "react";
import { Plus, MessageSquare, Trash2, Pencil, Check, X, Loader2, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationItem {
    id: string;
    title: string;
    updatedAt: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    conversations: ConversationItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, title: string) => void;
    onToggleChat: () => void;
    loading?: boolean;
}

export function ChatSidebar({
    isOpen,
    conversations,
    activeId,
    onSelect,
    onNewChat,
    onDelete,
    onRename,
    onToggleChat,
    loading = false,
}: ChatSidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleRenameStart = (conv: ConversationItem) => {
        setEditingId(conv.id);
        setEditTitle(conv.title);
    };

    const handleRenameSubmit = (id: string) => {
        if (editTitle.trim()) {
            onRename(id, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleRenameCancel = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        onDelete(id);
        setTimeout(() => setDeletingId(null), 500);
    };

    return (
        <aside
            className="flex flex-col h-full min-w-[288px] bg-zinc-950/80 border-r border-zinc-800/60 backdrop-blur-md shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/60 shrink-0">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Chats
                </h2>
                <button onClick={onToggleChat} className="p-1 rounded-md hover:bg-zinc-800 transition-colors">
                    <PanelLeft className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
                </button>
            </div>

            {/* New Chat Button */}
            <div className="px-4 pt-4 pb-3 shrink-0">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-sm font-medium py-2.5 transition-all duration-300 shadow-md hover:shadow-blue-500/20 hover:scale-[1.02]"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-xs text-zinc-500">No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isActive = activeId === conv.id;
                        const isEditing = editingId === conv.id;
                        const isDeleting = deletingId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => !isEditing && onSelect(conv.id)}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200 hover:scale-[1.01]",
                                    isActive
                                        ? "bg-zinc-900/90 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-blue-500"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/80",
                                    isDeleting && "opacity-50 blur-sm scale-95"
                                )}
                            >
                                <MessageSquare className={cn(
                                    "w-4 h-4 shrink-0 transition-colors",
                                    isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-blue-400"
                                )} />

                                {isEditing ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleRenameSubmit(conv.id);
                                                if (e.key === "Escape") handleRenameCancel();
                                            }}
                                            className="flex-1 bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRenameSubmit(conv.id); }}
                                            className="p-1 hover:text-emerald-400 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRenameCancel(); }}
                                            className="p-1 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex-1 truncate font-medium">
                                            {conv.title}
                                        </span>
                                        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-zinc-900 via-zinc-900/95 to-transparent pl-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRenameStart(conv); }}
                                                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                                                title="Rename"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
