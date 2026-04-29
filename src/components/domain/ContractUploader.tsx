"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, type DragEvent } from "react";
import { Upload, FileText, X, CheckCircle2, Zap } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_SIZE_MB = 25;
const ACCEPTED    = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function formatBytes(bytes: number): string {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return `contract-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ContractUploader() {
  const router    = useRouter();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [file,       setFile]       = useState<File | null>(null);
  const [fileError,  setFileError]  = useState("");
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState<"idle" | "uploading" | "extracting" | "done">("idle");
  const [form, setForm] = useState({ title: "", clientName: "", value: "", expiryDate: "" });

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  function validateFile(f: File): string {
    if (!ACCEPTED.includes(f.type)) return "Only PDF and DOCX files are supported.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
    return "";
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    setFileError(err);
    if (!err) {
      setFile(f);
      if (!form.title) setForm((p) => ({ ...p, title: f.name.replace(/\.(pdf|docx)$/i, "").replace(/[-_]/g, " ") }));
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
    setProgress("uploading");

    const contractId = generateId();
    const fileType   = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";

    try {
      // 1. Create contract record + get presigned URL
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

        // 2. Upload file to S3
        if (uploadUrl) {
          await fetch(uploadUrl, {
            method:  "PUT",
            body:    file,
            headers: { "Content-Type": file.type },
          });
        }
      }

      // 3. Trigger AI extraction
      setProgress("extracting");
      await fetch(`/api/contracts/${contractId}/extract`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: "" }),
      }).catch(() => {});

      setProgress("done");
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/contracts/${contractId}`);
    } catch {
      // Fallback: just navigate to contracts list
      setProgress("done");
      await new Promise((r) => setTimeout(r, 600));
      router.push("/contracts");
    }
  }

  const isReady  = !!file && !!form.title && !!form.clientName;
  const fileType = file?.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";

  const progressLabel: Record<typeof progress, string> = {
    idle:       "Upload & Extract Clauses",
    uploading:  "Uploading to S3…",
    extracting: "AI extracting clauses…",
    done:       "Done! Redirecting…",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop zone */}
        <div>
          <p className="text-sm font-semibold text-[var(--fg-secondary)] mb-3">Contract File</p>
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragging   ? "border-[#0072E5] bg-[rgba(0,114,229,0.06)]"
              : fileError ? "border-red-400 dark:border-red-700/60 bg-red-50 dark:bg-red-950/10"
              : file      ? "border-emerald-400 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/10"
              : "border-[var(--border-color)] hover:border-[rgba(0,114,229,0.5)] bg-[var(--surface-subtle)]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
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
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">{formatBytes(file.size)} · {fileType}</p>
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
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(0,114,229,0.1)", borderColor: "rgba(0,114,229,0.2)" }}
                >
                  <Upload size={22} style={{ color: "#0072E5" }} />
                </div>
                <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">
                  Drop your contract here
                </p>
                <p className="text-xs text-[var(--fg-muted)] mb-4">PDF or DOCX, up to {MAX_SIZE_MB}MB</p>
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
        </div>

        {/* Metadata */}
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
                progressLabel[progress]
              ) : (
                <>
                  <Zap size={15} strokeWidth={2} />
                  Upload & Extract Clauses
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
              "File is stored securely in S3",
              "AI extracts clauses & risk scores",
              "Deadline alerts auto-created",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-[var(--fg-secondary)]">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: "rgba(0,114,229,0.12)", color: "#75D8FC" }}
                >
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
