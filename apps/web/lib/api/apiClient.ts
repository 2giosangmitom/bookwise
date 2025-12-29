import { useAuthStore } from '@/hooks/useAuthStore';
import { API_BASE_URL } from '../constants';
import { refreshToken } from './auth';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function fetchApi<T>(
  path: string,
  options?: Partial<{
    method: string;
    body: string;
    includeCredentials: boolean;
    accessToken: string;
    tryRefreshToken: boolean;
    'content-type': string;
  }>
): Promise<T> {
  // Build headers
  const headers: Record<string, string> = {};
  if (options?.['content-type']) {
    headers['Content-Type'] = options['content-type'];
  }
  if (options?.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method,
    headers,
    credentials: options?.includeCredentials ? 'include' : 'same-origin',
    body: options?.body ? JSON.stringify(options.body) : undefined
  });

  const json = await res.json();

  if (!res.ok) {
    if (options?.tryRefreshToken && (res.status === 401 || res.status === 403)) {
      try {
        const refreshRes = await refreshToken();
        const authStore = useAuthStore.getState();
        authStore.setAccessToken(refreshRes.data.access_token);

        return fetchApi<T>(path, {
          ...options,
          accessToken: refreshRes.data.access_token,
          tryRefreshToken: false
        }); // Retry original request with new token
      } catch {
        throw new ApiError(res.status, json.message || 'API request failed');
      }
    }

    throw new ApiError(res.status, json.message || 'API request failed');
  }

  return json;
}
