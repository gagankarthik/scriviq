import Link from "next/link";
import { type ActivityEvent, relativeTime } from "@/lib/mock-data";

const EVENT_ICONS: Record<ActivityEvent["type"], { icon: string; color: string }> = {
  contract_uploaded:    { icon: "↑", color: "bg-indigo-600/30 text-indigo-400 border-indigo-800/40" },
  extraction_complete:  { icon: "✓", color: "bg-emerald-600/20 text-emerald-400 border-emerald-800/40" },
  alert_sent:          { icon: "◎", color: "bg-amber-600/20 text-amber-400 border-amber-800/40" },
  clause_actioned:     { icon: "⊡", color: "bg-slate-700/60 text-slate-400 border-slate-700/40" },
  member_added:        { icon: "⊕", color: "bg-indigo-600/20 text-indigo-400 border-indigo-800/30" },
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/40">
        <h2 className="text-sm font-semibold text-slate-100">Recent Activity</h2>
      </div>

      <div className="p-4 space-y-3">
        {events.map((event) => {
          const { icon, color } = EVENT_ICONS[event.type];
          return (
            <div key={event.id} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[11px] font-mono shrink-0 mt-0.5 ${color}`}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                {event.contractId ? (
                  <Link
                    href={`/contracts/${event.contractId}`}
                    className="text-xs text-slate-300 hover:text-indigo-400 transition-colors leading-relaxed"
                  >
                    {event.description}
                  </Link>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                )}
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                  {relativeTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
