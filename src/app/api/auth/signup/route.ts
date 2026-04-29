import type { NextRequest } from "next/server";
import { cognitoSignUp, cognitoLogin, cognitoGetUser } from "@/lib/auth/cognito";
import { setSession } from "@/lib/auth/session";
import { dbSeedWorkspace } from "@/lib/aws/workspace";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, company } = await request.json();
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Create user in Cognito
    await cognitoSignUp(email.trim().toLowerCase(), password, name.trim());

    // Immediately log in to get tokens
    const tokens = await cognitoLogin(email.trim().toLowerCase(), password);
    const user   = await cognitoGetUser(email.trim().toLowerCase());

    await setSession(tokens.accessToken, tokens.refreshToken, {
      userId: user.sub,
      email:  user.email,
      name:   user.name,
    });

    // Seed demo data for new workspace
    await dbSeedWorkspace(`WS#${user.sub}`).catch(() => {});

    return Response.json({ ok: true, user: { email: user.email, name: user.name } }, { status: 201 });
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const msg = err instanceof Error ? err.message : "Signup failed";

    if (msg.includes("UsernameExistsException") || msg.includes("already exists")) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    if (msg.includes("InvalidPasswordException") || msg.includes("password")) {
      return Response.json({ error: "Password must be 8+ chars with uppercase, number, and symbol" }, { status: 400 });
    }

    return Response.json({ error: "Sign up failed. Please try again." }, { status: 500 });
  }
}
