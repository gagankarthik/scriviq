export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function daysUntil(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function clauseTypeLabel(type: string): string {
  return type.replace(/_/g, " ");
}

export function computeRiskScore(clauses: { riskLevel: string }[]): number {
  if (!clauses.length) return 0;
  const h = clauses.filter((c) => c.riskLevel === "high").length;
  const m = clauses.filter((c) => c.riskLevel === "medium").length;
  const l = clauses.filter((c) => c.riskLevel === "low").length;
  return Math.min(100, Math.round((h * 100 + m * 45 + l * 10) / clauses.length));
}

// ── Amendment versioning & conflict detection ────────────────────────────────

import type { Amendment, AmendmentConflict, ClauseChange } from "./mock-data";

/**
 * Stamp amendments that were saved before versioning was introduced.
 * Sorts by uploadedAt asc and assigns version = i + 2 (Original SOW is v1).
 * Pure: returns a new array, never mutates inputs.
 */
export function withDerivedVersions(amendments: Amendment[]): Amendment[] {
  const sorted = [...amendments].sort(
    (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
  );
  return sorted.map((a, i) => ({
    ...a,
    version:       a.version       ?? i + 2,
    parentVersion: a.parentVersion ?? (i === 0 ? 1 : i + 1),
  }));
}

/** The next version number to assign when uploading a new amendment. */
export function nextAmendmentVersion(amendments: Amendment[]): number {
  if (!amendments.length) return 2;
  const versions = withDerivedVersions(amendments).map((a) => a.version ?? 1);
  return Math.max(...versions) + 1;
}

/**
 * Detect conflicts where multiple PENDING amendments target the same clauseId,
 * or where a pending amendment modifies a clause that a prior resolved amendment
 * already removed.
 */
export function detectAmendmentConflicts(amendments: Amendment[]): AmendmentConflict[] {
  const versioned = withDerivedVersions(amendments);
  const pending   = versioned.filter((a) => a.status === "pending_review");
  const resolved  = versioned.filter((a) => a.status === "resolved");

  // Build clauseId -> [{ amendment, change }] map for pending amendments
  const byClause = new Map<string, Array<{ amendmentId: string; change: ClauseChange; title: string }>>();
  for (const am of pending) {
    for (const ch of am.changes) {
      if (!ch.clauseId) continue;
      const list = byClause.get(ch.clauseId) ?? [];
      list.push({ amendmentId: am.id, change: ch, title: am.title });
      byClause.set(ch.clauseId, list);
    }
  }

  const conflicts: AmendmentConflict[] = [];

  // 1. Same-clause collisions among pending amendments
  for (const [clauseId, entries] of byClause.entries()) {
    if (entries.length < 2) continue;
    const titles = Array.from(new Set(entries.map((e) => e.change.title)));
    const types  = new Set(entries.map((e) => e.change.changeType));
    const severity: AmendmentConflictSeverityLocal = types.has("removed") && types.size > 1 ? "error" : "warning";
    conflicts.push({
      id:           `conflict-clause-${clauseId}`,
      kind:         "same_clause",
      severity,
      clauseId,
      clauseTitle:  titles[0] ?? clauseId,
      amendmentIds: entries.map((e) => e.amendmentId),
      changeIds:    entries.map((e) => e.change.id),
      description:  severity === "error"
        ? `${entries.length} pending amendments touch this clause and one removes it — accepting both will produce an inconsistent contract state.`
        : `${entries.length} pending amendments propose changes to the same clause — review side-by-side before applying.`,
    });
  }

  // 2. Pending amendment modifies a clause already removed by a resolved amendment
  const removedClauseIds = new Set(
    resolved.flatMap((a) =>
      a.changes
        .filter((c) => c.changeType === "removed" && c.status === "accepted" && c.clauseId)
        .map((c) => c.clauseId!)
    )
  );
  for (const am of pending) {
    for (const ch of am.changes) {
      if (!ch.clauseId || !removedClauseIds.has(ch.clauseId)) continue;
      if (ch.changeType === "added") continue;
      conflicts.push({
        id:           `conflict-removed-${am.id}-${ch.id}`,
        kind:         "modifies_removed",
        severity:     "error",
        clauseId:     ch.clauseId,
        clauseTitle:  ch.title,
        amendmentIds: [am.id],
        changeIds:    [ch.id],
        description:  `This amendment proposes changes to a clause that has already been removed by a prior amendment.`,
      });
    }
  }

  return conflicts;
}

type AmendmentConflictSeverityLocal = "warning" | "error";
