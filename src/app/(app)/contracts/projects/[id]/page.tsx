import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft, Upload, FileText, DollarSign,
  ShieldAlert, Clock, FolderOpen,
} from "lucide-react";
import { dbGetProject, dbListContracts, dbListClauses, dbGetProjectConsolidation } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { ContractCard } from "@/components/domain/ContractCard";
import { ContractFilters } from "@/components/domain/ContractFilters";
import { ProjectDocumentIntelligence } from "@/components/domain/ProjectDocumentIntelligence";
import { formatCurrency } from "@/lib/utils";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; risk?: string; q?: string }>;
}) {
  const { id }             = await params;
  const { status, risk, q } = await searchParams;
  const session             = await getSession();
  const workspace           = session?.workspace ?? "";

  let project   = null as Awaited<ReturnType<typeof dbGetProject>>;
  let allContracts: Awaited<ReturnType<typeof dbListContracts>> = [];

  try {
    [project, allContracts] = await Promise.all([
      dbGetProject(workspace, id),
      dbListContracts(workspace, { projectId: id }),
    ]);
  } catch { /* DB unavailable */ }

  const consolidation = await dbGetProjectConsolidation(workspace, id).catch(() => null);

  if (!project) notFound();

  // Apply filters within project
  let contracts = allContracts as Awaited<ReturnType<typeof dbListContracts>>;
  if (status) contracts = contracts.filter((c) => c.status === status);
  if (risk)   contracts = contracts.filter((c) => c.riskScore === risk);
  if (q) {
    const lq = q.toLowerCase();
    contracts = contracts.filter(
      (c) => c.title.toLowerCase().includes(lq) || c.clientName.toLowerCase().includes(lq)
    );
  }

  const hasFilters = !!(status || risk || q);

  // Stats from all contracts (unfiltered)
  const ready      = allContracts.filter((c) => c.status === "ready");
  const totalValue = ready.reduce((s, c) => s + (c.contractValue ?? 0), 0);

  let highRiskCount    = 0;
  let upcomingCount    = 0;
  const today = Date.now();
  const in30  = today + 30 * 86_400_000;

  try {
    const allClauses = (
      await Promise.all(ready.map((c) => dbListClauses(workspace, c.id)))
    ).flat();
    highRiskCount = allClauses.filter(
      (cl) => cl.riskLevel === "high" && cl.status === "active"
    ).length;
    upcomingCount = allClauses.filter((cl) => {
      if (!cl.dueDate) return false;
      const d = new Date(cl.dueDate).getTime();
      return d >= today && d <= in30;
    }).length;
  } catch { /* clause fetch failed */ }

  const basePath = `/contracts/projects/${id}`;

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] font-mono">
        <Link href="/contracts" className="hover:text-[#0072E5] transition-colors">Contracts</Link>
        <span>/</span>
        <span className="text-[var(--fg-secondary)] truncate">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link
            href="/contracts"
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
                {project.name}
              </h1>
            </div>
            <p className="text-sm text-[var(--fg-muted)]">
              {project.clientName}
              {project.description && (
                <span className="ml-2 text-[var(--fg-muted)]/70">— {project.description}</span>
              )}
            </p>
          </div>
        </div>

        <Link
          href={`/contracts/upload?projectId=${id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium btn-brand shrink-0"
        >
          <Upload size={15} strokeWidth={2} />
          Upload SOW
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Documents",
            value: String(allContracts.length),
            Icon: FileText,
            color: project.color,
          },
          {
            label: "Total Value",
            value: totalValue > 0 ? formatCurrency(totalValue) : "—",
            Icon: DollarSign,
            color: "#0072E5",
          },
          {
            label: "High-Risk Clauses",
            value: String(highRiskCount),
            Icon: ShieldAlert,
            color: highRiskCount > 0 ? "#ef4444" : "#10b981",
          },
          {
            label: "Due in 30 days",
            value: String(upcomingCount),
            Icon: Clock,
            color: upcomingCount > 0 ? "#f59e0b" : "var(--fg-muted)",
          },
        ].map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-[3px]"
            style={{ borderLeftColor: color as string }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {label}
              </p>
              <Icon size={13} style={{ color: color as string }} />
            </div>
            <p className="text-xl font-bold font-mono tracking-tight text-[var(--fg-primary)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Document Intelligence */}
      <ProjectDocumentIntelligence
        projectId={id}
        projectColor={project.color}
        initialConsolidation={consolidation}
      />

      {/* Filters */}
      <Suspense>
        <ContractFilters basePath={basePath} />
      </Suspense>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--fg-muted)]">
            {contracts.length} document{contracts.length !== 1 ? "s" : ""} match your filters
          </p>
          <Link href={basePath} className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      {/* Contracts grid */}
      {contracts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-20 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${project.color}18`, border: `1px solid ${project.color}30` }}
          >
            <FolderOpen size={20} style={{ color: project.color }} />
          </div>
          <p className="text-[var(--fg-primary)] font-semibold mb-1">
            {hasFilters ? "No documents match your filters" : "No documents yet"}
          </p>
          <p className="text-sm text-[var(--fg-muted)] mb-5">
            {hasFilters
              ? "Try adjusting your filters."
              : "Upload your first SOW to start extracting clauses and tracking risk."}
          </p>
          {hasFilters ? (
            <Link href={basePath} className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
              Clear filters &rarr;
            </Link>
          ) : (
            <Link
              href={`/contracts/upload?projectId=${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium btn-brand"
            >
              <Upload size={14} />
              Upload SOW
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
