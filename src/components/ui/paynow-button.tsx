"use client";

import React, { useState } from "react";
import { payWithPayNow } from "@/lib/paynow-client";

interface PayNowButtonProps {
  amount: number;
  itemName: string;
  description?: string;
  label?: string;
  variant?: "pink" | "green" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  pink: "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/30",
  green: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25",
  outline: "border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
  xl: "px-10 py-4 text-lg",
};

export function PayNowButton({
  amount,
  itemName,
  description,
  label,
  variant = "pink",
  size = "md",
  fullWidth = false,
  icon,
  className = "",
  children,
  onSuccess,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await payWithPayNow(amount, itemName, description);
      if (result.success && result.redirectUrl) {
        // Store the item info in sessionStorage so the verify page can trigger download
        if (onSuccess) {
          sessionStorage.setItem("pendingDownload", JSON.stringify({ itemName, amount }));
        }
        window.location.href = result.redirectUrl;
      } else {
        alert("Payment failed: " + (result.error || "Could not initiate payment"));
      }
    } catch {
      alert("Payment error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${loading ? "opacity-70" : ""} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {icon}
          {children || label || `Pay $${amount}`}
        </>
      )}
    </button>
  );
}