import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListActivity, dbListContractActivity } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get("contractId");
  const limit      = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));

  try {
    const events = contractId
      ? await dbListContractActivity(session.workspace, contractId, limit)
      : await dbListActivity(session.workspace, limit);
    return Response.json({ events });
  } catch (err) {
    console.error("GET /api/audit", err);
    return Response.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
