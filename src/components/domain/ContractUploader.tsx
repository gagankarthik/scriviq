"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, type DragEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_SIZE_MB = 25;
const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContractUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ title: "", clientName: "", value: "", expiryDate: "" });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));
  }

  function validateFile(f: File): string {
    if (!ACCEPTED.includes(f.type)) return "Only PDF and DOCX files are supported.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
    return "";
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
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
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1400));
    router.push("/contracts");
  }

  const isReady = !!file && !!form.title && !!form.clientName;
  const fileType = file?.name.endsWith(".pdf") ? "PDF" : "DOCX";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop Zone */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">Contract File</p>
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragging
                ? "border-indigo-500 bg-indigo-950/20"
                : fileError
                ? "border-red-700/60 bg-red-950/10"
                : file
                ? "border-emerald-700/50 bg-emerald-950/10"
                : "border-slate-700/60 hover:border-slate-600 bg-slate-900/20"
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
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-sm font-mono font-bold text-slate-300 shrink-0">
                    {fileType}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatBytes(file.size)}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                      Ready to upload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setFileError(""); }}
                    className="text-slate-600 hover:text-slate-300 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-2xl text-slate-500 mb-4">
                  ↑
                </div>
                <p className="text-sm font-medium text-slate-300 mb-1">
                  Drop your contract here
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  PDF or DOCX, up to {MAX_SIZE_MB}MB
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Browse files
                </button>
              </div>
            )}
          </div>
          {fileError && (
            <p className="mt-2 text-xs text-red-400">{fileError}</p>
          )}
        </div>

        {/* Metadata Form */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-300">Contract Details</p>

          <Input
            label="Contract Title"
            id="title"
            placeholder="Acme Corp — Web Redesign SOW"
            value={form.title}
            onChange={set("title")}
            required
          />
          <Input
            label="Client Name"
            id="clientName"
            placeholder="Acme Corporation"
            value={form.clientName}
            onChange={set("clientName")}
            required
          />
          <Input
            label="Contract Value (optional)"
            id="value"
            type="number"
            placeholder="48000"
            prefix="$"
            value={form.value}
            onChange={set("value")}
          />
          <Input
            label="Expiry Date (optional)"
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={set("expiryDate")}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={processing}
              disabled={!isReady}
              className="w-full"
              glow
            >
              {processing ? "Uploading & extracting…" : "Upload & Extract Clauses"}
            </Button>
            <p className="text-xs text-slate-600 mt-2 text-center">
              AI extraction takes ~15 seconds
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
