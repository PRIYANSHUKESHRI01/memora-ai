import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Sidebar />
            <main className="lg:pl-64">
                <div className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_60%)] min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
