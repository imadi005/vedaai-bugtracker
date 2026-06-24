import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({ user: res.data.user, token: res.data.token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user });
        } catch {
          set({ user: null, token: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'vedaai-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
