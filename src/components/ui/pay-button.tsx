"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { redirectToCheckout, CheckoutItem } from "@/lib/stripe/checkout";
import toast from "react-hot-toast";

interface PayButtonProps {
  items: CheckoutItem[];
  metadata?: Record<string, string>;
  variant?: "pink" | "outline" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function PayButton({
  items,
  metadata,
  variant = "pink",
  size = "sm",
  fullWidth = false,
  label = "Buy Now",
  icon,
  disabled = false,
  className = "",
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await redirectToCheckout(items, metadata);
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      onClick={handleClick}
      disabled={disabled}
      icon={icon}
      className={className}
    >
      {loading ? "Processing..." : label}
    </Button>
  );
}