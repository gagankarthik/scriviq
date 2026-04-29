import Link from "next/link";
import { FileX } from "lucide-react";

export default function ContractNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex items-center justify-center mb-6">
        <FileX size={28} strokeWidth={1.5} className="text-[var(--fg-muted)]" />
      </div>
      <p className="text-4xl mb-4 font-mono text-[var(--fg-muted)]">404</p>
      <h2 className="text-xl font-semibold text-[var(--fg-primary)] mb-2">
        Contract not found
      </h2>
      <p className="text-sm text-[var(--fg-muted)] max-w-sm mb-6">
        This contract may have been deleted or you may not have access to view
        it.
      </p>
      <Link
        href="/contracts"
        className="text-sm text-indigo-500 hover:underline"
      >
        ← Back to contracts
      </Link>
    </div>
  );
}
