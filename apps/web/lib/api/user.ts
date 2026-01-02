import { fetchApiWithAutoRefresh } from './apiClient';
import { MeResponse } from './types';

export function getMe(accessToken: string | null) {
  return fetchApiWithAutoRefresh<MeResponse>('/user/me', accessToken);
}
