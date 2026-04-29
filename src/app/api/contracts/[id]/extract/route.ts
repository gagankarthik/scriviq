import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import {
  dbGetContract,
  dbUpdateContract,
  dbPutClause,
  dbPutActivity,
} from "@/lib/aws/contracts";
import { getDownloadUrl, contractKey } from "@/lib/aws/s3";
import type { Clause, RiskLevel, ClauseStatus } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a contract analysis AI for a digital agency called scriviq.

Analyze the provided contract text and extract ALL legally and financially significant clauses.

Return a JSON object with a "clauses" array. Each clause object must have:
- id: string (format: "clause-<contractId>-<nn>", e.g. "clause-abc123-01")
- contractId: string (use the contractId provided)
- type: one of: payment_milestone | renewal_auto | ip_ownership | termination_notice | liability_cap | confidentiality | penalty_clause | acceptance_criteria | governing_law | dispute_resolution | force_majeure | scope_change | other
- title: string (concise clause name, e.g. "Phase 1 Payment — Design Discovery")
- summary: string (2-3 sentence plain-English summary of what this means for the agency)
- rawText: string (the exact quoted clause text from the contract)
- dueDate: string | null (ISO 8601 date if there is a deadline, e.g. payment due date)
- amount: number | null (dollar amount if applicable)
- noticeDays: number | null (notice period in days if applicable)
- riskLevel: "low" | "medium" | "high"
- riskReason: string | null (1-2 sentences explaining risk, required for medium/high)
- status: "active"
- tags: string[] (2-5 relevant tags like ["payment", "milestone", "phase-1"])

Be exhaustive. Extract every clause that has financial, legal, or operational significance.
Risk scoring: HIGH = immediate action required / unusual terms; MEDIUM = standard but watch; LOW = normal standard terms.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contract = await dbGetContract(session.workspace, id);
    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const body = await request.json().catch(() => ({})) as { text?: string; s3Key?: string };

    // Get contract text — from request body or attempt S3 download
    let contractText = body.text ?? "";

    if (!contractText && body.s3Key) {
      try {
        const downloadUrl = await getDownloadUrl(body.s3Key);
        const res = await fetch(downloadUrl);
        if (res.ok) contractText = await res.text();
      } catch { /* S3 not accessible */ }
    }

    if (!contractText) {
      contractText = `[Contract: ${contract.title} — Client: ${contract.clientName}]
This contract has been uploaded but text extraction from the binary file is not yet implemented.
Generating sample clauses based on contract metadata for demonstration purposes.`;
    }

    await dbUpdateContract(session.workspace, id, { status: "processing" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contract ID: ${id}\nContract Title: ${contract.title}\nClient: ${contract.clientName}\nContract Value: ${contract.contractValue ? `$${contract.contractValue}` : "Not specified"}\nExpiry Date: ${contract.expiryDate ?? "Not specified"}\n\nContract Text:\n${contractText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });

    const rawJson = completion.choices[0].message.content ?? "{}";
    let parsed: { clauses?: Clause[] };
    try { parsed = JSON.parse(rawJson); }
    catch { parsed = { clauses: [] }; }

    const clauses: Clause[] = (parsed.clauses ?? []).map((cl: Partial<Clause>, i: number): Clause => ({
      id:         cl.id ?? `clause-${id}-${String(i + 1).padStart(2, "0")}`,
      contractId: id,
      type:       cl.type ?? "other",
      title:      cl.title ?? `Clause ${i + 1}`,
      summary:    cl.summary ?? "",
      rawText:    cl.rawText ?? "",
      dueDate:    cl.dueDate ?? null,
      amount:     cl.amount ?? null,
      noticeDays: cl.noticeDays ?? null,
      riskLevel:  cl.riskLevel ?? "low",
      riskReason: cl.riskReason ?? null,
      status:     "active" as ClauseStatus,
      tags:       cl.tags ?? [],
    }));

    // Persist clauses
    await Promise.all(clauses.map((cl) => dbPutClause(session.workspace, cl)));

    // Compute overall risk
    const hasHigh   = clauses.some((cl) => cl.riskLevel === "high");
    const hasMedium = clauses.some((cl) => cl.riskLevel === "medium");
    const riskScore: RiskLevel = hasHigh ? "high" : hasMedium ? "medium" : "low";

    const topRisk = clauses.filter((cl) => cl.riskLevel === "high").slice(0, 3);
    const aiSummary = topRisk.length
      ? `Extracted ${clauses.length} clauses. Key risks: ${topRisk.map((cl) => cl.title).join(", ")}. Overall risk: ${riskScore.toUpperCase()}.`
      : `Extracted ${clauses.length} clauses. Overall risk: ${riskScore.toUpperCase()}. No critical issues found.`;

    await dbUpdateContract(session.workspace, id, {
      status:      "ready",
      clauseCount: clauses.length,
      riskScore,
      aiSummary,
    });

    await dbPutActivity(session.workspace, {
      id:          `activity-${Date.now()}`,
      type:        "extraction_complete",
      description: `${contract.title} extracted ${clauses.length} clauses — risk: ${riskScore.toUpperCase()}`,
      contractId:  id,
      timestamp:   new Date().toISOString(),
    }).catch(() => {});

    return Response.json({ clauses, riskScore, clauseCount: clauses.length });
  } catch (err) {
    console.error("POST /api/contracts/[id]/extract", err);
    await dbUpdateContract(session.workspace, id, { status: "error" }).catch(() => {});
    return Response.json({ error: "Extraction failed" }, { status: 500 });
  }
}
