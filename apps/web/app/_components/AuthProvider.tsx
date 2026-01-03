'use client';

import { AuthContext } from '@/contexts/Auth';
import { MeResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';

export default function AuthProvider({
  children,
  user,
  accessToken
}: React.PropsWithChildren<{ user: MeResponse['data'] | null; accessToken: string | null }>) {
  const setAccessToken = useTokenStore((state) => state.setAccessToken);
  setAccessToken(accessToken);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
