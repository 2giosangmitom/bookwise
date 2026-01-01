'use client';

import { AuthContext } from '@/contexts/Auth';
import { MeResponse } from '@/lib/api/types';

export default function AuthProvider({ children, user }: React.PropsWithChildren<{ user: MeResponse['data'] | null }>) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
