import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE } from "./dynamodb";
import { CONTRACTS, CLAUSES, ALERTS, TEAM_MEMBERS, ACTIVITY } from "@/lib/mock-data";

export async function dbWorkspaceIsEmpty(workspace: string): Promise<boolean> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": workspace, ":prefix": "CONTRACT#" },
      Limit: 1,
      Select: "COUNT",
    })
  );
  return (result.Count ?? 0) === 0;
}

export async function dbSeedWorkspace(workspace: string): Promise<void> {
  const isEmpty = await dbWorkspaceIsEmpty(workspace);
  if (!isEmpty) return; // already seeded

  const puts: Promise<unknown>[] = [];

  for (const c of CONTRACTS) {
    puts.push(
      dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: { ...c, PK: workspace, SK: `CONTRACT#${c.id}` },
        ConditionExpression: "attribute_not_exists(PK)", // idempotent
      })).catch(() => {}) // ignore "already exists"
    );
  }

  for (const cl of CLAUSES) {
    puts.push(
      dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: {
          ...cl,
          PK: `${workspace}#CONTRACT#${cl.contractId}`,
          SK: `CLAUSE#${cl.contractId}#${cl.id}`,
        },
      })).catch(() => {})
    );
  }

  for (const a of ALERTS) {
    puts.push(
      dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: { ...a, PK: workspace, SK: `ALERT#${a.id}` },
      })).catch(() => {})
    );
  }

  for (const m of TEAM_MEMBERS) {
    puts.push(
      dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: { ...m, PK: workspace, SK: `MEMBER#${m.id}` },
      })).catch(() => {})
    );
  }

  for (const ev of ACTIVITY) {
    puts.push(
      dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: { ...ev, PK: workspace, SK: `ACTIVITY#${ev.timestamp}#${ev.id}` },
      })).catch(() => {})
    );
  }

  await Promise.all(puts);
}
