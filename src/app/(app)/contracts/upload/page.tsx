import Link from "next/link";
import { ContractUploader } from "@/components/domain/ContractUploader";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-mono">
          <Link href="/contracts" className="hover:text-indigo-400 transition-colors">
            Contracts
          </Link>
          <span>/</span>
          <span>Upload</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Upload Contract
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a PDF or DOCX — scriviq extracts every clause in ~15 seconds.
        </p>
      </div>

      {/* Uploader card */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
        <ContractUploader />
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "⊡", title: "13 clause types", desc: "Payment, renewal, IP, termination, and more" },
          { icon: "◈", title: "Risk scoring", desc: "Every clause scored Low, Medium, or High" },
          { icon: "◎", title: "Deadline alerts", desc: "Automatic reminders at 7d and 1d before due" },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/20 border border-slate-800/40"
          >
            <span className="text-indigo-400 text-lg shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
