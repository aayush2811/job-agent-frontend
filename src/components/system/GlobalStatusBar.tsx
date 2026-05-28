'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, ShieldAlert } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthReady } from '@/hooks/useAuthQueryEnabled';
import { cn } from '@/lib/utils';

export function GlobalStatusBar() {
  const { isConnected, isLive, status } = useSocket();
  const { authReady, token } = useAuthReady();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const showReconnect = authReady && !!token && !isConnected;
  const showOffline = !online;
  const showAuthWarn = authReady && !token;

  const visible = showOffline || showReconnect || showAuthWarn;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-border/50"
        >
          <div
            className={cn(
              'px-4 py-2 text-xs font-medium flex items-center justify-center gap-2',
              showOffline && 'bg-destructive/15 text-destructive',
              !showOffline && showReconnect && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              !showOffline && !showReconnect && showAuthWarn && 'bg-muted text-muted-foreground'
            )}
          >
            {showOffline && (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                You are offline — data may be stale
              </>
            )}
            {showReconnect && !showOffline && (
              <>
                <RefreshCw className={cn("w-3.5 h-3.5", status !== 'disconnected' && "animate-spin")} />
                {status === 'disconnected' 
                  ? 'Live automation disconnected — backend server offline' 
                  : `Reconnecting live automation (${status})…`}
              </>
            )}
            {showAuthWarn && !showOffline && !showReconnect && (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Session expired — sign in again
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
