import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListAlerts, dbUpdateAlertStatus } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") ?? undefined;

  try {
    const alerts = await dbListAlerts(session.workspace, { status });
    return Response.json({ alerts });
  } catch (err) {
    console.error("GET /api/alerts", err);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return Response.json({ error: "id and status required" }, { status: 400 });
    }
    await dbUpdateAlertStatus(session.workspace, id, status);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/alerts", err);
    return Response.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
