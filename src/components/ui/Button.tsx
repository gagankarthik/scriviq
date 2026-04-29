"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "secondary";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#0072E5] hover:bg-[#0058b3] text-white",
  ghost:
    "border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:border-[var(--border-color)] bg-transparent",
  secondary:
    "bg-[var(--surface-subtle)] hover:bg-[var(--surface-base)] text-[var(--fg-secondary)] border border-[var(--border-color)]",
  danger:
    "bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3.5 text-base gap-2 rounded-xl",
};

interface ButtonProps {
  variant?:  Variant;
  size?:     Size;
  href?:     string;
  loading?:  boolean;
  disabled?: boolean;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  className?:string;
  children:  ReactNode;
  glow?:     boolean;
}

export function Button({
  variant = "primary",
  size    = "md",
  href,
  loading,
  disabled,
  onClick,
  type     = "button",
  className = "",
  children,
  glow,
}: ButtonProps) {
  const base = `inline-flex items-center justify-center font-medium transition-all duration-150 select-none ${
    disabled || loading ? "opacity-50 cursor-not-allowed" : ""
  } ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const glowStyle =
    glow && variant === "primary"
      ? { boxShadow: "0 0 20px rgba(0,114,229,0.35)" }
      : undefined;

  const content = loading ? (
    <>
      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {children}
    </>
  ) : children;

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={base} style={glowStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={base}
      style={glowStyle}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
}
