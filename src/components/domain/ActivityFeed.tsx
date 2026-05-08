import Link from "next/link";
import {
  Upload, CheckCircle2, Bell, FileText, UserPlus, Activity,
  Edit3, Trash2, GitBranch, GitMerge, ShieldAlert, FileCheck, FileX,
  EyeOff, Download, Database, FileSearch,
} from "lucide-react";
import { type ActivityEvent, type ActivityEventType } from "@/lib/mock-data";
import { relativeTime } from "@/lib/utils";

const EVENT_CONFIG: Record<ActivityEventType, { Icon: React.ElementType; color: string }> = {
  contract_uploaded:        { Icon: Upload,       color: "bg-[rgba(0,114,229,0.1)] text-[#75D8FC] border-[rgba(0,114,229,0.2)]" },
  contract_edited:          { Icon: Edit3,        color: "bg-[rgba(0,114,229,0.1)] text-[#75D8FC] border-[rgba(0,114,229,0.2)]" },
  contract_deleted:         { Icon: Trash2,       color: "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
  extraction_complete:      { Icon: CheckCircle2, color: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
  alert_sent:               { Icon: Bell,         color: "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" },
  clause_actioned:          { Icon: FileText,     color: "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/40" },
  member_added:             { Icon: UserPlus,     color: "bg-[rgba(0,114,229,0.1)] text-[#75D8FC] border-[rgba(0,114,229,0.2)]" },
  amendment_uploaded:       { Icon: GitBranch,    color: "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" },
  amendment_resolved:       { Icon: GitMerge,     color: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
  amendment_overridden:     { Icon: ShieldAlert,  color: "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
  approval_submitted:       { Icon: FileSearch,   color: "bg-[rgba(0,114,229,0.1)] text-[#75D8FC] border-[rgba(0,114,229,0.2)]" },
  approval_approved:        { Icon: FileCheck,    color: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
  approval_rejected:        { Icon: FileX,        color: "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
  pii_redacted:             { Icon: EyeOff,       color: "bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/40" },
  data_exported:            { Icon: Download,     color: "bg-[rgba(0,114,229,0.1)] text-[#75D8FC] border-[rgba(0,114,229,0.2)]" },
  workspace_data_deleted:   { Icon: Database,     color: "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <Activity size={14} className="text-[var(--fg-muted)]" />
        <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Recent Activity</h2>
      </div>

      <div className="p-4 space-y-3">
        {events.map((event) => {
          const { Icon, color } = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.contract_uploaded;
          return (
            <div key={event.id} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${color}`}
              >
                <Icon size={12} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                {event.contractId ? (
                  <Link
                    href={`/contracts/${event.contractId}`}
                    className="text-xs text-[var(--fg-secondary)] hover:text-[#75D8FC] transition-colors leading-relaxed"
                  >
                    {event.description}
                  </Link>
                ) : (
                  <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                    {event.description}
                  </p>
                )}
                <p className="text-[10px] text-[var(--fg-muted)] font-mono mt-0.5">
                  {relativeTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="text-xs text-[var(--fg-muted)] py-6 text-center">No recent activity</p>
        )}
      </div>
    </div>
  );
}
