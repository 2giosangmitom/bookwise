import { MeResponse } from '@/lib/api/types';
import { createContext, useContext } from 'react';

const AuthContext = createContext<{
  user: MeResponse['data'] | null;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}>({
  user: null,
  accessToken: null,
  setAccessToken: () => {}
});

function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext, useAuthContext };
