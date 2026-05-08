/**
 * Lightweight PII redaction for clause text shown in the UI.
 *
 * Pure / deterministic — runs on either server or client.
 * Does NOT remove from storage; only masks the rendered output.
 * For full GDPR erasure, use the workspace delete endpoint.
 */

const PATTERNS = [
  // Email
  { kind: "email" as const, re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, mask: "[REDACTED:email]" },
  // US-style phone
  { kind: "phone" as const, re: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, mask: "[REDACTED:phone]" },
  // SSN
  { kind: "ssn" as const, re: /\b\d{3}-\d{2}-\d{4}\b/g, mask: "[REDACTED:ssn]" },
  // Credit card (loose)
  { kind: "card" as const, re: /\b(?:\d[ -]*?){13,16}\b/g, mask: "[REDACTED:card]" },
  // IPv4
  { kind: "ip" as const, re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, mask: "[REDACTED:ip]" },
];

export type PiiKind = (typeof PATTERNS)[number]["kind"];

export interface PiiRedactionResult {
  text:    string;
  counts:  Record<PiiKind, number>;
  total:   number;
}

export function redactPii(input: string): PiiRedactionResult {
  if (!input) return { text: input, counts: emptyCounts(), total: 0 };
  let out = input;
  const counts = emptyCounts();
  for (const { kind, re, mask } of PATTERNS) {
    out = out.replace(re, (match) => {
      // Skip credit-card pattern that obviously isn't a card (e.g. dates 2026-04-29)
      if (kind === "card" && /^\d{4}[-]\d{2}[-]\d{2}$/.test(match)) return match;
      counts[kind] = (counts[kind] ?? 0) + 1;
      return mask;
    });
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return { text: out, counts, total };
}

export function countPii(input: string): number {
  return redactPii(input).total;
}

function emptyCounts(): Record<PiiKind, number> {
  return { email: 0, phone: 0, ssn: 0, card: 0, ip: 0 };
}
