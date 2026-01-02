import { API_BASE_URL } from '../constants';
import { RefreshTokenResponse } from './types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchApi<T>(path: string, options?: Parameters<typeof fetch>[1]): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(json.message || 'API request failed', response.status);
  }
  return json;
}

export async function fetchApiWithAutoRefresh<T>(
  path: string,
  accessToken: string | null,
  options?: Parameters<typeof fetch>[1]
): Promise<T> {
  options = {
    ...options,
    headers: accessToken ? { ...options?.headers, Authorization: `Bearer ${accessToken}` } : options?.headers
  };

  try {
    const response = await fetchApi<T>(path, options);
    return response;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      // Attempt to refresh token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include'
      });

      // If refresh successful, retry original request
      if (refreshResponse.ok) {
        const refreshData = (await refreshResponse.json()) as RefreshTokenResponse;
        // Retry original request with new token
        const retryResponse = await fetchApi<T>(path, {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: `Bearer ${refreshData.data.access_token}`
          }
        });
        return retryResponse;
      }
    }
    throw error;
  }
}
