import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, ShieldCheck, Bell, FolderOpen } from "lucide-react";
import { ContractUploader } from "@/components/domain/ContractUploader";
import { getSession } from "@/lib/auth/session";
import { dbGetProject, dbListContracts } from "@/lib/aws/contracts";

const INFO_ITEMS = [
  { Icon: Brain,      title: "13 clause types",  desc: "Payment, renewal, IP, termination, and more" },
  { Icon: ShieldCheck, title: "Risk scoring",     desc: "Every clause scored Low, Medium, or High" },
  { Icon: Bell,       title: "Deadline alerts",   desc: "Automatic reminders at 7d and 1d before due" },
];

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; force?: string }>;
}) {
  const { projectId, force } = await searchParams;
  const session       = await getSession();
  const workspace     = session?.workspace ?? "";

  let project = null;
  if (projectId) {
    try { project = await dbGetProject(workspace, projectId); } catch {}
  }

  // ── Auto-amendment routing ───────────────────────────────────────────────
  // If user is uploading into a project that already has a v1 document, send
  // them to that document's amendment upload (it becomes v2, v3, v4...).
  // `?force=new` overrides this for the rare case the user explicitly wants
  // a brand-new master document in the same project.
  if (project && projectId && force !== "new") {
    const existing = await dbListContracts(workspace, { projectId }).catch(() => []);
    if (existing.length > 0) {
      // Master = oldest contract in the project
      const master = [...existing].sort(
        (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      )[0];
      redirect(`/contracts/${master.id}?upload=amendment#amendments`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] font-mono">
        <Link href="/contracts" className="hover:text-[#0072E5] transition-colors">Contracts</Link>
        {project && (
          <>
            <span>/</span>
            <Link
              href={`/contracts/projects/${projectId}`}
              className="hover:text-[#0072E5] transition-colors truncate max-w-[160px]"
            >
              {project.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span>Upload</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--fg-primary)] tracking-tight">
          {project ? `Upload v1 to ${project.name}` : "Upload contract"}
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          {project
            ? "This will be the master document. Future uploads to this project become amendments (v2, v3, …)."
            : "Scriviq extracts every clause in ~15 seconds."}
        </p>
      </div>

      {/* Project context banner */}
      {project && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{
            backgroundColor: `${project.color}0d`,
            borderColor: `${project.color}30`,
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${project.color}18` }}
          >
            <FolderOpen size={13} style={{ color: project.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--fg-primary)]">
              Uploading to: <span style={{ color: project.color }}>{project.name}</span>
            </p>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">{project.clientName}</p>
          </div>
          <Link
            href={`/contracts/projects/${projectId}`}
            className="text-[10px] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] underline shrink-0"
          >
            Change
          </Link>
        </div>
      )}

      {/* Uploader card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <ContractUploader projectId={projectId} />
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INFO_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]"
          >
            <Icon size={18} strokeWidth={1.75} className="text-[#0072E5] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--fg-primary)]">{title}</p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
