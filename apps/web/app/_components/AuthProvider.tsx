'use client';

import { AuthContext } from '@/contexts/Auth';
import { signOut } from '@/lib/api/auth';
import { MeResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import { useEffect } from 'react';

export default function AuthProvider({
  children,
  user,
  accessToken
}: React.PropsWithChildren<{ user: MeResponse['data'] | null; accessToken: string | null }>) {
  const setAccessToken = useTokenStore((state) => state.setAccessToken);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (!user) {
      signOut().catch((err) => {
        console.error('Error signing out:', err);
      });
    }
  }, [accessToken, setAccessToken, user]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
