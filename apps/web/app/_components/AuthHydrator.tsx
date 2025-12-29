'use client';

import { getMe } from '@/lib/api/user';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function AuthHydrator() {
  useEffect(() => {
    (async () => {
      try {
        const authStore = useAuthStore.getState();
        const user = await getMe(authStore.accessToken);
        authStore.setUser(user.data);
      } catch (error) {
        console.error('Failed to hydrate auth:', error);
      }
    })();
  }, []);

  return null;
}
