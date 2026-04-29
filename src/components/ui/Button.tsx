"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "secondary";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white",
  ghost:
    "border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 bg-transparent",
  secondary:
    "bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border border-slate-700/40",
  danger:
    "bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-800/40",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3.5 text-base gap-2 rounded-xl",
};

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: ReactNode;
  glow?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  loading,
  disabled,
  onClick,
  type = "button",
  className = "",
  children,
  glow,
}: ButtonProps) {
  const base = `inline-flex items-center justify-center font-medium transition-all duration-150 select-none ${
    disabled || loading ? "opacity-50 cursor-not-allowed" : ""
  } ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const glowStyle =
    glow && variant === "primary"
      ? { boxShadow: "0 0 20px rgb(79 70 229 / 0.3)" }
      : undefined;

  const content = loading ? (
    <>
      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {children}
    </>
  ) : (
    children
  );

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
