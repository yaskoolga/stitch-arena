import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/projects", "/profile", "/community", "/favorites"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Handle authentication for protected routes
  if (isProtectedRoute) {
    const token = await getToken({ req: request });

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/profile/:path*", "/community/:path*", "/favorites/:path*"],
};
