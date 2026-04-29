import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbUpdateComplianceRule, dbDeleteComplianceRule } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    await dbUpdateComplianceRule(session.workspace, id, body);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/compliance/rules/[id]", err);
    return Response.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await dbDeleteComplianceRule(session.workspace, id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/compliance/rules/[id]", err);
    return Response.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
