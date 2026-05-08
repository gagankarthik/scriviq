import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbDeleteContract, dbUpdateContract } from "@/lib/aws/contracts";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const contract = await dbGetContract(session.workspace, id);
    if (!contract) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ contract });
  } catch (err) {
    console.error("GET /api/contracts/[id]", err);
    return Response.json({ error: "Failed to fetch contract" }, { status: 500 });
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
    const body = await request.json();
    await dbUpdateContract(session.workspace, id, body);

    const changedKeys = Object.keys(body).filter((k) => k !== "updatedAt");
    await logAudit({
      type:        "contract_edited",
      description: `Edited contract fields: ${changedKeys.join(", ")}`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        { fields: changedKeys.join(",") },
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/contracts/[id]", err);
    return Response.json({ error: "Failed to update contract" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const contract = await dbGetContract(session.workspace, id).catch(() => null);
    await dbDeleteContract(session.workspace, id);
    await logAudit({
      type:        "contract_deleted",
      description: `Deleted contract: ${contract?.title ?? id}`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        { title: contract?.title ?? id, clientName: contract?.clientName ?? "" },
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/contracts/[id]", err);
    return Response.json({ error: "Failed to delete contract" }, { status: 500 });
  }
}
