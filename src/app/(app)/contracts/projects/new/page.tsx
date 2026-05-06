"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { PROJECT_COLORS, type ProjectColor } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:        "",
    clientName:  "",
    description: "",
    color:       PROJECT_COLORS[0] as ProjectColor,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.clientName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/projects", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create project."); return; }
      router.push(`/contracts/projects/${data.project.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] font-mono">
        <Link href="/contracts" className="hover:text-[#0072E5] transition-colors">Contracts</Link>
        <span>/</span>
        <span>New Project</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/contracts"
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">New Project</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">Organise your SOWs and contracts under a project.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Project Name"
            id="name"
            placeholder="Nike Campaign Q1 2026"
            value={form.name}
            onChange={field("name")}
            required
          />

          <Input
            label="Client Name"
            id="clientName"
            placeholder="Nike Inc."
            value={form.clientName}
            onChange={field("clientName")}
            required
          />

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={field("description")}
              placeholder="Brief description of this project…"
              rows={3}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30 resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-2">
              Project Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color }))}
                  className="w-8 h-8 rounded-xl transition-all duration-150 focus:outline-none"
                  style={{
                    backgroundColor: color,
                    transform: form.color === color ? "scale(1.2)" : "scale(1)",
                    boxShadow: form.color === color ? `0 0 0 3px ${color}40, 0 0 0 1px ${color}` : "none",
                    outline: form.color === color ? `2px solid ${color}` : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] overflow-hidden">
            <div className="h-1" style={{ backgroundColor: form.color }} />
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${form.color}18` }}
              >
                <FolderOpen size={14} style={{ color: form.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--fg-primary)]">
                  {form.name || "Project Name"}
                </p>
                <p className="text-xs text-[var(--fg-muted)]">{form.clientName || "Client Name"}</p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!form.name.trim() || !form.clientName.trim()}
              className="w-full"
              glow
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
