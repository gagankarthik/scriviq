import Link from "next/link";
import { Suspense } from "react";
import { Upload, FileText } from "lucide-react";
import { CONTRACTS } from "@/lib/mock-data";
import { dbListContracts } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { ContractCard } from "@/components/domain/ContractCard";
import { ContractFilters } from "@/components/domain/ContractFilters";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; risk?: string; q?: string }>;
}) {
  const { status, risk, q } = await searchParams;
  const session = await getSession();
  const workspace = session?.workspace ?? "";

  let contracts;
  let total;
  let readyCount;

  try {
    const [filtered, all] = await Promise.all([
      dbListContracts(workspace, { status, risk, q }),
      dbListContracts(workspace),
    ]);
    contracts  = filtered;
    total      = all.length;
    readyCount = all.filter((c) => c.status === "ready").length;
    if (!all.length) throw new Error("empty");
  } catch {
    contracts  = CONTRACTS.filter((c) => {
      if (status && c.status !== status) return false;
      if (risk && c.riskScore !== risk) return false;
      if (q) {
        const qLower = q.toLowerCase();
        return c.title.toLowerCase().includes(qLower) || c.clientName.toLowerCase().includes(qLower);
      }
      return true;
    });
    total      = CONTRACTS.length;
    readyCount = CONTRACTS.filter((c) => c.status === "ready").length;
  }

  const hasFilters = !!(status || risk || q);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
            Contracts
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {total} total &middot; {readyCount} ready
          </p>
        </div>
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all shrink-0 btn-brand"
        >
          <Upload size={15} strokeWidth={2} />
          Upload contract
        </Link>
      </div>

      <Suspense>
        <ContractFilters />
      </Suspense>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--fg-muted)]">
            {contracts.length} contract{contracts.length !== 1 ? "s" : ""} match your filters
          </p>
          <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      {contracts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-subtle)] flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-[var(--fg-muted)]" />
          </div>
          <p className="text-[var(--fg-primary)] font-semibold mb-1">No contracts found</p>
          <p className="text-sm text-[var(--fg-muted)] mb-5">
            {hasFilters ? "Try adjusting your filters." : "Upload your first contract to get started."}
          </p>
          {hasFilters ? (
            <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
              Clear filters &rarr;
            </Link>
          ) : (
            <Link
              href="/contracts/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all btn-brand"
            >
              <Upload size={14} />
              Upload contract
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
