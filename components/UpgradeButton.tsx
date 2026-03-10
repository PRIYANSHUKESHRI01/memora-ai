"use client";

import { useState } from "react";

interface UpgradeButtonProps {
    plan: "pro" | "enterprise";
    label?: string;
    className?: string;
}

export function UpgradeButton({
    plan,
    label,
    className = "",
}: UpgradeButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/paypal/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create subscription");
            }

            // Redirect to PayPal approval page
            if (data.approvalUrl) {
                window.open(data.approvalUrl, "_blank");
            } else {
                throw new Error("No approval URL received");
            }
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
        }
    };

    const buttonLabel = label || `Upgrade to ${plan === "pro" ? "Pro" : "Enterprise"}`;

    return (
        <div className="w-full">
            <button
                id={`upgrade-btn-${plan}`}
                onClick={handleUpgrade}
                disabled={loading}
                className={`
          w-full py-3 px-6 rounded-xl font-semibold text-sm
          transition-all duration-300 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${plan === "pro"
                        ? "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                    }
          ${className}
        `}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Redirecting to PayPal…
                    </span>
                ) : (
                    buttonLabel
                )}
            </button>
            {error && (
                <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
            )}
        </div>
    );
}
