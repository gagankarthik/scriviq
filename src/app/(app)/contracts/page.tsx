import Link from "next/link";
import { Suspense } from "react";
import { Upload, Plus, FolderOpen, FileText, ShieldAlert, DollarSign } from "lucide-react";
import { dbListProjects, dbListContracts } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { ContractCard } from "@/components/domain/ContractCard";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@/lib/mock-data";

type ProjectStats = {
  contractCount: number;
  totalValue: number;
  riskScore: "low" | "medium" | "high" | null;
};

function riskColor(risk: string | null) {
  if (risk === "high")   return "#ef4444";
  if (risk === "medium") return "#f59e0b";
  if (risk === "low")    return "#10b981";
  return "var(--fg-muted)";
}

function riskLabel(risk: string | null) {
  if (risk === "high")   return "High risk";
  if (risk === "medium") return "Medium risk";
  if (risk === "low")    return "Low risk";
  return "No risk data";
}

function ProjectCard({ project, stats }: { project: Project; stats: ProjectStats }) {
  return (
    <Link
      href={`/contracts/projects/${project.id}`}
      className="group block rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Color stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-0.5 truncate">
              {project.clientName}
            </p>
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] truncate group-hover:text-[#75D8FC] transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-[var(--fg-muted)] mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${project.color}18`, border: `1px solid ${project.color}30` }}
          >
            <FolderOpen size={16} style={{ color: project.color }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
            <FileText size={11} />
            <span className="font-mono font-medium text-[var(--fg-secondary)]">{stats.contractCount}</span>
            <span>SOW{stats.contractCount !== 1 ? "s" : ""}</span>
          </div>

          {stats.totalValue > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
              <DollarSign size={11} />
              <span className="font-mono font-medium text-[var(--fg-secondary)]">
                {formatCurrency(stats.totalValue)}
              </span>
            </div>
          )}

          {stats.contractCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs ml-auto">
              <ShieldAlert size={11} style={{ color: riskColor(stats.riskScore) }} />
              <span className="font-medium" style={{ color: riskColor(stats.riskScore) }}>
                {riskLabel(stats.riskScore)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; risk?: string; q?: string }>;
}) {
  await searchParams; // consumed by filters below if needed
  const session   = await getSession();
  const workspace = session?.workspace ?? "";

  let projects: Awaited<ReturnType<typeof dbListProjects>> = [];
  let allContracts: Awaited<ReturnType<typeof dbListContracts>> = [];

  try {
    [projects, allContracts] = await Promise.all([
      dbListProjects(workspace),
      dbListContracts(workspace),
    ]);
  } catch {
    // DB unavailable
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
    statsMap.set(p.id, { contractCount: cs.length, totalValue, riskScore });
  }

  const ungrouped = allContracts.filter((c) => !c.projectId);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">Contracts</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} &middot; {allContracts.length} document{allContracts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/contracts/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium btn-brand"
        >
          <Plus size={15} strokeWidth={2} />
          New Project
        </Link>
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(0,114,229,0.12), rgba(117,216,252,0.06))",
              border: "1px solid rgba(0,114,229,0.2)",
            }}
          >
            <FolderOpen size={22} style={{ color: "#0072E5" }} />
          </div>
          <p className="text-base font-semibold text-[var(--fg-primary)] mb-1">No projects yet</p>
          <p className="text-sm text-[var(--fg-muted)] mb-6 max-w-xs mx-auto leading-relaxed">
            Create a project to organise your SOWs and contracts by client or engagement.
          </p>
          <Link
            href="/contracts/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-brand"
          >
            <Plus size={15} />
            Create your first project
          </Link>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Projects</h2>
              <span className="text-xs text-[var(--fg-muted)] font-mono">{projects.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  stats={statsMap.get(p.id) ?? { contractCount: 0, totalValue: 0, riskScore: null }}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Ungrouped contracts */}
      {ungrouped.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Ungrouped</h2>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">Contracts not assigned to a project</p>
            </div>
            <span className="text-xs text-[var(--fg-muted)] font-mono">{ungrouped.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ungrouped.map((c) => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
