import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import {
  dbListContracts,
  dbListClauses,
  dbGetProjectConsolidation,
  dbPutProjectConsolidation,
} from "@/lib/aws/contracts";
import type {
  ProjectConsolidation,
  DocTimelineEntry,
  CrossDocConflict,
  ConsolidatedClause,
  DocType,
} from "@/lib/mock-data";
import type { Clause, Contract } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert contract analyst specializing in multi-document SOW management for digital agencies.

You receive a JSON payload containing multiple related documents from a single project. Each document has: id, title, uploadedAt, contractValue, expiryDate, and an array of extracted clauses (type, title, rawText, riskLevel, amount, dueDate).

Perform a comprehensive cross-document analysis. Return ONLY a valid JSON object with these exact fields:

{
  "baseDocId": "string | null",
  "baseDocTitle": "string | null",
  "originalValue": null,
  "currentValue": null,
  "valueDelta": null,
  "originalEndDate": "YYYY-MM-DD | null",
  "currentEndDate": "YYYY-MM-DD | null",
  "timelineDeltaDays": null,
  "informalChangeCount": 0,
  "conflictCount": 0,
  "criticalConflictCount": 0,
  "executiveSummary": "string",
  "masterSowText": "string",
  "timeline": [
    {
      "contractId": "string",
      "title": "string",
      "uploadedAt": "string",
      "docType": "base_sow | amendment | change_order | informal | side_sow",
      "isInformal": false,
      "contractValue": null,
      "expiryDate": "string | null",
      "clauseCount": 0,
      "keyChanges": ["string"]
    }
  ],
  "conflicts": [
    {
      "id": "conflict-01",
      "severity": "critical | warning | info",
      "type": "contradiction | scope_budget_mismatch | timeline_resource_mismatch | missing_approval | overlap | external_reference | informal_change",
      "title": "string",
      "description": "string",
      "docAId": "string",
      "docATitle": "string",
      "docBId": "string | null",
      "docBTitle": "string | null",
      "recommendation": "string"
    }
  ],
  "consolidatedClauses": [
    {
      "clauseType": "string",
      "clauseTitle": "string",
      "currentText": "string",
      "sourceDocId": "string",
      "sourceDocTitle": "string",
      "isOverridden": false,
      "originalText": "string | null",
      "originalDocTitle": "string | null"
    }
  ]
}

Rules for conflict detection — flag EVERY instance of:
- Scope increases without corresponding budget increases
- Timeline extension without resource addition (resource_risk)
- A clause in document N that directly contradicts or removes a clause from document M
- Documents without formal amendment headers (isInformal = true) — these are not legally binding
- References to external documents/attachments that are not attached ("per requirements_vX.docx")
- Overlapping responsibilities across separate SOWs in the same project
- Budget changes that don't add up (Amendment 1 +$15k, Amendment 2 -$5k, but total changed +$20k)

For scope_budget_mismatch: compare the deliverables/scope sections against the compensation sections across docs.
For timeline_resource_mismatch: compare end dates vs team composition across docs.

The baseDocId should be the id of the original/base SOW (the earliest or most foundational document).
The originalValue is the contract value of the base SOW. The currentValue is the latest total value after all amendments.
The executiveSummary should be 2-3 sentences of plain-English summary.
The masterSowText should be the consolidated current scope in plain English (3-6 paragraphs).
For timeline entries, keyChanges should be 1-3 bullet points of what each doc added or changed.
Order conflicts by severity (critical first, then warning, then info).
For consolidatedClauses, include every unique clause type across all documents in its current authoritative state.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPayload(
  contracts: Contract[],
  clausesByContract: Map<string, Clause[]>
): string {
  const docs = contracts.map((c) => {
    const clauses = clausesByContract.get(c.id) ?? [];
    return {
      id: c.id,
      title: c.title,
      uploadedAt: c.uploadedAt,
      contractValue: c.contractValue,
      expiryDate: c.expiryDate,
      clauses: clauses.map((cl) => ({
        type: cl.type,
        title: cl.title,
        rawText: cl.rawText.slice(0, 800),
        riskLevel: cl.riskLevel,
        amount: cl.amount,
        dueDate: cl.dueDate,
      })),
    };
  });
  return JSON.stringify({ documents: docs }, null, 0);
}

function safeParseConsolidation(
  raw: string,
  projectId: string,
  contracts: Contract[]
): ProjectConsolidation {
  const now = new Date().toISOString();
  const fallback: ProjectConsolidation = {
    projectId,
    analysedAt: now,
    docCount: contracts.length,
    baseDocId: null,
    baseDocTitle: null,
    originalValue: null,
    currentValue: null,
    valueDelta: null,
    originalEndDate: null,
    currentEndDate: null,
    timelineDeltaDays: null,
    informalChangeCount: 0,
    conflictCount: 0,
    criticalConflictCount: 0,
    timeline: [],
    conflicts: [],
    consolidatedClauses: [],
    executiveSummary: "Analysis could not be completed.",
    masterSowText: "",
  };

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const validDocTypes: DocType[] = ["base_sow", "amendment", "change_order", "informal", "side_sow"];

    const timeline: DocTimelineEntry[] = Array.isArray(parsed.timeline)
      ? (parsed.timeline as DocTimelineEntry[]).filter(
          (e) => typeof e.contractId === "string" && typeof e.title === "string"
        ).map((e) => ({
          ...e,
          docType: validDocTypes.includes(e.docType) ? e.docType : "base_sow",
          keyChanges: Array.isArray(e.keyChanges) ? e.keyChanges.filter((k) => typeof k === "string") : [],
        }))
      : [];

    const validSeverities = ["critical", "warning", "info"] as const;
    const validConflictTypes = [
      "contradiction", "scope_budget_mismatch", "timeline_resource_mismatch",
      "missing_approval", "overlap", "external_reference", "informal_change",
    ] as const;

    const conflicts: CrossDocConflict[] = Array.isArray(parsed.conflicts)
      ? (parsed.conflicts as CrossDocConflict[]).filter(
          (c) => typeof c.id === "string" && typeof c.title === "string"
        ).map((c) => ({
          ...c,
          severity: validSeverities.includes(c.severity) ? c.severity : "info",
          type: validConflictTypes.includes(c.type) ? c.type : "contradiction",
        }))
      : [];

    const consolidatedClauses: ConsolidatedClause[] = Array.isArray(parsed.consolidatedClauses)
      ? (parsed.consolidatedClauses as ConsolidatedClause[]).filter(
          (c) => typeof c.clauseType === "string" && typeof c.currentText === "string"
        )
      : [];

    const criticalConflictCount = conflicts.filter((c) => c.severity === "critical").length;

    return {
      projectId,
      analysedAt: now,
      docCount: contracts.length,
      baseDocId: typeof parsed.baseDocId === "string" ? parsed.baseDocId : null,
      baseDocTitle: typeof parsed.baseDocTitle === "string" ? parsed.baseDocTitle : null,
      originalValue: typeof parsed.originalValue === "number" ? parsed.originalValue : null,
      currentValue: typeof parsed.currentValue === "number" ? parsed.currentValue : null,
      valueDelta: typeof parsed.valueDelta === "number" ? parsed.valueDelta : null,
      originalEndDate: typeof parsed.originalEndDate === "string" ? parsed.originalEndDate : null,
      currentEndDate: typeof parsed.currentEndDate === "string" ? parsed.currentEndDate : null,
      timelineDeltaDays: typeof parsed.timelineDeltaDays === "number" ? parsed.timelineDeltaDays : null,
      informalChangeCount: typeof parsed.informalChangeCount === "number" ? parsed.informalChangeCount : 0,
      conflictCount: conflicts.length,
      criticalConflictCount,
      timeline,
      conflicts,
      consolidatedClauses,
      executiveSummary: typeof parsed.executiveSummary === "string" ? parsed.executiveSummary : "",
      masterSowText: typeof parsed.masterSowText === "string" ? parsed.masterSowText : "",
    };
  } catch {
    return fallback;
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const consolidation = await dbGetProjectConsolidation(session.workspace, id);
    return Response.json({ consolidation });
  } catch (err) {
    console.error(`GET /api/projects/${id}/consolidate`, err);
    return Response.json({ error: "Failed to fetch consolidation" }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contracts = await dbListContracts(session.workspace, { projectId: id });

    if (contracts.length === 0) {
      return Response.json({ error: "No documents found in this project" }, { status: 400 });
    }

    const clauseResults = await Promise.all(
      contracts.map((c) => dbListClauses(session.workspace, c.id))
    );

    const clausesByContract = new Map<string, Clause[]>();
    contracts.forEach((c, i) => clausesByContract.set(c.id, clauseResults[i]));

    const payload = buildPayload(contracts, clausesByContract);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: payload },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 6000,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const consolidation = safeParseConsolidation(raw, id, contracts);

    await dbPutProjectConsolidation(session.workspace, consolidation);

    return Response.json({ consolidation });
  } catch (err) {
    console.error(`POST /api/projects/${id}/consolidate`, err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
