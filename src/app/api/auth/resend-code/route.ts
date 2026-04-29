import type { NextRequest } from "next/server";
import { cognitoResendCode } from "@/lib/auth/cognito";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { codeDeliveredTo } = await cognitoResendCode(normalizedEmail);

    return Response.json(
      { ok: true, codeDeliveredTo: codeDeliveredTo ?? normalizedEmail },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Resend error:", err);
    const msg = err instanceof Error ? err.message : "Resend failed";

    if (msg.includes("UserNotFoundException")) {
      return Response.json({ error: "We couldn't find an account with that email." }, { status: 404 });
    }
    if (msg.includes("InvalidParameterException") && msg.includes("CONFIRMED")) {
      return Response.json(
        { error: "This account is already verified. You can sign in." },
        { status: 409 }
      );
    }
    if (msg.includes("LimitExceededException") || msg.includes("TooManyRequestsException")) {
      return Response.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    return Response.json({ error: "Could not resend code. Please try again." }, { status: 500 });
  }
}
