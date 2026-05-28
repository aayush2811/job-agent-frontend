'use client';

import { useAuthStore, selectAuthReady } from '@/store/useAuthStore';

/**
 * Use as React Query `enabled` for protected endpoints.
 * Blocks fetches until persist hydration completes and a token exists.
 */
export function useAuthQueryEnabled(): boolean {
  return useAuthStore(selectAuthReady);
}

export function useAuthReady() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const authReady = useAuthStore(selectAuthReady);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return {
    hasHydrated,
    authReady,
    token,
    user,
    isAuthenticated,
  };
}
