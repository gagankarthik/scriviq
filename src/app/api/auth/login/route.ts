import type { NextRequest } from "next/server";
import { cognitoLogin, cognitoGetUser } from "@/lib/auth/cognito";
import { setSession } from "@/lib/auth/session";
import { dbSeedWorkspace } from "@/lib/aws/workspace";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Authenticate with Cognito
    const tokens = await cognitoLogin(email.trim().toLowerCase(), password);

    // Fetch user attributes from Cognito
    const user = await cognitoGetUser(email.trim().toLowerCase());

    // Set session cookies
    await setSession(tokens.accessToken, tokens.refreshToken, {
      userId: user.sub,
      email:  user.email,
      name:   user.name,
    });

    // Seed workspace with demo data if it's empty (first login)
    await dbSeedWorkspace(`WS#${user.sub}`).catch(() => {});

    return Response.json({ ok: true, user: { email: user.email, name: user.name } });
  } catch (err: unknown) {
    console.error("Login error:", err);
    const msg = err instanceof Error ? err.message : "Login failed";

    if (msg.includes("NotAuthorizedException") || msg.includes("Incorrect")) {
      return Response.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    if (msg.includes("UserNotFoundException") || msg.includes("user does not exist")) {
      return Response.json({ error: "No account found with this email" }, { status: 404 });
    }

    return Response.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
