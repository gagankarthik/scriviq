import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  dbGetAmendment, dbPutAmendment,
  dbPutClause, dbUpdateClauseStatus, dbListClauses,
  dbListAmendments,
} from "@/lib/aws/contracts";
import { detectAmendmentConflicts, withDerivedVersions } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import type { ClauseChangeStatus } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; amendmentId: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id, amendmentId } = await params;

  try {
    const body = await request.json() as {
      changes: Array<{ id: string; status: ClauseChangeStatus }>;
    };

    const amendment = await dbGetAmendment(session.workspace, id, amendmentId);
    if (!amendment) return Response.json({ error: "Amendment not found" }, { status: 404 });

    const statusMap = Object.fromEntries(body.changes.map((c) => [c.id, c.status]));
    const updatedChanges = amendment.changes.map((c) => ({
      ...c,
      status: statusMap[c.id] ?? c.status,
    }));

    // Apply accepted changes to the live contract
    const clauses = await dbListClauses(session.workspace, id);
    const clauseMap = Object.fromEntries(clauses.map((c) => [c.id, c]));

    await Promise.all(updatedChanges.map(async (change) => {
      if (change.status !== "accepted") return;

      if (change.changeType === "removed" && change.clauseId) {
        await dbUpdateClauseStatus(session.workspace, id, change.clauseId, "expired");

      } else if (change.changeType === "modified" && change.clauseId && change.newText) {
        const orig = clauseMap[change.clauseId];
        if (orig) {
          await dbPutClause(session.workspace, {
            ...orig,
            rawText: change.newText,
            summary: `[Amended] ${orig.summary}`,
            riskLevel: change.riskLevel,
            riskReason: change.riskReason,
          });
        }

      } else if (change.changeType === "added" && change.newText) {
        await dbPutClause(session.workspace, {
          id:         `${change.id}-clause`,
          contractId: id,
          type:       "scope_change",
          title:      change.title,
          summary:    `Added via amendment: ${change.title}`,
          rawText:    change.newText,
          dueDate:    null,
          amount:     null,
          noticeDays: null,
          riskLevel:  change.riskLevel,
          riskReason: change.riskReason,
          status:     "active",
          tags:       ["amendment"],
        });
      }
    }));

    const now      = new Date().toISOString();
    const resolved = {
      ...amendment,
      changes:    updatedChanges,
      status:     "resolved" as const,
      appliedAt:  now,
      resolvedBy: session.email ?? session.userId,
    };
    await dbPutAmendment(session.workspace, resolved);

    // Recompute conflicts now that this amendment has shifted from pending → resolved
    const allAmendments = await dbListAmendments(session.workspace, id).catch(() => []);
    const conflicts     = detectAmendmentConflicts(
      withDerivedVersions(allAmendments.map((a) => (a.id === resolved.id ? resolved : a)))
    );

    const acceptedCount = updatedChanges.filter((c) => c.status === "accepted").length;
    const rejectedCount = updatedChanges.filter((c) => c.status === "rejected").length;
    await logAudit({
      type:        "amendment_resolved",
      description: `Resolved amendment v${resolved.version ?? "?"}: ${resolved.title} — ${acceptedCount} accepted, ${rejectedCount} rejected`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        {
        amendmentId: resolved.id,
        version:     resolved.version ?? null,
        accepted:    acceptedCount,
        rejected:    rejectedCount,
      },
    });

    return Response.json({ amendment: resolved, conflicts });

  } catch (err) {
    console.error("PATCH /api/contracts/[id]/amendments/[amendmentId]", err);
    return Response.json({ error: "Failed to resolve amendment" }, { status: 500 });
  }
}
