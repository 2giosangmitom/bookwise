import { NextResponse } from 'next/server';
import { API_BASE_URL } from './constants';
import { getMe } from './api/user';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/signin', '/signup'];

export function isProtectedRoute(url: string): boolean {
  return PROTECTED_ROUTES.some((route) => url.includes(route));
}

export function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((route) => url.includes(route));
}

export async function validateRefreshToken(
  refreshToken: string | undefined
): Promise<{ isValid: boolean; role: string | null }> {
  if (!refreshToken) {
    return { isValid: false, role: null };
  }

  try {
    const response = await fetch(`${API_BASE_URL()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        cookie: `refreshToken=${refreshToken}`
      }
    });
    const me = await getMe((await response.json()).data.access_token);

    return { isValid: response.ok, role: me.data.role };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { isValid: false, role: null };
  }
}

export function deleteRefreshTokenCookie(response: NextResponse): void {
  response.cookies.delete('refreshToken');
}
