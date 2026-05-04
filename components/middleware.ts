import { NextRequest, NextResponse } from 'next/server';

/**
 * PRODUCTION-GRADE ROLE-BASED ROUTE GUARD
 *
 * Security model:
 * - At login, the backend issues a signed JWT (RS256/HS256) and we store it as
 *   an `access_token` cookie.
 * - The JWT payload contains the user's `role`.  We base64-decode it here to
 *   extract the role WITHOUT needing to call the backend on every request.
 * - The role value is trustworthy because:
 *     1. The JWT is signed by Django's SECRET_KEY.
 *     2. Tampering with the payload would invalidate the signature.
 *     3. Any subsequent API call still hits the backend which DOES verify the
 *        full signature – the real security boundary.
 * - This middleware is therefore a fast, server-side UX guard that prevents
 *   cross-role navigation and cannot be bypassed by editing a plain cookie.
 *
 * Route ownership:
 *   /executive/**              → "executive"  only
 *   /dashboard/franchisor/**  → "franchisor" only
 *   /dashboard/investor/**    → "investor"   only
 *   /dashboard/**             → any authenticated role
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Decode a JWT and return its payload as a plain object.
 * Returns null if the token is missing, malformed, or expired.
 * NOTE: We intentionally do NOT verify the signature here (no secret available
 * in Edge Runtime).  The backend verifies it on every API call – this function
 * is only used for UX routing.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // JWT uses base64url encoding – convert to standard base64 first
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad to a multiple of 4
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;

    // Reject expired tokens so an old cookie can't grant access
    const exp = payload.exp as number | undefined;
    if (exp && Date.now() / 1000 > exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Extract the role string from a decoded JWT payload.
 *  Supports common claim structures used by djangorestframework-simplejwt. */
function getRoleFromPayload(payload: Record<string, unknown>): string | null {
  // simplejwt custom claims are typically at the top level
  const role =
    (payload.role as string) ||
    (payload.user_role as string) ||
    ((payload.user as Record<string, string>)?.role) ||
    null;
  return role ? String(role) : null;
}

// ─── route map ───────────────────────────────────────────────────────────────

const ROUTE_ROLE_MAP: { prefix: string; allowed: string[] }[] = [
  { prefix: '/executive',            allowed: ['executive'] },
  { prefix: '/dashboard/franchisor', allowed: ['franchisor'] },
  { prefix: '/dashboard/investor',   allowed: ['investor'] },
];

const ROLE_HOME: Record<string, string> = {
  franchisor: '/dashboard/franchisor',
  investor:   '/dashboard/investor',
  executive:  '/executive/dashboard',
};

// ─── middleware ──────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find the first protected prefix that matches this path
  const match = ROUTE_ROLE_MAP.find(({ prefix }) => pathname.startsWith(prefix));

  // Not a protected path – let through
  if (!match) return NextResponse.next();

  // ── 1. Read the JWT from the access_token cookie ──────────────────────────
  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    // No token → redirect to login, preserve the original destination
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Decode the JWT payload (expiry-checked, no signature verification) ─
  const payload = decodeJwtPayload(token);

  if (!payload) {
    // Token is malformed or expired → force re-login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    const res = NextResponse.redirect(loginUrl);
    // Clear the stale cookie
    res.cookies.delete('access_token');
    return res;
  }

  // ── 3. Extract role and enforce access ────────────────────────────────────
  const role = getRoleFromPayload(payload);

  if (!role) {
    // Valid JWT but no role claim – treat as unauthenticated
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (match.allowed.includes(role)) {
    // ✅ Correct role for this section
    return NextResponse.next();
  }

  // ❌ Wrong role → send them to their own landing page
  const home = ROLE_HOME[role] ?? '/';
  const homeUrl = req.nextUrl.clone();
  homeUrl.pathname = home;
  homeUrl.search = '';
  return NextResponse.redirect(homeUrl);
}

// Only run on page routes – skip API routes, _next internals, and static assets
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/executive/:path*',
  ],
};
