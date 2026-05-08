import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbUpdateContract, dbListApprovals, dbUpdateApproval } from "@/lib/aws/contracts";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contract = await dbGetContract(session.workspace, id);
    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const body = await request.json() as { decision: "approved" | "rejected"; comments?: string; stepId: string };

    await dbUpdateApproval(session.workspace, id, body.stepId, {
      status:    body.decision,
      comments:  body.comments,
      timestamp: new Date().toISOString(),
    });

    const allSteps = await dbListApprovals(session.workspace, id);
    const anyRejected = allSteps.some((s) => s.status === "rejected");
    const allApproved = allSteps.every((s) => s.status === "approved");

    const newApprovalStatus = anyRejected ? "rejected" : allApproved ? "approved" : "pending_approval";

    await dbUpdateContract(session.workspace, id, {
      approvalStatus:   newApprovalStatus,
      approvalComments: body.comments,
    });

    await logAudit({
      type:        body.decision === "approved" ? "approval_approved" : "approval_rejected",
      description: `${body.decision === "approved" ? "Approved" : "Rejected"} "${contract.title}"${body.comments ? ` — "${body.comments}"` : ""}`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        { stepId: body.stepId, comments: body.comments ?? "" },
    });

    return Response.json({ approvalStatus: newApprovalStatus });
  } catch (err) {
    console.error("POST /api/contracts/[id]/approve", err);
    return Response.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
