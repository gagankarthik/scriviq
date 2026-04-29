/**
 * One-time script: enables ALLOW_USER_PASSWORD_AUTH on your Cognito App Client.
 * Run once after creating the User Pool:
 *
 *   node scripts/setup-cognito.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  UpdateUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// ─── Read .env.local ─────────────────────────────────────────────────────────
const root    = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = resolve(root, ".env.local");
const env     = {};

try {
  const lines = readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq  = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key]  = val;
  }
} catch {
  console.error("❌  Could not read .env.local — make sure it exists in the project root.");
  process.exit(1);
}

const region     = env.AWS_REGION;
const poolId     = env.AWS_COGNITO_USER_POOL_ID;
const clientId   = env.AWS_COGNITO_CLIENT_ID;
const accessKey  = env.AWS_ACCESS_KEY_ID;
const secretKey  = env.AWS_SECRET_ACCESS_KEY;

if (!region || !poolId || !clientId || !accessKey || !secretKey) {
  console.error("❌  Missing one or more required env vars:");
  console.error("    AWS_REGION, AWS_COGNITO_USER_POOL_ID, AWS_COGNITO_CLIENT_ID,");
  console.error("    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");
  process.exit(1);
}

// ─── Cognito client ───────────────────────────────────────────────────────────
const cognito = new CognitoIdentityProviderClient({
  region,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
});

// ─── Required auth flows ──────────────────────────────────────────────────────
const REQUIRED_FLOWS = [
  "ALLOW_USER_PASSWORD_AUTH",
  "ALLOW_REFRESH_TOKEN_AUTH",
];

async function run() {
  console.log(`\n🔍  Fetching App Client  ${clientId}`);
  console.log(`    User Pool           ${poolId}`);
  console.log(`    Region              ${region}\n`);

  // 1. Read current settings
  const { UserPoolClient: current } = await cognito.send(
    new DescribeUserPoolClientCommand({ UserPoolId: poolId, ClientId: clientId })
  );

  if (!current) {
    console.error("❌  App client not found. Check AWS_COGNITO_CLIENT_ID and AWS_COGNITO_USER_POOL_ID.");
    process.exit(1);
  }

  const existing  = current.ExplicitAuthFlows ?? [];
  const missing   = REQUIRED_FLOWS.filter((f) => !existing.includes(f));

  if (missing.length === 0) {
    console.log("✅  All required auth flows are already enabled:");
    existing.forEach((f) => console.log(`    • ${f}`));
    console.log("\n  Nothing to do. Your app should work now.\n");
    return;
  }

  const updated = [...new Set([...existing, ...REQUIRED_FLOWS])];

  console.log("⚙️   Updating explicit auth flows:");
  console.log(`    Adding:   ${missing.join(", ")}`);
  console.log(`    Keeping:  ${existing.filter((f) => !missing.includes(f)).join(", ") || "(none)"}`);
  console.log(`    Final:    ${updated.join(", ")}\n`);

  // 2. Update — preserve all other existing settings
  await cognito.send(
    new UpdateUserPoolClientCommand({
      UserPoolId:         poolId,
      ClientId:           clientId,
      ExplicitAuthFlows:  updated,

      // Preserve everything else that DescribeUserPoolClient returned
      ClientName:                          current.ClientName,
      RefreshTokenValidity:                current.RefreshTokenValidity,
      AccessTokenValidity:                 current.AccessTokenValidity,
      IdTokenValidity:                     current.IdTokenValidity,
      TokenValidityUnits:                  current.TokenValidityUnits,
      ReadAttributes:                      current.ReadAttributes,
      WriteAttributes:                     current.WriteAttributes,
      SupportedIdentityProviders:          current.SupportedIdentityProviders,
      CallbackURLs:                        current.CallbackURLs,
      LogoutURLs:                          current.LogoutURLs,
      AllowedOAuthFlows:                   current.AllowedOAuthFlows,
      AllowedOAuthScopes:                  current.AllowedOAuthScopes,
      AllowedOAuthFlowsUserPoolClient:     current.AllowedOAuthFlowsUserPoolClient,
      PreventUserExistenceErrors:          current.PreventUserExistenceErrors,
      EnableTokenRevocation:               current.EnableTokenRevocation,
      EnablePropagateAdditionalUserContextData: current.EnablePropagateAdditionalUserContextData,
      AuthSessionValidity:                 current.AuthSessionValidity,
    })
  );

  console.log("✅  Done! Auth flows updated successfully.");
  console.log("    Restart your dev server and try signing up / logging in.\n");
}

run().catch((err) => {
  console.error("❌  Error:", err.message ?? err);
  process.exit(1);
});
