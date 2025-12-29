import { fetchApi } from './apiClient';
import { MeResponse } from './types';

export function getMe(accessToken: string | null) {
  return fetchApi<MeResponse>('/user/me', {
    method: 'GET',
    tryRefreshToken: true,
    accessToken: accessToken || undefined
  });
}
