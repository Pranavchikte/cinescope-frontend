import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    // Public routes (no auth needed)
    const publicRoutes = ["/login", "/signup"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If user has token and tries to access login/signup, redirect to home
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If user has no token and tries to access protected routes, redirect to login
    if (!token && !isPublicRoute && pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};