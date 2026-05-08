import Link from "next/link";
import {
  Upload, Plus, FolderOpen, FileText, ShieldAlert,
  Layers, Filter,
} from "lucide-react";
import { dbListProjects, dbListContracts } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { ContractCard } from "@/components/domain/ContractCard";
import { formatCurrency } from "@/lib/utils";
import type { Project, Contract } from "@/lib/mock-data";

interface ProjectStats {
  contractCount: number;
  totalValue:    number;
  riskScore:     "low" | "medium" | "high" | null;
  highRiskCount: number;
}

function riskColor(risk: string | null) {
  if (risk === "high")   return "#ef4444";
  if (risk === "medium") return "#f59e0b";
  if (risk === "low")    return "#10b981";
  return "var(--fg-muted)";
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, stats }: { project: Project; stats: ProjectStats }) {
  return (
    <Link
      href={`/contracts/projects/${project.id}`}
      className="surface-card-hover group block overflow-hidden"
    >
      {/* Color stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: project.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="eyebrow truncate mb-1">{project.clientName}</p>
            <h3 className="text-base font-semibold text-[var(--fg-primary)] truncate group-hover:text-[#0072E5] dark:group-hover:text-[#75D8FC] transition-colors tracking-tight">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-[var(--fg-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${project.color}14`, border: `1px solid ${project.color}30` }}
          >
            <FolderOpen size={15} style={{ color: project.color }} />
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-0.5">Docs</p>
            <p className="text-sm font-bold font-mono text-[var(--fg-primary)]">{stats.contractCount}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-0.5">Value</p>
            <p className="text-sm font-bold font-mono text-[var(--fg-primary)] truncate">
              {stats.totalValue > 0 ? formatCurrency(stats.totalValue) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-0.5">High-Risk</p>
            <p className="text-sm font-bold font-mono" style={{ color: riskColor(stats.riskScore) }}>
              {stats.highRiskCount > 0 ? stats.highRiskCount : "—"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; risk?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const session   = await getSession();
  const workspace = session?.workspace ?? "";

  let projects: Awaited<ReturnType<typeof dbListProjects>> = [];
  let allContracts: Awaited<ReturnType<typeof dbListContracts>> = [];

  try {
    [projects, allContracts] = await Promise.all([
      dbListProjects(workspace),
      dbListContracts(workspace),
    ]);
  } catch { /* ignore */ }

  // Apply top-level filters to ungrouped (and we surface the count for projects too)
  const filterStatus = sp?.status;
  const filterRisk   = sp?.risk;

  function applyFilters(xs: Contract[]): Contract[] {
    let out = xs;
    if (filterStatus) out = out.filter((c) => c.status === filterStatus);
    if (filterRisk)   out = out.filter((c) => c.riskScore === filterRisk);
    return out;
  }

  // Per-project stats
  const statsMap = new Map<string, ProjectStats>();
  for (const p of projects) {
    const cs = allContracts.filter((c) => c.projectId === p.id);
    const totalValue = cs.reduce((s, c) => s + (c.contractValue ?? 0), 0);
    const risks = cs.map((c) => c.riskScore).filter(Boolean) as string[];
    const riskScore = risks.includes("high")
      ? "high"
      : risks.includes("medium")
      ? "medium"
      : risks.includes("low")
      ? "low"
      : null;
    const highRiskCount = cs.filter((c) => c.riskScore === "high").length;
    statsMap.set(p.id, { contractCount: cs.length, totalValue, riskScore, highRiskCount });
  }

  const ungrouped         = applyFilters(allContracts.filter((c) => !c.projectId));
  const totalReady        = allContracts.filter((c) => c.status === "ready").length;
  const totalProcessing   = allContracts.filter((c) => c.status === "processing").length;
  const portfolioValue    = allContracts.reduce((s, c) => s + (c.contractValue ?? 0), 0);
  const hasFilters        = !!(filterStatus || filterRisk);

  const FILTERS = [
    { label: "All",         status: undefined,    risk: undefined },
    { label: "Ready",       status: "ready",      risk: undefined },
    { label: "Processing",  status: "processing", risk: undefined },
    { label: "High risk",   status: undefined,    risk: "high"    },
    { label: "Medium risk", status: undefined,    risk: "medium"  },
  ] as const;

  function filterHref(f: { status?: string; risk?: string }): string {
    const params = new URLSearchParams();
    if (f.status) params.set("status", f.status);
    if (f.risk)   params.set("risk",   f.risk);
    const q = params.toString();
    return q ? `/contracts?${q}` : "/contracts";
  }

  function isActiveFilter(f: { status?: string; risk?: string }): boolean {
    if (!f.status && !f.risk) return !filterStatus && !filterRisk;
    return f.status === filterStatus && f.risk === filterRisk;
  }

  return (
    <div className="space-y-6">

      {/* ── Hero header ── */}
      <div className="surface-card overflow-hidden">
        <div className="px-6 sm:px-8 py-6 flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <p className="eyebrow mb-2">Document workspace</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg-primary)] tracking-tight">Contracts</h1>
            <p className="text-sm text-[var(--fg-secondary)] mt-1.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""} ·{" "}
              {allContracts.length} document{allContracts.length !== 1 ? "s" : ""} ·{" "}
              {portfolioValue > 0 ? formatCurrency(portfolioValue) : "$0"} portfolio value
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/contracts/projects/new" className="btn-secondary">
              <Plus size={14} />New Project
            </Link>
            <Link href="/contracts/upload" className="btn-primary">
              <Upload size={14} />Upload SOW
            </Link>
          </div>
        </div>

        {/* Filter strip */}
        <div className="px-6 sm:px-8 py-3 border-t border-[var(--border-subtle)] flex items-center gap-3 flex-wrap bg-[var(--surface-subtle)]/40">
          <Filter size={11} className="text-[var(--fg-muted)]" />
          <div className="flex items-center gap-1 flex-wrap">
            {FILTERS.map((f) => {
              const active = isActiveFilter(f);
              return (
                <Link
                  key={f.label}
                  href={filterHref(f)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                  style={
                    active
                      ? { backgroundColor: "rgba(0,114,229,0.12)", color: "#0072E5" }
                      : { color: "var(--fg-muted)" }
                  }
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
          <span className="ml-auto text-[10px] font-mono text-[var(--fg-muted)] hidden sm:inline">
            {totalReady} ready · {totalProcessing} processing
          </span>
        </div>
      </div>

      {/* ── Projects ── */}
      {projects.length === 0 ? (
        <div className="surface-card p-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(0,114,229,0.14), rgba(117,216,252,0.06))",
              border: "1px solid rgba(0,114,229,0.22)",
            }}
          >
            <Layers size={24} style={{ color: "#0072E5" }} />
          </div>
          <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-2 tracking-tight">No projects yet</h2>
          <p className="text-sm text-[var(--fg-secondary)] mb-6 max-w-md mx-auto leading-relaxed">
            Projects let you group contracts and amendments by client or engagement.
            Each project gets its own dashboard with cross-document conflict detection.
          </p>
          <Link href="/contracts/projects/new" className="btn-primary">
            <Plus size={14} />Create your first project
          </Link>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="section-head">
              <FolderOpen size={13} className="text-[var(--fg-muted)]" />
              <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Projects</h2>
              <span className="pill">{projects.length}</span>
            </div>
            <Link
              href="/contracts/projects/new"
              className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1"
            >
              <Plus size={11} />New project
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                stats={statsMap.get(p.id) ?? { contractCount: 0, totalValue: 0, riskScore: null, highRiskCount: 0 }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Ungrouped contracts ── */}
      {ungrouped.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-head">
                <FileText size={13} className="text-[var(--fg-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Ungrouped Documents</h2>
                <span className="pill">{ungrouped.length}</span>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">Documents not assigned to a project</p>
            </div>
            {hasFilters && (
              <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
                Clear filters
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ungrouped.map((c) => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        </section>
      )}

      {/* Empty ungrouped + has filters */}
      {ungrouped.length === 0 && hasFilters && allContracts.length > 0 && (
        <div className="surface-card p-12 text-center">
          <ShieldAlert size={20} className="mx-auto mb-3 text-[var(--fg-muted)]" />
          <p className="text-sm font-medium text-[var(--fg-primary)] mb-1">No documents match your filters</p>
          <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline mt-2 inline-block">
            Clear filters →
          </Link>
        </div>
      )}
    </div>
  );
}
