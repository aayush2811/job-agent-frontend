import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: unknown | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: unknown, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // We also need to set the cookie for SSR and middleware
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
