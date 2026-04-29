import { type ReactNode } from "react";

interface CardProps {
  children:   ReactNode;
  className?: string;
  padding?:   string;
  hover?:     boolean;
}

export function Card({ children, className = "", padding = "p-5", hover }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] ${padding} ${
        hover
          ? "hover:border-indigo-500/20 hover:shadow-md transition-all duration-200"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
