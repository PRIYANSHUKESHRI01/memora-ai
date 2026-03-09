"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
    className?: string;
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BackButton({
    className = "",
    label = "Back",
    variant = "ghost"
}: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={() => router.back()}
            className={`gap-1.5 pl-2.5 text-muted-foreground hover:text-foreground transition-colors ${className}`}
        >
            <ChevronLeft className="w-4 h-4" />
            <span>{label}</span>
        </Button>
    );
}
