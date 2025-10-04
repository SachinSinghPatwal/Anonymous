// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  const isHome = pathname === "/";
  const isAuthRoute =
    pathname.startsWith("/signIn") ||
    pathname.startsWith("/signUp") ||
    pathname.startsWith("/verify");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/u");

  // If logged in: keep them off auth pages and home
  if (token && (isAuthRoute || isHome)) {
    if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // If NOT logged in: protect private routes **and home**
  if (!token && (isProtectedRoute || isHome)) {
    if (pathname !== "/signIn") {
      return NextResponse.redirect(new URL("/signIn", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signIn",
    "/signUp",
    "/verify/:path*",
    "/dashboard/:path*",
    "/u/:path*",
  ],
};
