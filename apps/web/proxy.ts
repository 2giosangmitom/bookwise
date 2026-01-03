import { type NextRequest, NextResponse } from 'next/server';
import { isProtectedRoute, isAuthRoute, validateRefreshToken, deleteRefreshTokenCookie } from './lib/middleware';

export async function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isProtected = isProtectedRoute(req.url);
  const isAuth = isAuthRoute(req.url);

  // Validate token for protected routes
  if (isProtected) {
    const { isValid, role } = await validateRefreshToken(refreshToken);

    if (!isValid) {
      const response = NextResponse.redirect(new URL('/signin', req.url));
      deleteRefreshTokenCookie(response);
      return response;
    }

    // Only LIBRARIAN and ADMIN can access dashboard
    if (req.url.includes('/dashboard') && role && role !== 'LIBRARIAN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect authenticated users away from auth routes
  if (isAuth && refreshToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
