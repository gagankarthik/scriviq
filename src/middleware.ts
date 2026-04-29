import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require auth
const PUBLIC = ["/", "/login", "/signup", "/api/auth"];
// Static assets — always skip
const SKIP_RE = /^\/((_next|_vercel|favicon\.ico|.*\.(png|svg|ico|woff2|webp))).*/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_RE.test(pathname)) return NextResponse.next();

  const isPublic  = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const hasToken  = request.cookies.has("scriviq-access");

  // Unauthenticated request to protected route
  if (!isPublic && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to visit auth pages → send to dashboard
  if (hasToken && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
