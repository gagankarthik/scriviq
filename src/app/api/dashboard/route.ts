import { getSession } from "@/lib/auth/session";
import { dbGetDashboardStats, dbListContracts, dbListActivity, dbListAlerts } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, recentContracts, recentActivity, pendingAlerts] = await Promise.all([
      dbGetDashboardStats(session.workspace),
      dbListContracts(session.workspace).then((c) => c.slice(0, 3)),
      dbListActivity(session.workspace, 10),
      dbListAlerts(session.workspace, { status: "pending" }).then((a) => a.slice(0, 5)),
    ]);

    return Response.json({ stats, recentContracts, recentActivity, pendingAlerts });
  } catch (err) {
    console.error("GET /api/dashboard", err);
    return Response.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
