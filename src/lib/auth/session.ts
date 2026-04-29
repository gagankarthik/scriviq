import { cookies } from "next/headers";
import * as jose from "jose";

const ACCESS_COOKIE  = "scriviq-access";
const REFRESH_COOKIE = "scriviq-refresh";
const USER_COOKIE    = "scriviq-user"; // stores serialized user info (non-sensitive)

const ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`;

// Lazily created JWKS — avoids fetch at module load time
let _jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!_jwks) {
    _jwks = jose.createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
  }
  return _jwks;
}

export type Session = {
  userId:      string;
  email:       string;
  name:        string;
  accessToken: string;
  workspace:   string; // `WS#${userId}`
};

export async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const accessToken = jar.get(ACCESS_COOKIE)?.value;
    const userJson    = jar.get(USER_COOKIE)?.value;
    if (!accessToken) return null;

    // Fast path: if user cookie exists, skip JWKS fetch for perf
    if (userJson) {
      const user = JSON.parse(userJson) as Omit<Session, "accessToken" | "workspace">;
      return { ...user, accessToken, workspace: `WS#${user.userId}` };
    }

    // Verify token via JWKS
    const { payload } = await jose.jwtVerify(accessToken, getJWKS(), { issuer: ISSUER });
    const userId = payload.sub!;
    const email  = (payload.email as string | undefined) ?? userId;
    const name   = (payload.name as string | undefined) ?? email;
    return { userId, email, name, accessToken, workspace: `WS#${userId}` };
  } catch {
    return null;
  }
}

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
  maxAge,
});

export async function setSession(
  accessToken:  string,
  refreshToken: string,
  user: { userId: string; email: string; name: string }
): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE,  accessToken,  COOKIE_OPTS(60 * 60));          // 1h
  jar.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTS(60 * 60 * 24 * 30));// 30d
  jar.set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTS(60 * 60));
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(USER_COOKIE);
}
