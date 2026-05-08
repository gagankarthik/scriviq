import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbUpdateContract, dbPutApproval } from "@/lib/aws/contracts";
import { logAudit } from "@/lib/audit";
import type { ApprovalStep } from "@/lib/mock-data";

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

    const body = await request.json() as { approvers: Array<{ email: string; name: string }> };

    const steps: ApprovalStep[] = body.approvers.map((a, i) => ({
      id:            `approval-${id}-${i + 1}`,
      contractId:    id,
      step:          i + 1,
      approverEmail: a.email,
      approverName:  a.name,
      status:        "pending",
    }));

    await Promise.all(steps.map((s) => dbPutApproval(session.workspace, id, s)));

    await dbUpdateContract(session.workspace, id, {
      approvalStatus: "pending_approval",
      approvers:      body.approvers.map((a) => a.email),
    });

    await logAudit({
      type:        "approval_submitted",
      description: `Submitted "${contract.title}" for approval to ${body.approvers.map((a) => a.name).join(", ")}`,
      contractId:  id,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
      meta:        { approverEmails: body.approvers.map((a) => a.email).join(",") },
    });

    return Response.json({ steps });
  } catch (err) {
    console.error("POST /api/contracts/[id]/submit-approval", err);
    return Response.json({ error: "Failed to submit for approval" }, { status: 500 });
  }
}
