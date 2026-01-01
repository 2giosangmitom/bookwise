import { type NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  // Redirect to home page if already authenticated
  if (req.url.includes('/signin') || req.url.includes('/signup')) {
    const isAuthenticated = req.cookies.get('refreshToken');
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect to sign in page if trying to access protected routes
  const protectedRoutes = ['/dashboard'];
  if (protectedRoutes.some((route) => req.url.includes(route))) {
    const isAuthenticated = req.cookies.get('refreshToken');
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
