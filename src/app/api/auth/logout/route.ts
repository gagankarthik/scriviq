import { cognitoSignOut } from "@/lib/auth/cognito";
import { getSession, clearSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (session?.accessToken) {
      await cognitoSignOut(session.accessToken).catch(() => {});
    }
    await clearSession();
    return Response.json({ ok: true });
  } catch {
    await clearSession();
    return Response.json({ ok: true });
  }
}
