import { fetchApi } from './apiClient';
import { SignInResponse, SignUpResponse, RefreshTokenResponse } from './types';

export function signIn(data: { email: string; password: string }) {
  return fetchApi<SignInResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(data),
    'content-type': 'application/json'
  });
}

export function signUp(data: { email: string; password: string; fullName: string }) {
  return fetchApi<SignUpResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
    'content-type': 'application/json'
  });
}

export function signOut() {
  return fetchApi('/auth/signout', {
    method: 'POST',
    includeCredentials: true
  });
}

export function refreshToken() {
  return fetchApi<RefreshTokenResponse>('/auth/refresh-token', {
    method: 'POST',
    includeCredentials: true
  });
}
