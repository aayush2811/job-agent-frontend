'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { syncTokenStorage } from '@/lib/auth-tokens';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/api';
import { DemoLoginDebugPanel } from '@/components/debug/DemoLoginDebugPanel';

/**
 * Waits for Zustand persist hydration before rendering the app shell.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);
  const [timeoutHydrated, setTimeoutHydrated] = useState(false);
  const [showFailsafeUI, setShowFailsafeUI] = useState(false);

  const handleEnterDemoMode = async () => {
    console.log('[Auth] Entering Demo Mode via failsafe fallback button');
    try {
      const session = await authService.demoLogin();
      const { user, accessToken, refreshToken } = session;
      useAuthStore.getState().setSession(user, accessToken, refreshToken);
      useAuthStore.setState({ isDemoMode: true, hasHydrated: true });
      setTimeoutHydrated(true);
      setShowFailsafeUI(false);
    } catch (err) {
      const actualError = getApiErrorMessage(err);
      alert(`Failed to boot Demo Mode: ${actualError}`);
    }
  };

  useEffect(() => {
    console.log('[Auth] Hydration check started');
    setMounted(true);

    let timeoutId: NodeJS.Timeout;

    const markHydrated = () => {
      console.log('[Auth] Hydration complete');
      if (timeoutId) clearTimeout(timeoutId);
      
      const { token, refreshToken } = useAuthStore.getState();
      if (token && refreshToken) {
        console.log('[Auth] Auth restored from storage');
        syncTokenStorage(token, refreshToken);
      } else {
        console.log('[Auth] No existing session found');
      }
      
      useAuthStore.setState({ hasHydrated: true });
    };

    // Timeout fallback of 3 seconds to prevent deadlock
    timeoutId = setTimeout(() => {
      console.warn('[Auth] Hydration timeout after 3 seconds, triggering failsafe UI');
      setShowFailsafeUI(true);
    }, 3000);

    if (useAuthStore.persist.hasHydrated()) {
      markHydrated();
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      markHydrated();
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  const isReady = hasHydrated || timeoutHydrated;

  if (!mounted) {
    return null;
  }

  if (showFailsafeUI && !hasHydrated) {
    console.log('[Auth] Displaying hydration failsafe recovery screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-3xl rounded-full mix-blend-multiply opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 blur-3xl rounded-full mix-blend-multiply opacity-70" />
        
        <div className="w-full max-w-md flex flex-col gap-4 z-10">
          <div className="glass-card border border-border/50 rounded-xl p-8 shadow-2xl space-y-6 text-center bg-card/80 backdrop-blur-md">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-gradient">Session Delayed</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn't restore your session. This might happen due to storage access delays or third-party extensions.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleEnterDemoMode}
                className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
              >
                Continue in Demo Mode
              </button>
              <button
                onClick={() => {
                  console.log('[Auth] Forcing hydration unblock retry');
                  useAuthStore.setState({ hasHydrated: true });
                  setTimeoutHydrated(true);
                  setShowFailsafeUI(false);
                }}
                className="w-full inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Force Render Anyway
              </button>
            </div>
          </div>
          
          <DemoLoginDebugPanel />
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground animate-pulse">Loading session…</div>
      </div>
    );
  }

  return <>{children}</>;
}
