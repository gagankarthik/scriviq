import { type ReactNode } from "react";

type Variant = "indigo" | "amber" | "red" | "green" | "slate" | "default";
type Size = "sm" | "md";

const variantStyles: Record<Variant, string> = {
  indigo: "bg-indigo-950/60 text-indigo-400 border-indigo-800/50",
  amber:  "bg-amber-950/60 text-amber-400 border-amber-800/50",
  red:    "bg-red-950/60 text-red-400 border-red-800/50",
  green:  "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
  slate:  "bg-slate-800/60 text-slate-400 border-slate-700/50",
  default:"bg-slate-800/60 text-slate-300 border-slate-700/50",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "sm",
  dot,
  pulse,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold uppercase tracking-wider border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`}
        />
      )}
      {children}
    </span>
  );
}
