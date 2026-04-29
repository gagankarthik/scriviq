import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string };
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const name = body.name?.trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  try {
    await cognito.send(
      new UpdateUserAttributesCommand({
        AccessToken:    session.accessToken,
        UserAttributes: [{ Name: "name", Value: name }],
      })
    );

    // Refresh the user cookie so TopNav picks up the new name
    const jar = await cookies();
    const raw = jar.get("scriviq-user")?.value;
    if (raw) {
      const user = JSON.parse(raw) as { userId: string; email: string; name: string };
      jar.set("scriviq-user", JSON.stringify({ ...user, name }), {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60,
      });
    }

    return Response.json({ ok: true, name });
  } catch (err) {
    console.error("PATCH /api/auth/profile", err);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
