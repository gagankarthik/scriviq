import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import {
  dbGetContract, dbListClauses,
  dbListAmendments, dbPutAmendment,
} from "@/lib/aws/contracts";
import { extractTextFromBuffer } from "@/lib/extractText";
import {
  detectAmendmentConflicts, nextAmendmentVersion, withDerivedVersions,
} from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import type { Amendment, ClauseChange, RiskLevel, ClauseChangeStatus } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Thorough prompt — accuracy is critical for business use
const AMENDMENT_PROMPT = `You are a contract amendment analysis AI for a professional digital agency.
Accuracy is critical — real business decisions depend on your output.

You receive:
1. EXISTING CLAUSES — JSON array with fields: id, type, title, rawText, amount, dueDate, noticeDays
2. AMENDMENT DOCUMENT — the full text of the revised or amended contract/SOW

Perform an exhaustive clause-by-clause comparison. Identify EVERY material change.

Return ONLY a valid JSON object: { "changes": [...] }

Each change object:
- id: "change-<nn>" (zero-padded, e.g. "change-01")
- changeType: "added" | "modified" | "removed"
- clauseId: existing clause id string if modifying/removing; null for new additions
- title: concise, specific clause name
- originalText: verbatim text from original clause (null for additions)
- newText: verbatim text from amendment document (null for removals)
- riskLevel: "low" | "medium" | "high"
  HIGH = new financial obligation, payment increase, extended liability, removed protection, shortened notice period, added penalty
  MEDIUM = scope expansion, deadline change, new condition, changed notice period
  LOW = wording clarification, minor administrative change
- riskReason: specific explanation including dollar amounts and dates if applicable (required for medium/high, null for low)
- status: "pending"

Rules:
- Flag every change to payment terms, amounts, deadlines, obligations, IP rights, and termination clauses — no exceptions
- Prefer flagging something borderline as MEDIUM rather than ignoring it
- Verbatim originalText and newText are mandatory for "modified" changes
- If the amendment REMOVES a clause entirely, changeType is "removed" with originalText set`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const raw = await dbListAmendments(session.workspace, id).catch(() => []);
  const amendments = withDerivedVersions(raw);
  const conflicts  = detectAmendmentConflicts(amendments);
  return Response.json({ amendments, conflicts });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    let title = "", description = "", amendmentText = "";

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // File upload path
      const formData = await request.formData();
      title       = ((formData.get("title") as string | null) ?? "").trim();
      description = ((formData.get("description") as string | null) ?? "").trim();
      const file  = formData.get("file") as File | null;

      if (!file) return Response.json({ error: "file is required" }, { status: 400 });

      const buf = Buffer.from(await file.arrayBuffer());
      amendmentText = await extractTextFromBuffer(buf, file.name);

      if (!amendmentText) {
        return Response.json(
          { error: "Could not extract text from the uploaded file. Try pasting the text instead." },
          { status: 422 }
        );
      }
    } else {
      // JSON text-paste path
      const body = await request.json() as { title: string; text: string; description?: string };
      title         = (body.title ?? "").trim();
      description   = (body.description ?? "").trim();
      amendmentText = (body.text ?? "").trim();
    }

    if (!title) return Response.json({ error: "title is required" }, { status: 400 });
    if (!amendmentText) return Response.json({ error: "amendment text is required" }, { status: 400 });

    const [contract, existingClauses, existingAmendments] = await Promise.all([
      dbGetContract(session.workspace, id),
      dbListClauses(session.workspace, id),
      dbListAmendments(session.workspace, id),
    ]);
    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const versionedExisting = withDerivedVersions(existingAmendments);
    const newVersion        = nextAmendmentVersion(existingAmendments);
    const parentVersion     = versionedExisting.length
      ? Math.max(...versionedExisting.map((a) => a.version ?? 1))
      : 1;

    // Include all fields that help GPT understand what has changed
    const clauseSummary = existingClauses.map((c) => ({
      id:          c.id,
      type:        c.type,
      title:       c.title,
      rawText:     c.rawText,
      amount:      c.amount,
      dueDate:     c.dueDate,
      noticeDays:  c.noticeDays,
      riskLevel:   c.riskLevel,
    }));

    const userMessage = [
      `CONTRACT: ${contract.title} (${contract.clientName})`,
      `VALUE: ${contract.contractValue ? `$${contract.contractValue}` : "not specified"}`,
      `EXPIRY: ${contract.expiryDate ?? "not specified"}`,
      ``,
      `EXISTING CLAUSES (${existingClauses.length} total):`,
      JSON.stringify(clauseSummary, null, 2),
      ``,
      `AMENDMENT DOCUMENT:`,
      amendmentText,
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system",  content: AMENDMENT_PROMPT },
        { role: "user",    content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.05,  // Near-deterministic for business accuracy
      max_tokens:  4000,
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
      id:            `amendment-${Date.now()}`,
      contractId:    id,
      title,
      description,
      status:        "pending_review",
      uploadedAt:    new Date().toISOString(),
      version:       newVersion,
      parentVersion,
      uploadedBy:    session.email ?? session.userId,
      changes,
    };

    await dbPutAmendment(session.workspace, amendment);

    // Recompute conflicts including the new amendment
    const allAfter   = withDerivedVersions([...existingAmendments, amendment]);
    const conflicts  = detectAmendmentConflicts(allAfter);

    await logAudit({
      type:        "amendment_uploaded",
      description: `Uploaded amendment v${newVersion}: ${title} (${changes.length} change${changes.length !== 1 ? "s" : ""})`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        {
        amendmentId: amendment.id,
        version:     newVersion,
        changeCount: changes.length,
        highRisk:    changes.filter((c) => c.riskLevel === "high").length,
      },
    });

    return Response.json({ amendment, conflicts });
  } catch (err) {
    console.error("POST /api/contracts/[id]/amendments", err);
    return Response.json({ error: "Failed to process amendment" }, { status: 500 });
  }
}
