import { fetchApiWithAutoRefresh } from './apiClient';
import { MeResponse, GetUsersResponse, UpdateUserResponse } from './types';

export function getMe(accessToken: string | null) {
  return fetchApiWithAutoRefresh<MeResponse>('/user/me', accessToken);
}

export function getUsers(
  accessToken: string | null,
  query?: { page?: number; limit?: number; email?: string; name?: string; role?: 'ADMIN' | 'LIBRARIAN' | 'MEMBER' }
) {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.email) params.append('email', query.email);
  if (query?.name) params.append('name', query.name);
  if (query?.role) params.append('role', query.role);

  const queryString = params.toString();
  return fetchApiWithAutoRefresh<GetUsersResponse>(`/admin/user${queryString ? `?${queryString}` : ''}`, accessToken, {
    method: 'GET'
  });
}

export function updateUser(
  accessToken: string | null,
  userId: string,
  data: { name?: string; email?: string; role?: 'ADMIN' | 'LIBRARIAN' | 'MEMBER'; password?: string }
) {
  return fetchApiWithAutoRefresh<UpdateUserResponse>(`/admin/user/${userId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
