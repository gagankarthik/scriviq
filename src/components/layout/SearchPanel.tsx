"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Loader2 } from "lucide-react";
import type { Contract } from "@/lib/mock-data";

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.contracts ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function navigate(id: string) {
    router.push(`/contracts/${id}`);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col border-l border-[var(--border-color)] shadow-2xl transition-transform duration-200"
        style={{
          backgroundColor: "var(--surface-elevated)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)]">
          {loading ? (
            <Loader2 size={15} className="text-[var(--fg-muted)] shrink-0 animate-spin" />
          ) : (
            <Search size={15} className="text-[var(--fg-muted)] shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contracts…"
            className="flex-1 bg-transparent text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!query.trim() && (
            <p className="text-xs text-[var(--fg-muted)] text-center py-10">
              Type to search contracts by name or client
            </p>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <p className="text-xs text-[var(--fg-muted)] text-center py-10">
              No contracts found for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-2 mb-2">
                Contracts ({results.length})
              </p>
              <div className="space-y-0.5">
                {results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(c.id)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-subtle)] transition-colors text-left"
                  >
                    <FileText
                      size={14}
                      className="text-[var(--fg-muted)] mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--fg-primary)] truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-[var(--fg-muted)] truncate">{c.clientName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--fg-muted)]">
            Press <kbd className="px-1 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
}
