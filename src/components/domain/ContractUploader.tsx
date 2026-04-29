"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, type DragEvent } from "react";
import {
  Upload, FileText, X, CheckCircle2, Zap,
  ScanLine, Brain, BarChart2, FileType2, ImageIcon,
  Plus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_SIZE_MB = 25;
const ACCEPTED_EXTS = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".tiff"];

type Stage = "idle" | "uploading" | "scanning" | "extracting" | "analyzing" | "done" | "error";

interface StageConfig {
  id: Stage;
  label: string;
  sub: string;
  Icon: React.ElementType;
  color: string;
}

const STAGES: StageConfig[] = [
  { id: "uploading",  label: "Uploading",         sub: "Securing your file in encrypted storage", Icon: Upload,    color: "#0072E5" },
  { id: "scanning",   label: "Scanning",           sub: "Detecting document structure & format",  Icon: ScanLine,  color: "#8b5cf6" },
  { id: "extracting", label: "Extracting Clauses", sub: "AI reading every legally significant clause", Icon: Brain, color: "#0072E5" },
  { id: "analyzing",  label: "Scoring Risk",       sub: "Assigning risk levels to each clause",   Icon: BarChart2, color: "#f59e0b" },
];

const STAGE_ORDER: Stage[] = ["uploading", "scanning", "extracting", "analyzing", "done"];

type SowType = "fixed-price" | "performance-based" | "loe";

interface QueuedFile {
  id:         string;
  file:       File;
  title:      string;
  clientName: string;
  value:      string;
  expiryDate: string;
  expanded:   boolean;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

function stageIndex(s: Stage) {
  return STAGE_ORDER.indexOf(s);
}

function genId() {
  return `contract-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function validateFile(f: File): string {
  const ok = ACCEPTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext)) ||
    ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type);
  if (!ok) return "Supported formats: PDF, DOCX, or scanned image.";
  if (f.size > MAX_SIZE_MB * 1_048_576) return `File must be under ${MAX_SIZE_MB} MB.`;
  return "";
}

// ── Processing Overlay ────────────────────────────────────────────────────────

function ProcessingOverlay({
  stage,
  queue,
  current,
  total,
}: {
  stage: Stage;
  queue: string[];
  current: number;
  total: number;
}) {
  const curIndex = stageIndex(stage);
  const currentStage = STAGES.find((s) => s.id === stage);

  const dots = [0, 1, 2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-base)]/90 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 space-y-8 text-center">

        {/* Top: multi-file indicator */}
        {total > 1 && (
          <div className="text-xs text-[var(--fg-muted)] font-mono">
            Processing {current + 1} of {total}
            {queue[current] && (
              <span className="ml-2 text-[var(--fg-secondary)] truncate max-w-[180px] inline-block align-bottom">{queue[current]}</span>
            )}
          </div>
        )}

        {/* Main stage icon */}
        {stage === "done" ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-scale-in"
              style={{ background: "rgba(16,185,129,0.15)", border: "2px solid #10b981" }}
            >
              <CheckCircle2 size={36} style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--fg-primary)]">
                {total > 1 ? `${total} contracts ready` : "Contract ready"}
              </p>
              <p className="text-sm text-[var(--fg-muted)] mt-1">Redirecting you now…</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Pulsing icon ring */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-20 h-20 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: currentStage?.color ?? "#0072E5" }}
              />
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${currentStage?.color ?? "#0072E5"}18`,
                  border: `2px solid ${currentStage?.color ?? "#0072E5"}40`,
                }}
              >
                {currentStage && (
                  <currentStage.Icon size={28} style={{ color: currentStage.color }} />
                )}
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-[var(--fg-primary)]">
                {currentStage?.label ?? "Processing"}
              </p>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                {currentStage?.sub}
                <span className="inline-flex ml-1 gap-0.5">
                  {dots.map((d) => (
                    <span
                      key={d}
                      className="w-1 h-1 rounded-full bg-[var(--fg-muted)]"
                      style={{ animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }}
                    />
                  ))}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Stage pipeline */}
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => {
            const done    = curIndex > i + 1 || stage === "done";
            const active  = curIndex === i + 1;
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      backgroundColor: done ? "#10b981" : active ? s.color : "var(--surface-elevated)",
                      border: `2px solid ${done ? "#10b981" : active ? s.color : "var(--border-color)"}`,
                      boxShadow: active ? `0 0 12px ${s.color}60` : "none",
                    }}
                  >
                    {done ? (
                      <CheckCircle2 size={13} color="#fff" />
                    ) : (
                      <s.Icon
                        size={12}
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
                    className="h-px flex-1 mx-1 rounded transition-all duration-700"
                    style={{ backgroundColor: done ? "#10b981" : "var(--border-color)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Multi-file queue preview */}
        {total > 1 && queue.length > 0 && (
          <div className="space-y-1.5">
            {queue.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: i === current ? "rgba(0,114,229,0.08)" : "var(--surface-elevated)",
                  border: `1px solid ${i === current ? "rgba(0,114,229,0.2)" : "var(--border-subtle)"}`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: i < current ? "#10b981" : i === current ? "#0072E5" : "var(--fg-muted)" }}
                />
                <span className="flex-1 truncate text-[var(--fg-secondary)]">{name}</span>
                {i < current && <CheckCircle2 size={11} style={{ color: "#10b981" }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── File card in queue ────────────────────────────────────────────────────────

function FileCard({
  item,
  onRemove,
  onChange,
}: {
  item: QueuedFile;
  onRemove: () => void;
  onChange: (patch: Partial<QueuedFile>) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => onChange({ expanded: !item.expanded })}
      >
        <FileText size={14} className="text-[var(--fg-muted)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{item.file.name}</p>
          <p className="text-[10px] text-[var(--fg-muted)]">
            {formatBytes(item.file.size)} · {item.file.name.split(".").pop()?.toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
        {item.expanded
          ? <ChevronUp size={13} className="text-[var(--fg-muted)] shrink-0" />
          : <ChevronDown size={13} className="text-[var(--fg-muted)] shrink-0" />}
      </div>

      {item.expanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3 space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">Title *</label>
            <input
              value={item.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
              placeholder="Contract title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">Contract Value</label>
              <input
                type="number"
                value={item.value}
                onChange={(e) => onChange({ value: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
                placeholder="e.g. 48000"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">Expiry Date</label>
              <input
                type="date"
                value={item.expiryDate}
                onChange={(e) => onChange({ expiryDate: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ContractUploader() {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Single-file state (original flow)
  const [file,      setFile]      = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [form,      setForm]      = useState({ title: "", clientName: "", value: "", expiryDate: "", sowType: "" as SowType | "" });

  // Bulk queue state
  const [bulkMode,     setBulkMode]     = useState(false);
  const [queue,        setQueue]        = useState<QueuedFile[]>([]);
  const [sharedClient, setSharedClient] = useState("");

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [stage,      setStage]      = useState<Stage>("idle");
  const [queueNames, setQueueNames] = useState<string[]>([]);
  const [queueIdx,   setQueueIdx]   = useState(0);

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
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
    if (bulkMode) {
      const files = Array.from(e.dataTransfer.files);
      addToQueue(files);
    } else {
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    }
  }

  function addToQueue(files: File[]) {
    const valid = files.filter((f) => !validateFile(f));
    setQueue((prev) => [
      ...prev,
      ...valid.map((f) => ({
        id:         genId(),
        file:       f,
        title:      f.name.replace(/\.(pdf|docx)$/i, "").replace(/[-_]/g, " "),
        clientName: sharedClient,
        value:      "",
        expiryDate: "",
        expanded:   true,
      })),
    ]);
  }

  const processOne = useCallback(async (
    contractId: string,
    f: File,
    title: string,
    clientName: string,
    value: string,
    expiryDate: string,
    sowType: SowType | "",
    idx: number,
    setIdx: (n: number) => void,
    setStg: (s: Stage) => void
  ) => {
    setIdx(idx);
    const fileType = f.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";

    setStg("uploading");
    const createRes = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contractId, title, clientName, fileType,
        contractValue: value ? Number(value) : undefined,
        expiryDate: expiryDate || undefined,
        ...(sowType && { sowType }),
      }),
    });

    if (createRes.ok) {
      const { uploadUrl } = await createRes.json();
      if (uploadUrl) {
        await fetch(uploadUrl, {
          method: "PUT",
          body: f,
          headers: { "Content-Type": f.type },
        }).catch(() => {});
      }
    }

    setStg("scanning");
    await new Promise((r) => setTimeout(r, 700));

    setStg("extracting");
    const extractForm = new FormData();
    extractForm.append("file", f, f.name);
    await fetch(`/api/contracts/${contractId}/extract`, {
      method: "POST",
      body: extractForm,
    }).catch(() => {});

    setStg("analyzing");
    await new Promise((r) => setTimeout(r, 500));
  }, []);

  async function handleSubmitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !form.title || !form.clientName) return;

    setProcessing(true);
    setQueueNames([form.title]);
    setQueueIdx(0);

    const contractId = genId();
    try {
      await processOne(contractId, file, form.title, form.clientName, form.value, form.expiryDate,
        form.sowType, 0, setQueueIdx, setStage);
      setStage("done");
      await new Promise((r) => setTimeout(r, 1200));
      router.push(`/contracts/${contractId}`);
    } catch {
      setStage("error");
      await new Promise((r) => setTimeout(r, 800));
      router.push("/contracts");
    }
  }

  async function handleSubmitBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!queue.length || !sharedClient) return;

    setProcessing(true);
    setQueueNames(queue.map((q) => q.title || q.file.name));

    const ids = queue.map(() => genId());

    try {
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        await processOne(
          ids[i], item.file,
          item.title || item.file.name,
          sharedClient,
          item.value, item.expiryDate,
          "", i, setQueueIdx, setStage
        );
      }
      setStage("done");
      await new Promise((r) => setTimeout(r, 1400));
      // Navigate to contracts list when multiple
      router.push(queue.length === 1 ? `/contracts/${ids[0]}` : "/contracts");
    } catch {
      setStage("error");
      await new Promise((r) => setTimeout(r, 800));
      router.push("/contracts");
    }
  }

  const isReady  = bulkMode
    ? queue.length > 0 && !!sharedClient
    : !!file && !!form.title && !!form.clientName;

  return (
    <>
      {/* Processing overlay */}
      {processing && (
        <ProcessingOverlay
          stage={stage}
          queue={queueNames}
          current={queueIdx}
          total={queueNames.length}
        />
      )}

      <form onSubmit={bulkMode ? handleSubmitBulk : handleSubmitSingle}>
        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setBulkMode(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              !bulkMode
                ? { backgroundColor: "#0072E5", color: "#fff" }
                : { backgroundColor: "var(--surface-subtle)", color: "var(--fg-muted)", border: "1px solid var(--border-color)" }
            }
          >
            <Upload size={13} />
            Single Upload
          </button>
          <button
            type="button"
            onClick={() => { setBulkMode(true); setFile(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              bulkMode
                ? { backgroundColor: "#0072E5", color: "#fff" }
                : { backgroundColor: "var(--surface-subtle)", color: "var(--fg-muted)", border: "1px solid var(--border-color)" }
            }
          >
            <Plus size={13} />
            Bulk Upload
          </button>
          {bulkMode && (
            <span className="text-xs text-[var(--fg-muted)] ml-2">
              Select multiple contracts — all processed with one click
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Drop zone ─── */}
          <div>
            <p className="text-sm font-semibold text-[var(--fg-secondary)] mb-3">
              {bulkMode ? "Contract Files" : "Contract File"}
            </p>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
                dragging
                  ? "border-[#0072E5] bg-[rgba(0,114,229,0.06)] scale-[1.01]"
                  : fileError
                  ? "border-red-400 dark:border-red-700/60 bg-red-50 dark:bg-red-950/10"
                  : file && !bulkMode
                  ? "border-emerald-400 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/10"
                  : "border-[var(--border-color)] hover:border-[rgba(0,114,229,0.5)] bg-[var(--surface-subtle)]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.tiff"
                multiple={bulkMode}
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (bulkMode) addToQueue(files);
                  else if (files[0]) handleFile(files[0]);
                }}
              />

              {!bulkMode && file ? (
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
                        <CheckCircle2 size={9} />Ready to upload
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFileError(""); }}
                      className="p-1 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
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
                    {bulkMode ? <Plus size={22} style={{ color: "#0072E5" }} /> : <Upload size={22} style={{ color: "#0072E5" }} />}
                  </div>
                  <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">
                    {bulkMode ? "Drop multiple contracts here" : "Drop your contract here"}
                  </p>
                  <p className="text-xs text-[var(--fg-muted)] mb-4">
                    PDF, DOCX, or scanned image — up to {MAX_SIZE_MB} MB each
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
              {[
                { label: "PDF",        Icon: FileType2,  color: "#ef4444" },
                { label: "DOCX",       Icon: FileText,   color: "#0072E5" },
                { label: "Image (OCR)", Icon: ImageIcon, color: "#f59e0b" },
              ].map(({ label, Icon, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg border"
                  style={{ color, backgroundColor: `${color}12`, borderColor: `${color}30` }}
                >
                  <Icon size={11} />
                  {label}
                </span>
              ))}
              <span className="text-[10px] text-[var(--fg-muted)] ml-auto">AES-256 encrypted</span>
            </div>

            {/* Bulk file queue */}
            {bulkMode && queue.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--fg-secondary)]">
                    {queue.length} file{queue.length !== 1 ? "s" : ""} queued
                  </p>
                  <button
                    type="button"
                    onClick={() => setQueue([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                {queue.map((item) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    onRemove={() => setQueue((p) => p.filter((q) => q.id !== item.id))}
                    onChange={(patch) => setQueue((p) => p.map((q) => q.id === item.id ? { ...q, ...patch } : q))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Metadata ────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[var(--fg-secondary)]">
              {bulkMode ? "Shared Details" : "Contract Details"}
            </p>

            {bulkMode ? (
              <>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={sharedClient}
                    onChange={(e) => {
                      setSharedClient(e.target.value);
                      setQueue((p) => p.map((q) => ({ ...q, clientName: e.target.value })));
                    }}
                    required
                    placeholder="e.g. Acme Corporation"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
                  />
                </div>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  Title, value, and expiry date can be customised per file by expanding each card above.
                </p>
              </>
            ) : (
              <>
                <Input label="Contract Title" id="title" placeholder="Acme Corp — Web Redesign SOW"
                  value={form.title} onChange={field("title")} required />
                <Input label="Client Name" id="clientName" placeholder="Acme Corporation"
                  value={form.clientName} onChange={field("clientName")} required />
                <Input label="Contract Value (optional)" id="value" type="number" placeholder="48000"
                  prefix="$" value={form.value} onChange={field("value")} />
                <Input label="Expiry Date (optional)" id="expiryDate" type="date"
                  value={form.expiryDate} onChange={field("expiryDate")} />
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    SOW Type (optional)
                  </label>
                  <select
                    value={form.sowType}
                    onChange={(e) => setForm((p) => ({ ...p, sowType: e.target.value as SowType | "" }))}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
                  >
                    <option value="">— Select type</option>
                    <option value="fixed-price">Fixed-Price</option>
                    <option value="performance-based">Performance-Based</option>
                    <option value="loe">Level of Effort (LOE)</option>
                  </select>
                </div>
              </>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isReady || processing}
                className="w-full"
                glow
              >
                <Zap size={15} strokeWidth={2} />
                {bulkMode
                  ? `Upload & Extract ${queue.length > 0 ? queue.length : ""} Contract${queue.length !== 1 ? "s" : ""}`
                  : "Upload & Extract Clauses"
                }
              </Button>
              <p className="text-xs text-[var(--fg-muted)] mt-2 text-center">
                GPT-4o extracts clauses in ~30s per document
              </p>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] p-4 space-y-2">
              {[
                { step: "1", text: "File stored securely in S3 (AES-256)" },
                { step: "2", text: "AI extracts all clause types & risk scores" },
                { step: "3", text: "Deadline alerts auto-created for every date" },
                { step: "4", text: "Related docs grouped by client automatically" },
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
    </>
  );
}
