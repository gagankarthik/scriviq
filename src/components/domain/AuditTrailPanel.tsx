"use client";

import { useMemo, useState } from "react";
import {
  ScrollText, Filter, Upload, Edit3, Trash2, FileCheck, FileX, GitBranch,
  GitMerge, ShieldAlert, CheckSquare, UserPlus, Bell, FileSearch,
  Eye, EyeOff, Download, Database, ChevronDown,
} from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@/lib/mock-data";
import { relativeTime } from "@/lib/utils";

const EVENT_META: Record<ActivityEventType, { label: string; color: string; Icon: React.ElementType }> = {
  contract_uploaded:        { label: "Upload",       color: "#0072E5", Icon: Upload },
  contract_edited:          { label: "Edit",         color: "#0072E5", Icon: Edit3 },
  contract_deleted:         { label: "Delete",       color: "#ef4444", Icon: Trash2 },
  extraction_complete:      { label: "Extraction",   color: "#10b981", Icon: FileSearch },
  alert_sent:               { label: "Alert",        color: "#f59e0b", Icon: Bell },
  clause_actioned:          { label: "Clause",       color: "#0072E5", Icon: CheckSquare },
  member_added:             { label: "Member",       color: "#0072E5", Icon: UserPlus },
  amendment_uploaded:       { label: "Amendment",    color: "#f59e0b", Icon: GitBranch },
  amendment_resolved:       { label: "Apply",        color: "#10b981", Icon: GitMerge },
  amendment_overridden:     { label: "Override",     color: "#ef4444", Icon: ShieldAlert },
  approval_submitted:       { label: "Approval",     color: "#0072E5", Icon: FileSearch },
  approval_approved:        { label: "Approved",     color: "#10b981", Icon: FileCheck },
  approval_rejected:        { label: "Rejected",     color: "#ef4444", Icon: FileX },
  pii_redacted:             { label: "PII Redact",   color: "#8b5cf6", Icon: EyeOff },
  data_exported:            { label: "Export",       color: "#0072E5", Icon: Download },
  workspace_data_deleted:   { label: "Data Delete",  color: "#ef4444", Icon: Database },
};

function EventIcon({ type }: { type: ActivityEventType }) {
  const meta = EVENT_META[type] ?? EVENT_META.contract_edited;
  const { color, Icon } = meta;
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon size={13} />
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export function AuditTrailPanel({
  events: initialEvents, contractId, compact = false,
}: {
  events: ActivityEvent[];
  contractId?: string;
  compact?: boolean;
}) {
  const [events]      = useState(initialEvents);
  const [filter, setFilter] = useState<ActivityEventType | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Distinct event types present in the log
  const presentTypes = useMemo(() => {
    const set = new Set<ActivityEventType>();
    for (const e of events) set.add(e.type);
    return Array.from(set);
  }, [events]);

  const visible = useMemo(
    () => filter === "all" ? events : events.filter((e) => e.type === filter),
    [events, filter]
  );

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <ScrollText size={14} style={{ color: "#0072E5" }} />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">
            {contractId ? "Contract Audit Trail" : "Workspace Audit Trail"}
          </h3>
          <span className="text-xs text-[var(--fg-muted)] font-mono">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>
        {presentTypes.length > 1 && (
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <Filter size={11} className="text-[var(--fg-muted)]" />
            <button
              onClick={() => setFilter("all")}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-all"
              style={
                filter === "all"
                  ? { backgroundColor: "rgba(0,114,229,0.12)", color: "#0072E5" }
                  : { color: "var(--fg-muted)" }
              }
            >
              All
            </button>
            {presentTypes.map((t) => {
              const meta = EVENT_META[t];
              const active = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-all"
                  style={
                    active
                      ? { backgroundColor: `${meta.color}1f`, color: meta.color }
                      : { color: "var(--fg-muted)" }
                  }
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <ScrollText size={20} className="mx-auto mb-2 text-[var(--fg-muted)]" />
          <p className="text-xs text-[var(--fg-muted)]">
            {events.length === 0 ? "No activity recorded yet." : "No events match the current filter."}
          </p>
        </div>
      ) : (
        <ul className="relative px-5 py-4">
          <div className="absolute left-[34px] top-6 bottom-6 w-px bg-[var(--border-subtle)]" />
          {(compact ? visible.slice(0, 8) : visible).map((event) => {
            const meta = EVENT_META[event.type] ?? EVENT_META.contract_edited;
            const isExpanded = expanded === event.id;
            const hasMeta = event.meta && Object.keys(event.meta).length > 0;

            return (
              <li key={event.id} className="relative flex items-start gap-3 py-2.5">
                <EventIcon type={event.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--fg-primary)] leading-relaxed">
                        <span className="font-semibold">{event.actorName ?? event.actorEmail ?? "System"}</span>{" "}
                        <span className="text-[var(--fg-secondary)]">{event.description}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                          style={{ color: meta.color, backgroundColor: `${meta.color}14`, borderColor: `${meta.color}40` }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-[var(--fg-muted)] font-mono" title={formatTimestamp(event.timestamp)}>
                          {relativeTime(event.timestamp)}
                        </span>
                        {event.actorEmail && event.actorName && event.actorName !== event.actorEmail && (
                          <span className="text-[10px] text-[var(--fg-muted)] font-mono truncate">
                            {event.actorEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasMeta && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : event.id)}
                        className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors p-0.5 shrink-0"
                        aria-label="Show details"
                      >
                        <ChevronDown
                          size={12}
                          style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && hasMeta && (
                    <div className="mt-2 ml-0 px-3 py-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                      <dl className="space-y-1">
                        {Object.entries(event.meta!).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-2 text-[11px] font-mono">
                            <dt className="text-[var(--fg-muted)] uppercase tracking-wider">{k}</dt>
                            <dd className="text-[var(--fg-secondary)] break-all">{String(v ?? "—")}</dd>
                          </div>
                        ))}
                        <div className="flex items-baseline gap-2 text-[11px] font-mono pt-1 border-t border-[var(--border-subtle)] mt-1">
                          <dt className="text-[var(--fg-muted)] uppercase tracking-wider">timestamp</dt>
                          <dd className="text-[var(--fg-secondary)]">{formatTimestamp(event.timestamp)}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {compact && visible.length > 8 && (
            <li className="pl-10 pt-2">
              <p className="text-[10px] text-[var(--fg-muted)] font-mono">
                + {visible.length - 8} earlier event{visible.length - 8 !== 1 ? "s" : ""}
              </p>
            </li>
          )}
        </ul>
      )}

      <div className="flex items-center gap-2 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
        <Eye size={11} className="text-[var(--fg-muted)]" />
        <p className="text-[10px] text-[var(--fg-muted)]">
          Immutable record — every action is logged with the actor, timestamp, and context for compliance and audit.
        </p>
      </div>
    </div>
  );
}
