import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbDeleteContract, dbUpdateContract } from "@/lib/aws/contracts";

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
    await dbDeleteContract(session.workspace, id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/contracts/[id]", err);
    return Response.json({ error: "Failed to delete contract" }, { status: 500 });
  }
}
