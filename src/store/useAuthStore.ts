import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth';
import { clearTokenStorage, syncTokenStorage } from '@/lib/auth-tokens';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Zustand persist finished rehydrating from localStorage */
  hasHydrated: boolean;
  isDemoMode: boolean;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      isDemoMode: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSession: (user, accessToken, refreshToken) => {
        syncTokenStorage(accessToken, refreshToken);
        set({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        clearTokenStorage();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isDemoMode: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state.refreshToken) {
          syncTokenStorage(state.token, state.refreshToken);
          if (!state.isAuthenticated) {
            state.isAuthenticated = true;
          }
        }
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);

/** Auth state is known and access token is available for API/socket */
export function selectAuthReady(state: AuthState): boolean {
  return state.hasHydrated && Boolean(state.token);
}
