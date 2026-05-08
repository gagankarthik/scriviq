import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  dbListClauses,
  dbUpdateClauseStatus,
  dbUpdateContract,
} from "@/lib/aws/contracts";
import { computeRiskScore } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import type { Clause, RiskLevel } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const clauses = await dbListClauses(session.workspace, id);
    return Response.json({ clauses });
  } catch (err) {
    console.error("GET /api/contracts/[id]/clauses", err);
    return Response.json({ error: "Failed to fetch clauses" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json() as { clauseId: string; status: Clause["status"] };
    await dbUpdateClauseStatus(session.workspace, id, body.clauseId, body.status);

    // Recalculate and persist the contract risk score
    const allClauses = await dbListClauses(session.workspace, id);
    const activeClauses = allClauses.filter((c) => c.status === "active");
    const numericScore = computeRiskScore(activeClauses);

    // Map numeric score → RiskLevel for the contract-level badge
    const riskScore: RiskLevel =
      numericScore >= 67 ? "high" : numericScore >= 34 ? "medium" : "low";

    await dbUpdateContract(session.workspace, id, {
      riskScore,
      clauseCount: activeClauses.length,
    });

    const clauseTitle = allClauses.find((c) => c.id === body.clauseId)?.title ?? body.clauseId;
    await logAudit({
      type:        "clause_actioned",
      description: `Marked clause "${clauseTitle}" as ${body.status}`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        { clauseId: body.clauseId, status: body.status },
    });

    return Response.json({ ok: true, riskScore, clauseCount: activeClauses.length });
  } catch (err) {
    console.error("PATCH /api/contracts/[id]/clauses", err);
    return Response.json({ error: "Failed to update clause" }, { status: 500 });
  }
}
