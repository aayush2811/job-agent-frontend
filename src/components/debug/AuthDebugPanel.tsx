'use client';

import { useState } from 'react';
import { useAuthReady } from '@/hooks/useAuthQueryEnabled';
import { useSocket } from '@/hooks/useSocket';
import { socketService } from '@/socket';
import { getAccessToken } from '@/lib/auth-tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const SHOW =
  process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true' ||
  process.env.NODE_ENV === 'development';

export function AuthDebugPanel() {
  const [open, setOpen] = useState(false);
  const { hasHydrated, authReady, token, user, isAuthenticated } = useAuthReady();
  const { status, socketReady, isConnected } = useSocket();

  if (!SHOW) return null;

  const mirroredToken = typeof window !== 'undefined' ? getAccessToken() : null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] text-xs font-mono">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground shadow-lg"
      >
        Auth debug
      </button>
      {open && (
        <div className="mt-2 w-72 rounded-lg border bg-card/95 backdrop-blur p-3 shadow-xl space-y-1 text-foreground">
          <p>
            <span className="text-muted-foreground">hydrated:</span> {String(hasHydrated)}
          </p>
          <p>
            <span className="text-muted-foreground">authReady:</span> {String(authReady)}
          </p>
          <p>
            <span className="text-muted-foreground">isAuthenticated:</span>{' '}
            {String(isAuthenticated)}
          </p>
          <p>
            <span className="text-muted-foreground">token (store):</span>{' '}
            {token ? `${token.slice(0, 12)}…` : '—'}
          </p>
          <p>
            <span className="text-muted-foreground">token (mirror):</span>{' '}
            {mirroredToken ? `${mirroredToken.slice(0, 12)}…` : '—'}
          </p>
          <p>
            <span className="text-muted-foreground">user:</span>{' '}
            {user?.email || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">socket:</span> {status}{' '}
            (ready={String(socketReady)}, connected={String(isConnected)})
          </p>
          <p>
            <span className="text-muted-foreground">authPaused:</span>{' '}
            {String(socketService.isAuthPaused())}
          </p>
          <p className="break-all">
            <span className="text-muted-foreground">API:</span> {API_URL}
          </p>
          <p className="break-all">
            <span className="text-muted-foreground">Socket:</span> {SOCKET_URL}
          </p>
        </div>
      )}
    </div>
  );
}
