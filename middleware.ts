import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
    // Protected routes pattern
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/upload") ||
        request.nextUrl.pathname.startsWith("/ask") ||
        request.nextUrl.pathname.startsWith("/memory") ||
        request.nextUrl.pathname.startsWith("/settings");

    // Update session expiration if valid
    const sessionResponse = await updateSession(request);
    if (sessionResponse) {
        // Add no-cache headers on protected routes to prevent bfcache
        // showing stale authenticated pages after sign-out
        if (isProtectedRoute) {
            sessionResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
            sessionResponse.headers.set("Pragma", "no-cache");
            sessionResponse.headers.set("Expires", "0");
        }
        return sessionResponse;
    }

    const session = request.cookies.get("session")?.value;

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if logged in and accessing auth pages
    if (session && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
