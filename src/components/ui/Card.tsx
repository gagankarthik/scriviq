import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
}

export function Card({ children, className = "", padding = "p-5", hover }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/20 ${padding} ${
        hover ? "hover:bg-slate-900/50 hover:border-slate-700/60 transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
