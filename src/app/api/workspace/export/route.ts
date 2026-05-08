import { getSession } from "@/lib/auth/session";
import {
  dbListContracts, dbListClauses, dbListAlerts, dbListActivity,
  dbListAmendments, dbListProjects, dbListTemplates, dbListComplianceRules,
  dbListApprovals, dbListTimesheets,
} from "@/lib/aws/contracts";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GDPR data export — returns the user's full workspace data as JSON.
 * Streams a single download containing every record we hold for them.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [contracts, alerts, activity, projects, templates, complianceRules] = await Promise.all([
      dbListContracts(session.workspace).catch(() => []),
      dbListAlerts(session.workspace).catch(() => []),
      dbListActivity(session.workspace, 1000).catch(() => []),
      dbListProjects(session.workspace).catch(() => []),
      dbListTemplates(session.workspace).catch(() => []),
      dbListComplianceRules(session.workspace).catch(() => []),
    ]);

    // Per-contract sub-collections
    const perContract = await Promise.all(
      contracts.map(async (c) => {
        const [clauses, amendments, approvals, timesheets] = await Promise.all([
          dbListClauses(session.workspace, c.id).catch(() => []),
          dbListAmendments(session.workspace, c.id).catch(() => []),
          dbListApprovals(session.workspace, c.id).catch(() => []),
          dbListTimesheets(session.workspace, c.id).catch(() => []),
        ]);
        return { contract: c, clauses, amendments, approvals, timesheets };
      })
    );

    const payload = {
      exportedAt:  new Date().toISOString(),
      workspaceId: session.workspace,
      user: {
        userId: session.userId,
        email:  session.email,
        name:   session.name,
      },
      counts: {
        contracts:        contracts.length,
        clauses:          perContract.reduce((s, p) => s + p.clauses.length, 0),
        amendments:       perContract.reduce((s, p) => s + p.amendments.length, 0),
        alerts:           alerts.length,
        activity:         activity.length,
        projects:         projects.length,
        templates:        templates.length,
        complianceRules:  complianceRules.length,
      },
      data: {
        contracts: perContract,
        alerts,
        activity,
        projects,
        templates,
        complianceRules,
      },
    };

    await logAudit({
      type:        "data_exported",
      description: `Exported full workspace data (${payload.counts.contracts} contracts, ${payload.counts.clauses} clauses)`,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        payload.counts as Record<string, number>,
    });

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type":        "application/json",
        "Content-Disposition": `attachment; filename="scriviq-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error("GET /api/workspace/export", err);
    return Response.json({ error: "Failed to export workspace data" }, { status: 500 });
  }
}
