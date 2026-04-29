import type { NextRequest } from "next/server";
import { cognitoSignUpSelf } from "@/lib/auth/cognito";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { codeDeliveredTo } = await cognitoSignUpSelf(normalizedEmail, password, name.trim());

    return Response.json(
      {
        ok: true,
        email:           normalizedEmail,
        codeDeliveredTo: codeDeliveredTo ?? normalizedEmail,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const msg = err instanceof Error ? err.message : "Signup failed";

    if (msg.includes("UsernameExistsException") || msg.includes("already exists")) {
      return Response.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 }
      );
    }
    if (msg.includes("InvalidPasswordException")) {
      return Response.json(
        { error: "Password must be 8+ chars with uppercase, lowercase, number, and symbol." },
        { status: 400 }
      );
    }
    if (msg.includes("InvalidParameterException")) {
      return Response.json(
        { error: "Please use a valid email address." },
        { status: 400 }
      );
    }

    return Response.json({ error: "Sign up failed. Please try again." }, { status: 500 });
  }
}
