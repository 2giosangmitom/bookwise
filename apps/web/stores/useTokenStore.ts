import { create } from 'zustand';

const useTokenStore = create<{
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}>((set) => ({
  accessToken: null,
  setAccessToken: (token: string | null) => set({ accessToken: token })
}));

export default useTokenStore;
