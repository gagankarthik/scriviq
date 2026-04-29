/**
 * Seed scriviq-main DynamoDB table with demo data.
 * Run once: npx tsx scripts/seed-dynamo.ts
 * Requires .env.local to be loaded (use dotenv or set env vars manually).
 */

import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { CONTRACTS, CLAUSES, ALERTS, TEAM_MEMBERS, ACTIVITY } from "../src/lib/mock-data";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION ?? "us-east-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLE = process.env.DYNAMODB_TABLE ?? "scriviq-main";
const WS = "WS#default";

async function put(item: Record<string, unknown>) {
  await client.send(new PutCommand({ TableName: TABLE, Item: item }));
}

async function seed() {
  console.log(`Seeding table: ${TABLE}`);

  for (const c of CONTRACTS) {
    await put({ ...c, PK: WS, SK: `CONTRACT#${c.id}` });
    process.stdout.write(`  ✓ contract ${c.id}\n`);
  }

  for (const cl of CLAUSES) {
    await put({
      ...cl,
      PK: `CONTRACT#${cl.contractId}`,
      SK: `CLAUSE#${cl.contractId}#${cl.id}`,
    });
    process.stdout.write(`  ✓ clause ${cl.id}\n`);
  }

  for (const a of ALERTS) {
    await put({ ...a, PK: WS, SK: `ALERT#${a.id}` });
    process.stdout.write(`  ✓ alert ${a.id}\n`);
  }

  for (const m of TEAM_MEMBERS) {
    await put({ ...m, PK: WS, SK: `MEMBER#${m.id}` });
    process.stdout.write(`  ✓ member ${m.id}\n`);
  }

  for (const ev of ACTIVITY) {
    await put({ ...ev, PK: WS, SK: `ACTIVITY#${ev.timestamp}#${ev.id}` });
    process.stdout.write(`  ✓ activity ${ev.id}\n`);
  }

  console.log("\nSeeding complete!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
