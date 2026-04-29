import type { NextRequest } from "next/server";
import { cognitoConfirmSignUp, cognitoLogin, cognitoGetUser } from "@/lib/auth/cognito";
import { setSession } from "@/lib/auth/session";
import { dbSeedWorkspace } from "@/lib/aws/workspace";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();
    if (!email || !code) {
      return Response.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanCode       = String(code).trim();

    // Confirm the verification code with Cognito
    await cognitoConfirmSignUp(normalizedEmail, cleanCode);

    // If a password was provided, auto-login the user (best UX).
    // If not, the verify page can redirect to /login.
    if (password) {
      const tokens = await cognitoLogin(normalizedEmail, password);
      const user   = await cognitoGetUser(normalizedEmail);

      await setSession(tokens.accessToken, tokens.refreshToken, {
        userId: user.sub,
        email:  user.email,
        name:   user.name,
      });

      // Seed demo data for the new workspace (best-effort, non-blocking)
      await dbSeedWorkspace(`WS#${user.sub}`).catch(() => {});

      return Response.json(
        { ok: true, loggedIn: true, user: { email: user.email, name: user.name } },
        { status: 200 }
      );
    }

    return Response.json({ ok: true, loggedIn: false }, { status: 200 });
  } catch (err: unknown) {
    console.error("Verify error:", err);
    const msg = err instanceof Error ? err.message : "Verification failed";

    if (msg.includes("CodeMismatchException")) {
      return Response.json({ error: "That code doesn't match. Please try again." }, { status: 400 });
    }
    if (msg.includes("ExpiredCodeException")) {
      return Response.json(
        { error: "Code expired. Tap 'Resend code' to get a new one." },
        { status: 400 }
      );
    }
    if (msg.includes("NotAuthorizedException") && msg.includes("CONFIRMED")) {
      return Response.json(
        { error: "This account is already verified. You can sign in." },
        { status: 409 }
      );
    }
    if (msg.includes("UserNotFoundException")) {
      return Response.json({ error: "We couldn't find an account with that email." }, { status: 404 });
    }
    if (msg.includes("LimitExceededException") || msg.includes("TooManyRequestsException")) {
      return Response.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }

    return Response.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
