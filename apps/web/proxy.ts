import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();

  // Require librarian or admin role for /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Redirect authenticated users away from /signin and /signup pages
  if (pathname === "/signin" || pathname === "/signup") {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
