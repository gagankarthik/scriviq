import Link from "next/link";
import { ContractUploader } from "@/components/domain/ContractUploader";
import { Brain, ShieldCheck, Bell } from "lucide-react";

const INFO_ITEMS = [
  {
    Icon: Brain,
    title: "13 clause types",
    desc: "Payment, renewal, IP, termination, and more",
  },
  {
    Icon: ShieldCheck,
    title: "Risk scoring",
    desc: "Every clause scored Low, Medium, or High",
  },
  {
    Icon: Bell,
    title: "Deadline alerts",
    desc: "Automatic reminders at 7d and 1d before due",
  },
];

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] mb-3 font-mono">
          <Link
            href="/contracts"
            className="hover:text-[#0072E5] transition-colors"
          >
            Contracts
          </Link>
          <span>/</span>
          <span>Upload</span>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--fg-primary)] tracking-tight">
          Upload Contract
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Upload a PDF or DOCX â€” scriviq extracts every clause in ~15 seconds.
        </p>
      </div>

      {/* Uploader card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <ContractUploader />
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INFO_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]"
          >
            <Icon
              size={18}
              strokeWidth={1.75}
              className="text-[#0072E5] shrink-0 mt-0.5"
            />
            <div>
              <p className="text-xs font-semibold text-[var(--fg-primary)]">
                {title}
              </p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

