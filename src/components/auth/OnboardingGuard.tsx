'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      console.log('[AuthGuard] Not authenticated, redirecting to /login');
      router.replace('/login');
      return;
    }

    if (pathname.startsWith('/onboarding')) return;
    if (user && !user.onboardingComplete) {
      console.log('[AuthGuard] Onboarding not complete, redirecting to /onboarding');
      router.replace('/onboarding');
    }
  }, [hasHydrated, isAuthenticated, user, pathname, router]);

  if (!hasHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground animate-pulse">Verifying session…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !user.onboardingComplete && !pathname.startsWith('/onboarding')) {
    return null;
  }

  return <>{children}</>;
}
