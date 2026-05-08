import type { NextRequest } from "next/server";
import { getSession, clearSession } from "@/lib/auth/session";
import { dbPurgeWorkspace } from "@/lib/aws/contracts";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GDPR right-to-erasure: deletes every record under the workspace partition
 * and the nested per-contract sub-partitions. Requires the user to confirm
 * by typing "DELETE" in the request body.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== "DELETE") {
      return Response.json(
        { error: "Confirmation required: send { confirm: 'DELETE' } to proceed." },
        { status: 400 }
      );
    }

    // Log the audit event BEFORE purging — otherwise it gets wiped along with everything else
    await logAudit({
      type:        "workspace_data_deleted",
      description: `Initiated full workspace data deletion (GDPR erasure)`,
      workspace:   session.workspace,
      actorEmail:  session.email,
      actorName:   session.name,
    });

    const deleted = await dbPurgeWorkspace(session.workspace);
    await clearSession();

    return Response.json({ ok: true, deleted });
  } catch (err) {
    console.error("POST /api/workspace/delete", err);
    return Response.json({ error: "Failed to delete workspace data" }, { status: 500 });
  }
}
