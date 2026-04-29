import type { NextRequest } from "next/server";
import { cognitoSignUpSelf, cognitoResendCode } from "@/lib/auth/cognito";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; password?: string } = {};

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (String(password).length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const { codeDeliveredTo } = await cognitoSignUpSelf(
      normalizedEmail,
      String(password),
      String(name).trim()
    );

    return Response.json(
      { ok: true, email: normalizedEmail, codeDeliveredTo: codeDeliveredTo ?? normalizedEmail },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Signup error:", err);

    const errName = (err as { name?: string; __type?: string }).name
      ?? (err as { __type?: string }).__type
      ?? "";
    const msg = err instanceof Error ? err.message : String(err);

    // Account exists — check if it's unconfirmed (resend code) or confirmed (tell user to log in)
    if (errName === "UsernameExistsException" || msg.includes("UsernameExistsException")) {
      try {
        const { codeDeliveredTo } = await cognitoResendCode(normalizedEmail);
        return Response.json(
          {
            ok:              true,
            email:           normalizedEmail,
            codeDeliveredTo: codeDeliveredTo ?? normalizedEmail,
            resent:          true,
          },
          { status: 201 }
        );
      } catch (resendErr: unknown) {
        const resendMsg = resendErr instanceof Error ? resendErr.message : String(resendErr);
        const resendName = (resendErr as { name?: string }).name ?? "";

        if (
          resendMsg.includes("CONFIRMED") ||
          resendName === "NotAuthorizedException" ||
          resendMsg.includes("NotAuthorizedException")
        ) {
          return Response.json(
            { error: "An account with this email already exists. Try signing in instead." },
            { status: 409 }
          );
        }

        return Response.json(
          { error: "An account with this email already exists. Try signing in instead." },
          { status: 409 }
        );
      }
    }

    if (errName === "InvalidPasswordException" || msg.includes("InvalidPasswordException")) {
      return Response.json(
        { error: "Password must be 8+ chars with uppercase, lowercase, number, and symbol." },
        { status: 400 }
      );
    }

    if (errName === "InvalidParameterException" || msg.includes("InvalidParameterException")) {
      return Response.json({ error: "Please use a valid email address." }, { status: 400 });
    }

    if (
      errName === "TooManyRequestsException" ||
      errName === "LimitExceededException" ||
      msg.includes("TooManyRequests") ||
      msg.includes("LimitExceeded")
    ) {
      return Response.json(
        { error: "Too many requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    return Response.json({ error: "Sign up failed. Please try again." }, { status: 500 });
  }
}
