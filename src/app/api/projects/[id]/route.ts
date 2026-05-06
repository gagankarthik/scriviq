import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetProject, dbUpdateProject, dbDeleteProject, dbListContracts, dbListClauses } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [project, allContracts] = await Promise.all([
      dbGetProject(session.workspace, id),
      dbListContracts(session.workspace, { projectId: id }),
    ]);

    if (!project) return Response.json({ error: "Not found" }, { status: 404 });

    const ready = allContracts.filter((c) => c.status === "ready");
    const totalValue = ready.reduce((s, c) => s + (c.contractValue ?? 0), 0);

    const allClauses = (
      await Promise.all(ready.map((c) => dbListClauses(session.workspace, c.id)))
    ).flat();

    const today = Date.now();
    const in30 = today + 30 * 86_400_000;

    const stats = {
      contractCount:        allContracts.length,
      totalValue,
      highRiskClauseCount:  allClauses.filter((cl) => cl.riskLevel === "high" && cl.status === "active").length,
      upcomingDeadlineCount: allClauses.filter((cl) => {
        if (!cl.dueDate) return false;
        const d = new Date(cl.dueDate).getTime();
        return d >= today && d <= in30;
      }).length,
    };

    return Response.json({ project, contracts: allContracts, stats });
  } catch (err) {
    console.error(`GET /api/projects/${id}`, err);
    return Response.json({ error: "Failed to fetch project" }, { status: 500 });
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
    await dbUpdateProject(session.workspace, id, body);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`PATCH /api/projects/${id}`, err);
    return Response.json({ error: "Failed to update project" }, { status: 500 });
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
    await dbDeleteProject(session.workspace, id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/projects/${id}`, err);
    return Response.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
