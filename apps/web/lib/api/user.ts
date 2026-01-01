import { fetchApiWithAutoRefresh } from './apiClient';
import { MeResponse } from './types';

export function getMe(accessToken?: string) {
  return fetchApiWithAutoRefresh<MeResponse>('/user/me', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
  });
}
