import { NextResponse } from 'next/server';
import { API_BASE_URL } from './constants';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/signin', '/signup'];

export function isProtectedRoute(url: string): boolean {
  return PROTECTED_ROUTES.some((route) => url.includes(route));
}

export function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((route) => url.includes(route));
}

export async function validateRefreshToken(refreshToken: string | undefined): Promise<boolean> {
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        cookie: `refreshToken=${refreshToken}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

export function deleteRefreshTokenCookie(response: NextResponse): void {
  response.cookies.delete('refreshToken');
}
