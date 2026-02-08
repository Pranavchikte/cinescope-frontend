import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    // Always allow public routes
    const publicRoutes = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
    ];

    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    );

    // 🚨 CRITICAL RULE: Never block public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Protect private routes
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Let backend decide if token is valid
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
