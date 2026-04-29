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

    const normalizedEmail = String(email).trim().toLowerCase();

    const tokens = await cognitoLogin(normalizedEmail, password);
    const user   = await cognitoGetUser(normalizedEmail);

    await setSession(tokens.accessToken, tokens.refreshToken, {
      userId: user.sub,
      email:  user.email,
      name:   user.name,
    });

    await dbSeedWorkspace(`WS#${user.sub}`).catch(() => {});

    return Response.json({ ok: true, user: { email: user.email, name: user.name } });
  } catch (err: unknown) {
    console.error("Login error:", err);

    // Cognito throws objects with a `name` or `__type` field, not plain Error subclasses.
    const errName = (err as { name?: string; __type?: string }).name
      ?? (err as { __type?: string }).__type
      ?? "";
    const msg = err instanceof Error ? err.message : String(err);

    // User signed up but hasn't confirmed their email yet
    if (errName === "UserNotConfirmedException" || msg.includes("UserNotConfirmedException")) {
      return Response.json(
        {
          error:       "Please verify your email before signing in.",
          code:        "USER_NOT_CONFIRMED",
          redirectTo:  `/verify?email=${encodeURIComponent((err as { email?: string }).email ?? "")}`,
        },
        { status: 403 }
      );
    }

    if (
      errName === "NotAuthorizedException" ||
      msg.includes("NotAuthorizedException") ||
      msg.includes("Incorrect username or password")
    ) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    if (
      errName === "UserNotFoundException" ||
      msg.includes("UserNotFoundException") ||
      msg.includes("user does not exist")
    ) {
      // Return same message as wrong password to avoid user enumeration
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    if (
      errName === "TooManyRequestsException" ||
      errName === "LimitExceededException" ||
      msg.includes("TooManyRequests") ||
      msg.includes("LimitExceeded")
    ) {
      return Response.json(
        { error: "Too many attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    if (errName === "InvalidParameterException" || msg.includes("Auth flow not enabled")) {
      console.error(
        "⚠️  Cognito App Client is missing ALLOW_USER_PASSWORD_AUTH.\n" +
        "   Run:  npm run setup:cognito"
      );
      return Response.json(
        { error: "Authentication is not configured correctly. Contact support." },
        { status: 503 }
      );
    }

    return Response.json({ error: "Sign in failed. Please try again." }, { status: 500 });
  }
}
