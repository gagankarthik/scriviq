"use client";

import { type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode, forwardRef } from "react";

const baseInput =
  "w-full rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40";

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?:boolean;
}

export function Label({ children, htmlFor, required }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  prefix?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = "", id, required, ...props }, ref) => (
    <div className="w-full">
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] text-sm select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          className={`${baseInput} ${prefix ? "pl-7" : ""} ${suffix ? "pr-7" : ""} ${
            error ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/40" : ""
          } ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] text-sm select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  children: ReactNode;
}

export function Select({ label, error, children, id, required, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <select
        id={id}
        required={required}
        className={`${baseInput} ${error ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/40" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
