import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE } from "./dynamodb";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function dbSeedWorkspace(_workspace: string): Promise<void> {
  // No-op: workspaces start empty. Users upload their own contracts.
}
