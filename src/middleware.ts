import { NextResponse, NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = await getToken({ req: request });
  if (
    (token && url.pathname.startsWith("/signIn")) ||
    (token && url.pathname.startsWith("/verify")) ||
    (token && url.pathname.startsWith("/signUp")) ||
    (token && url.pathname.startsWith("/"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signIn", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signIn", "/signUp", "/dashboard/:path*", "/verify/:path*"],
};
