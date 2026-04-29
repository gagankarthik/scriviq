import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListClauses, dbUpdateClauseStatus } from "@/lib/aws/contracts";
import type { Clause } from "@/lib/mock-data";

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
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/contracts/[id]/clauses", err);
    return Response.json({ error: "Failed to update clause" }, { status: 500 });
  }
}
