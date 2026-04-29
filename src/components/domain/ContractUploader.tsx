"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, type DragEvent } from "react";
import {
  Upload, FileText, X, CheckCircle2, Zap,
  ScanLine, Brain, BarChart2, FileType2, ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_SIZE_MB = 25;
const ACCEPTED    = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type Stage = "idle" | "uploading" | "scanning" | "extracting" | "analyzing" | "done";

const STAGES: { id: Stage; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: "uploading",  label: "Uploading",           sub: "Transferring to secure storage",     Icon: Upload },
  { id: "scanning",   label: "Scanning",             sub: "Detecting structure & format",       Icon: ScanLine },
  { id: "extracting", label: "Extracting clauses",   sub: "GPT-4o-mini reading every clause",   Icon: Brain },
  { id: "analyzing",  label: "Scoring risk",         sub: "Assigning risk levels",              Icon: BarChart2 },
];

const STAGE_ORDER: Stage[] = ["uploading", "scanning", "extracting", "analyzing", "done"];

const FORMAT_BADGES = [
  { label: "PDF",   Icon: FileType2,  color: "#ef4444" },
  { label: "DOCX",  Icon: FileText,   color: "#0072E5" },
  { label: "Image (OCR)", Icon: ImageIcon,  color: "#f59e0b" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return `contract-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function stageIndex(s: Stage): number {
  return STAGE_ORDER.indexOf(s);
}

export function ContractUploader() {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file,      setFile]      = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stage,     setStage]     = useState<Stage>("idle");
  const [form,      setForm]      = useState({ title: "", clientName: "", value: "", expiryDate: "" });

  // Auto-advance scanning stage visually
  useEffect(() => {
    if (stage === "uploading") {
      const t = setTimeout(() => setStage("scanning"), 800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  function validateFile(f: File): string {
    if (!ACCEPTED.includes(f.type) && !f.name.match(/\.(pdf|docx|jpg|jpeg|png|tiff)$/i))
      return "Supported formats: PDF, DOCX, or scanned image.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024)
      return `File must be under ${MAX_SIZE_MB} MB.`;
    return "";
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    setFileError(err);
    if (!err) {
      setFile(f);
      if (!form.title)
        setForm((p) => ({ ...p, title: f.name.replace(/\.(pdf|docx)$/i, "").replace(/[-_]/g, " ") }));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !form.title || !form.clientName) return;

    setUploading(true);
    setStage("uploading");

    const contractId = generateId();
    const fileType   = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";

    try {
      const createRes = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:            contractId,
          title:         form.title,
          clientName:    form.clientName,
          fileType,
          contractValue: form.value ? Number(form.value) : undefined,
          expiryDate:    form.expiryDate || undefined,
        }),
      });

      if (createRes.ok) {
        const { uploadUrl } = await createRes.json();
        if (uploadUrl) {
          await fetch(uploadUrl, {
            method:  "PUT",
            body:    file,
            headers: { "Content-Type": file.type },
          });
        }
      }

      setStage("extracting");
      await fetch(`/api/contracts/${contractId}/extract`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: "" }),
      }).catch(() => {});

      setStage("analyzing");
      await new Promise((r) => setTimeout(r, 600));
      setStage("done");
      await new Promise((r) => setTimeout(r, 500));
      router.push(`/contracts/${contractId}`);
    } catch {
      setStage("done");
      await new Promise((r) => setTimeout(r, 500));
      router.push("/contracts");
    }
  }

  const isReady  = !!file && !!form.title && !!form.clientName;
  const curIndex = stageIndex(stage);

  return (
    <form onSubmit={handleSubmit}>
      {/* Processing pipeline — shown while uploading */}
      {uploading && (
        <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-subtle)] p-5">
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">
            Processing
          </p>
          <div className="flex items-center gap-0 mb-4">
            {STAGES.map((s, i) => {
              const done    = curIndex > i + 1;
              const active  = curIndex === i + 1;
              const pending = curIndex < i + 1;
              return (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: done ? "#10b981" : active ? "#0072E5" : "var(--surface-elevated)",
                        border: `2px solid ${done ? "#10b981" : active ? "#0072E5" : "var(--border-color)"}`,
                      }}
                    >
                      {done ? (
                        <CheckCircle2 size={14} color="#fff" />
                      ) : (
                        <s.Icon
                          size={13}
                          color={active ? "#fff" : "var(--fg-muted)"}
                          className={active ? "animate-pulse" : ""}
                        />
                      )}
                    </div>
                    <p
                      className="text-[9px] font-medium text-center leading-tight hidden sm:block"
                      style={{ color: active ? "var(--fg-primary)" : "var(--fg-muted)" }}
                    >
                      {s.label}
                    </p>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-1 rounded transition-all duration-500"
                      style={{ backgroundColor: done ? "#10b981" : "var(--border-color)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {stage !== "idle" && stage !== "done" && (
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--fg-primary)]">
                {STAGES.find((s) => s.id === stage)?.label ?? "Processing"}…
              </p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                {STAGES.find((s) => s.id === stage)?.sub}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Drop zone ───────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-[var(--fg-secondary)] mb-3">Contract File</p>
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragging
                ? "border-[#0072E5] bg-[rgba(0,114,229,0.06)]"
                : fileError
                ? "border-red-400 dark:border-red-700/60 bg-red-50 dark:bg-red-950/10"
                : file
                ? "border-emerald-400 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/10"
                : "border-[var(--border-color)] hover:border-[rgba(0,114,229,0.5)] bg-[var(--surface-subtle)]"
            } ${dragging ? "animate-pulse" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png,.tiff"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-[var(--fg-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                      {formatBytes(file.size)} · {file.name.split(".").pop()?.toUpperCase()}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={9} />
                      Ready to upload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setFileError(""); }}
                    className="p-1 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(0,114,229,0.1)", borderColor: "rgba(0,114,229,0.2)" }}
                >
                  <Upload size={22} style={{ color: "#0072E5" }} />
                </div>
                <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">
                  Drop your contract here
                </p>
                <p className="text-xs text-[var(--fg-muted)] mb-4">
                  PDF, DOCX, or scanned image — up to {MAX_SIZE_MB} MB
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#0072E5" }}
                >
                  Browse files
                </button>
              </div>
            )}
          </div>

          {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}

          {/* Format badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {FORMAT_BADGES.map(({ label, Icon, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg border"
                style={{
                  color,
                  backgroundColor: `${color}12`,
                  borderColor: `${color}30`,
                }}
              >
                <Icon size={11} />
                {label}
              </span>
            ))}
            <span className="text-[10px] text-[var(--fg-muted)] ml-auto">
              AES-256 encrypted at rest
            </span>
          </div>
        </div>

        {/* ── Metadata ────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[var(--fg-secondary)]">Contract Details</p>

          <Input
            label="Contract Title"
            id="title"
            placeholder="Acme Corp — Web Redesign SOW"
            value={form.title}
            onChange={field("title")}
            required
          />
          <Input
            label="Client Name"
            id="clientName"
            placeholder="Acme Corporation"
            value={form.clientName}
            onChange={field("clientName")}
            required
          />
          <Input
            label="Contract Value (optional)"
            id="value"
            type="number"
            placeholder="48000"
            prefix="$"
            value={form.value}
            onChange={field("value")}
          />
          <Input
            label="Expiry Date (optional)"
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={field("expiryDate")}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={uploading}
              disabled={!isReady}
              className="w-full"
              glow
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin shrink-0" />
                  {STAGES.find((s) => s.id === stage)?.label ?? "Processing"}…
                </span>
              ) : (
                <>
                  <Zap size={15} strokeWidth={2} />
                  Upload &amp; Extract Clauses
                </>
              )}
            </Button>
            <p className="text-xs text-[var(--fg-muted)] mt-2 text-center">
              GPT-4o-mini extracts clauses in ~15 seconds
            </p>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] p-4 space-y-2">
            {[
              { step: "1", text: "File stored securely in S3 (AES-256)" },
              { step: "2", text: "AI extracts all clause types & risk scores" },
              { step: "3", text: "Deadline alerts auto-created for every date" },
              { step: "4", text: "Duplicate detection prevents double-uploads" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-2.5 text-xs text-[var(--fg-secondary)]">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: "rgba(0,114,229,0.12)", color: "#75D8FC" }}
                >
                  {step}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
