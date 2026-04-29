import Link from "next/link";
import { Upload, CheckCircle2, Bell, FileText, UserPlus, Activity } from "lucide-react";
import { type ActivityEvent, relativeTime } from "@/lib/mock-data";

const EVENT_CONFIG: Record<ActivityEvent["type"], { Icon: React.ElementType; color: string }> = {
  contract_uploaded:   { Icon: Upload,       color: "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40" },
  extraction_complete: { Icon: CheckCircle2, color: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
  alert_sent:          { Icon: Bell,         color: "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" },
  clause_actioned:     { Icon: FileText,     color: "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/40" },
  member_added:        { Icon: UserPlus,     color: "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30" },
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
          const { Icon, color } = EVENT_CONFIG[event.type];
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
                    className="text-xs text-[var(--fg-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-relaxed"
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
