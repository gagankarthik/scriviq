import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import {
  dbGetContract, dbListClauses,
  dbListAmendments, dbPutAmendment,
} from "@/lib/aws/contracts";
import type { Amendment, ClauseChange, RiskLevel, ClauseChangeStatus } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AMENDMENT_PROMPT = `You are a contract amendment analysis AI for a digital agency.

You will receive:
1. The existing contract clauses (JSON with id, type, title, rawText)
2. An amendment document text

Identify every material change. Return JSON with a "changes" array where each item has:
- id: "change-<nn>" (e.g. "change-01")
- changeType: "added" | "modified" | "removed"
- clauseId: string | null (original clause id being modified/removed; null for additions)
- title: string (concise clause name)
- originalText: string | null (verbatim from original clause; null for additions)
- newText: string | null (verbatim from amendment; null for removals)
- riskLevel: "low" | "medium" | "high"
- riskReason: string | null (required for medium/high)
- status: "pending"

Focus on material changes: scope additions, payment changes, deadline shifts, new obligations, removed protections.`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const amendments = await dbListAmendments(session.workspace, id).catch(() => []);
  return Response.json({ amendments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json() as { title: string; text: string; description?: string };
    if (!body.title?.trim() || !body.text?.trim())
      return Response.json({ error: "title and text are required" }, { status: 400 });

    const [contract, existingClauses] = await Promise.all([
      dbGetContract(session.workspace, id),
      dbListClauses(session.workspace, id),
    ]);
    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const clauseSummary = existingClauses.map((c) => ({
      id: c.id, type: c.type, title: c.title, rawText: c.rawText,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AMENDMENT_PROMPT },
        {
          role: "user",
          content: `Contract: ${contract.title} (${contract.clientName})\n\nExisting clauses:\n${JSON.stringify(clauseSummary, null, 2)}\n\nAmendment document:\n${body.text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 3000,
    });

    const rawJson = completion.choices[0].message.content ?? "{}";
    let parsed: { changes?: Partial<ClauseChange>[] };
    try { parsed = JSON.parse(rawJson); }
    catch { parsed = { changes: [] }; }

    const changes: ClauseChange[] = (parsed.changes ?? []).map((c, i) => ({
      id:           c.id ?? `change-${String(i + 1).padStart(2, "0")}`,
      changeType:   (c.changeType ?? "modified") as ClauseChange["changeType"],
      clauseId:     c.clauseId ?? null,
      title:        c.title ?? `Change ${i + 1}`,
      originalText: c.originalText ?? null,
      newText:      c.newText ?? null,
      riskLevel:    (c.riskLevel ?? "medium") as RiskLevel,
      riskReason:   c.riskReason ?? null,
      status:       "pending" as ClauseChangeStatus,
    }));

    const amendment: Amendment = {
      id:          `amendment-${Date.now()}`,
      contractId:  id,
      title:       body.title.trim(),
      description: body.description?.trim() ?? "",
      status:      "pending_review",
      uploadedAt:  new Date().toISOString(),
      changes,
    };

    await dbPutAmendment(session.workspace, amendment);
    return Response.json({ amendment });
  } catch (err) {
    console.error("POST /api/contracts/[id]/amendments", err);
    return Response.json({ error: "Failed to process amendment" }, { status: 500 });
  }
}
