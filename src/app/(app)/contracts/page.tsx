import Link from "next/link";
import { Suspense } from "react";
import { CONTRACTS, type Contract } from "@/lib/mock-data";
import { ContractCard } from "@/components/domain/ContractCard";
import { ContractFilters } from "@/components/domain/ContractFilters";

function filterContracts(
  contracts: Contract[],
  { status, risk, q }: { status?: string; risk?: string; q?: string }
): Contract[] {
  return contracts.filter((c) => {
    if (status && c.status !== status) return false;
    if (risk && c.riskScore !== risk) return false;
    if (q) {
      const query = q.toLowerCase();
      if (
        !c.title.toLowerCase().includes(query) &&
        !c.clientName.toLowerCase().includes(query)
      )
        return false;
    }
    return true;
  });
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; risk?: string; q?: string }>;
}) {
  const { status, risk, q } = await searchParams;
  const contracts = filterContracts(CONTRACTS, { status, risk, q });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Contracts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {CONTRACTS.length} total ·{" "}
            {CONTRACTS.filter((c) => c.status === "ready").length} ready
          </p>
        </div>
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shrink-0"
          style={{ boxShadow: "0 0 20px rgb(79 70 229 / 0.25)" }}
        >
          ↑ Upload contract
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <ContractFilters />
      </Suspense>

      {/* Results count */}
      {(status || risk || q) && (
        <p className="text-xs text-slate-500">
          {contracts.length} contract{contracts.length !== 1 ? "s" : ""} match
          your filters
        </p>
      )}

      {/* Grid */}
      {contracts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/40 bg-slate-900/10 py-20 text-center">
          <p className="text-2xl mb-3">⊡</p>
          <p className="text-slate-300 font-medium mb-1">No contracts found</p>
          <p className="text-sm text-slate-500 mb-5">
            Try adjusting your filters or upload a new contract.
          </p>
          <Link
            href="/contracts"
            className="text-xs text-indigo-400 hover:underline"
          >
            Clear filters →
          </Link>
        </div>
      )}
    </div>
  );
}
