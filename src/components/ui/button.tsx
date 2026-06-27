"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "pink" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = "relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-white text-black hover:bg-white/90 active:scale-[0.97]",
    secondary: "bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.97] shadow-lg shadow-pink-500/25",
    outline: "border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:scale-[0.97]",
    ghost: "text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.97]",
    pink: "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/30 active:scale-[0.97]",
    dark: "bg-dark-900 text-white hover:bg-dark-800 border border-white/10 active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3 text-base gap-2.5",
    xl: "px-10 py-4 text-lg gap-3",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}

export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400/50";
  const variants = {
    primary: "bg-white text-black hover:bg-white/90",
    secondary: "bg-pink-500 text-white hover:bg-pink-600",
    outline: "border border-white/20 text-white hover:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/10",
    pink: "bg-pink-500 text-white hover:bg-pink-600",
    dark: "bg-dark-900 text-white hover:bg-dark-800 border border-white/10",
  };
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}