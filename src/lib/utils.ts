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
