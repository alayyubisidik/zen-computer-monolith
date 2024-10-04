import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const session = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
    
    if (
        req.nextUrl.pathname === "/auth/signup" ||
        req.nextUrl.pathname === "/auth/signin"
    ) {
        if (session !== null) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    if (session == null) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/dashboard")) {
        if (session.role !== 'admin') {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/auth/signup",
        "/auth/signin",
        "/account/:path*",
        "/cart",
        "/checkout",
        '/dashboard/:path*',
        '/dashboard/:path*',
    ],
};
