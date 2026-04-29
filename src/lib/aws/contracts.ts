import {
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE } from "./dynamodb";
import type { Contract, Clause, Alert, ActivityEvent, Amendment } from "@/lib/mock-data";

// ── Key helpers ───────────────────────────────────────────────────────────────

function clausePK(workspace: string, contractId: string) {
  return `${workspace}#CONTRACT#${contractId}`;
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export async function dbListContracts(
  workspace: string,
  opts?: { status?: string; risk?: string; q?: string }
): Promise<Contract[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": workspace, ":prefix": "CONTRACT#" },
      ScanIndexForward: false,
    })
  );

  let items = ((result.Items ?? []) as Contract[]).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  if (opts?.status) items = items.filter((c) => c.status === opts.status);
  if (opts?.risk)   items = items.filter((c) => c.riskScore === opts.risk);
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q)
    );
  }
  return items;
}

export async function dbGetContract(
  workspace: string,
  id: string
): Promise<Contract | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: workspace, SK: `CONTRACT#${id}` },
    })
  );
  return (result.Item as Contract) ?? null;
}

export async function dbPutContract(
  workspace: string,
  contract: Contract
): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: { ...contract, PK: workspace, SK: `CONTRACT#${contract.id}` },
    })
  );
}

export async function dbUpdateContract(
  workspace: string,
  id: string,
  updates: Partial<Contract>
): Promise<void> {
  const sets: string[] = ["updatedAt = :ts"];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = { ":ts": new Date().toISOString() };

  for (const [k, v] of Object.entries(updates)) {
    const safe = k === "status" ? "#status" : k;
    if (k === "status") names["#status"] = "status";
    sets.push(`${safe} = :${k}`);
    values[`:${k}`] = v;
  }

  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: workspace, SK: `CONTRACT#${id}` },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
    })
  );
}

export async function dbDeleteContract(workspace: string, id: string): Promise<void> {
  await dynamo.send(
    new DeleteCommand({ TableName: TABLE, Key: { PK: workspace, SK: `CONTRACT#${id}` } })
  );
}

// ── Clauses ───────────────────────────────────────────────────────────────────

export async function dbListClauses(
  workspace: string,
  contractId: string
): Promise<Clause[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk":     clausePK(workspace, contractId),
        ":prefix": "CLAUSE#",
      },
    })
  );
  return (result.Items ?? []) as Clause[];
}

export async function dbPutClause(
  workspace: string,
  clause: Clause
): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        ...clause,
        PK: clausePK(workspace, clause.contractId),
        SK: `CLAUSE#${clause.contractId}#${clause.id}`,
      },
    })
  );
}

export async function dbUpdateClauseStatus(
  workspace: string,
  contractId: string,
  clauseId: string,
  status: Clause["status"]
): Promise<void> {
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        PK: clausePK(workspace, contractId),
        SK: `CLAUSE#${contractId}#${clauseId}`,
      },
      UpdateExpression: "SET #status = :status, updatedAt = :ts",
      ExpressionAttributeNames:  { "#status": "status" },
      ExpressionAttributeValues: { ":status": status, ":ts": new Date().toISOString() },
    })
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function dbListAlerts(
  workspace: string,
  opts?: { status?: string }
): Promise<Alert[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": workspace, ":prefix": "ALERT#" },
      ScanIndexForward: false,
    })
  );
  let items = ((result.Items ?? []) as Alert[]).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  if (opts?.status) items = items.filter((a) => a.status === opts.status);
  return items;
}

export async function dbUpdateAlertStatus(
  workspace: string,
  id: string,
  status: Alert["status"]
): Promise<void> {
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: workspace, SK: `ALERT#${id}` },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames:  { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  );
}

export async function dbPutAlert(workspace: string, alert: Alert): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: { ...alert, PK: workspace, SK: `ALERT#${alert.id}` },
    })
  );
}

// ── Activity ──────────────────────────────────────────────────────────────────

export async function dbListActivity(
  workspace: string,
  limit = 20
): Promise<ActivityEvent[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": workspace, ":prefix": "ACTIVITY#" },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items ?? []) as ActivityEvent[];
}

export async function dbPutActivity(
  workspace: string,
  event: ActivityEvent
): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: { ...event, PK: workspace, SK: `ACTIVITY#${event.timestamp}#${event.id}` },
    })
  );
}

// ── Amendments ────────────────────────────────────────────────────────────────

export async function dbListAmendments(
  workspace: string,
  contractId: string
): Promise<Amendment[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk":     clausePK(workspace, contractId),
        ":prefix": "AMENDMENT#",
      },
      ScanIndexForward: false,
    })
  );
  return (result.Items ?? []) as Amendment[];
}

export async function dbGetAmendment(
  workspace: string,
  contractId: string,
  amendmentId: string
): Promise<Amendment | null> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        PK: clausePK(workspace, contractId),
        SK: `AMENDMENT#${amendmentId}`,
      },
    })
  );
  return (result.Item as Amendment) ?? null;
}

export async function dbPutAmendment(
  workspace: string,
  amendment: Amendment
): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        ...amendment,
        PK: clausePK(workspace, amendment.contractId),
        SK: `AMENDMENT#${amendment.id}`,
      },
    })
  );
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function dbGetDashboardStats(workspace: string) {
  const contracts = await dbListContracts(workspace);
  const ready     = contracts.filter((c) => c.status === "ready");
  const totalValue = ready.reduce((s, c) => s + (c.contractValue ?? 0), 0);

  const allClauses = (
    await Promise.all(ready.map((c) => dbListClauses(workspace, c.id)))
  ).flat();

  const highRisk = allClauses.filter(
    (cl) => cl.riskLevel === "high" && cl.status === "active"
  );

  const today = Date.now();
  const in30  = today + 30 * 86_400_000;
  const upcoming = allClauses.filter((cl) => {
    if (!cl.dueDate) return false;
    const d = new Date(cl.dueDate).getTime();
    return d >= today && d <= in30;
  });

  const alerts       = await dbListAlerts(workspace);
  const pendingCount = alerts.filter((a) => a.status === "pending").length;

  return {
    totalValue,
    activeContracts:      ready.length,
    processingCount:      contracts.filter((c) => c.status === "processing").length,
    highRiskClauseCount:  highRisk.length,
    upcomingDeadlineCount:upcoming.length,
    pendingAlertCount:    pendingCount,
  };
}
