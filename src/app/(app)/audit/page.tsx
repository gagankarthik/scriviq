import { ScrollText, ShieldCheck, Database, Lock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { dbListActivity } from "@/lib/aws/contracts";
import { AuditTrailPanel } from "@/components/domain/AuditTrailPanel";

export default async function AuditPage() {
  const session = await getSession();
  const events  = session
    ? await dbListActivity(session.workspace, 500).catch(() => [])
    : [];

  const today      = new Date().toDateString();
  const todayCount = events.filter((e) => new Date(e.timestamp).toDateString() === today).length;
  const last7d     = Date.now() - 7 * 86_400_000;
  const weekCount  = events.filter((e) => new Date(e.timestamp).getTime() >= last7d).length;
  const actors     = new Set(events.map((e) => e.actorEmail).filter(Boolean));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScrollText size={15} style={{ color: "#0072E5" }} />
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">
                Compliance &amp; Audit
              </p>
            </div>
            <h1 className="text-xl font-bold text-[var(--fg-primary)] tracking-tight">Workspace Audit Log</h1>
            <p className="text-sm text-[var(--fg-secondary)] mt-1 max-w-xl">
              Immutable, append-only record of every action taken in this workspace — uploads, edits, amendment reviews, approvals, exports. Used for SOC 2, ISO 27001, and GDPR audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { label: "SOC 2 Ready",  Icon: ShieldCheck, color: "#10b981" },
              { label: "GDPR",         Icon: Lock,        color: "#0072E5" },
              { label: "Encrypted",    Icon: Database,    color: "#8b5cf6" },
            ].map(({ label, Icon, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-widest border"
                style={{ color, backgroundColor: `${color}14`, borderColor: `${color}40` }}
              >
                <Icon size={10} />{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events",    value: events.length,    color: "#0072E5" },
          { label: "Today",           value: todayCount,       color: "#10b981" },
          { label: "Last 7 Days",     value: weekCount,        color: "#f59e0b" },
          { label: "Distinct Actors", value: actors.size,      color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-2"
            style={{ borderLeftColor: color }}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Audit trail */}
      <AuditTrailPanel events={events} />
    </div>
  );
}
