import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ask AI",
    description: "Chat with your knowledge base",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {children}
        </div>
    );
}
