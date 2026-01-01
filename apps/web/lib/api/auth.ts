import { fetchApi } from './apiClient';
import { SignInResponse, SignUpResponse } from './types';

export function signIn(data: { email: string; password: string }) {
  return fetchApi<SignInResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
}

export function signUp(data: { email: string; password: string; fullName: string }) {
  return fetchApi<SignUpResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
}

export function signOut() {
  return fetchApi('/auth/signout', {
    method: 'POST',
    credentials: 'include'
  });
}
