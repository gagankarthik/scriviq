import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const raw = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamo = DynamoDBDocumentClient.from(raw, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: true },
});

export const TABLE = process.env.DYNAMODB_TABLE ?? "scriviq-main";

export const PK = {
  workspace: (id = "default") => `WS#${id}`,
  contract:  (id: string)     => `CONTRACT#${id}`,
};

export const SK = {
  contract: (id: string)            => `CONTRACT#${id}`,
  clause:   (contractId: string, clauseId: string) => `CLAUSE#${contractId}#${clauseId}`,
  alert:    (id: string)            => `ALERT#${id}`,
  member:   (userId: string)        => `MEMBER#${userId}`,
  activity: (ts: string, id: string) => `ACTIVITY#${ts}#${id}`,
};
