'use client';

import { AuthContext } from '@/contexts/Auth';
import { MeResponse } from '@/lib/api/types';
import { useState } from 'react';

export default function AuthProvider({
  children,
  user,
  accessToken
}: React.PropsWithChildren<{ user: MeResponse['data'] | null; accessToken: string | null }>) {
  const [token, setToken] = useState<string | null>(accessToken);

  return (
    <AuthContext.Provider value={{ user, accessToken: token, setAccessToken: setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
