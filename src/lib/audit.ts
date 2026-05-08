import { dbPutActivity } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import type { ActivityEvent, ActivityEventType } from "@/lib/mock-data";

/**
 * Record an audit event. Never throws — audit logging must never break the
 * primary mutation. Uses the provided session if available, otherwise reads it.
 */
export async function logAudit(input: {
  type:        ActivityEventType;
  description: string;
  contractId?: string;
  meta?:       ActivityEvent["meta"];
  workspace?:  string;
  actorEmail?: string;
  actorName?:  string;
}): Promise<void> {
  try {
    let { workspace, actorEmail, actorName } = input;
    if (!workspace || !actorEmail) {
      const session = await getSession();
      if (!session) return;
      workspace  = workspace  ?? session.workspace;
      actorEmail = actorEmail ?? session.email;
      actorName  = actorName  ?? session.name;
    }
    if (!workspace) return;

    const timestamp = new Date().toISOString();
    const event: ActivityEvent = {
      id:          `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type:        input.type,
      description: input.description,
      contractId:  input.contractId,
      timestamp,
      actorEmail,
      actorName,
      meta:        input.meta,
    };
    await dbPutActivity(workspace, event);
  } catch (err) {
    console.error("logAudit failed (non-fatal):", err);
  }
}
