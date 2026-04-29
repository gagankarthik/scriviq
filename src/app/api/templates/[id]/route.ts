import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbUpdateTemplate, dbDeleteTemplate } from "@/lib/aws/contracts";

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
    await dbUpdateTemplate(session.workspace, id, { ...body, updatedAt: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/templates/[id]", err);
    return Response.json({ error: "Failed to update template" }, { status: 500 });
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
    await dbDeleteTemplate(session.workspace, id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/templates/[id]", err);
    return Response.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
