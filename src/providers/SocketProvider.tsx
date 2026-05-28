'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '@/socket';
import { useAuthReady } from '@/hooks/useAuthQueryEnabled';
import { Socket } from 'socket.io-client';
import {
  initialSocketDebugState,
  type SocketDebugState,
  type SocketConnectionStatus,
} from '@/socket/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isLive: boolean;
  status: SocketConnectionStatus;
  debug: SocketDebugState;
  authReady: boolean;
  socketReady: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isLive: false,
  status: 'disconnected',
  debug: initialSocketDebugState,
  authReady: false,
  socketReady: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [debug, setDebug] = useState<SocketDebugState>(initialSocketDebugState);
  const { authReady, token } = useAuthReady();
  const lastTokenRef = useRef<string | null>(null);

  const patchDebug = useCallback((patch: Partial<SocketDebugState>) => {
    setDebug((prev) => ({ ...prev, ...patch }));
    if (patch.status === 'connected') {
      setSocketReady(true);
    }
    if (patch.status === 'disconnected' && !socketService.isConnected()) {
      setSocketReady(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!authReady || !token) {
      lastTokenRef.current = null;
      socketService.disconnect();
      setSocket(null);
      setSocketReady(false);
      patchDebug({ status: 'disconnected', socketId: null, transport: null });
      return;
    }

    if (lastTokenRef.current === token && socketService.isConnected()) {
      setSocket(socketService.getSocket());
      setSocketReady(true);
      return;
    }

    lastTokenRef.current = token;
    socketService.scheduleConnect(token, 200);

    const unsub = socketService.subscribe(patchDebug);

    const poll = window.setInterval(() => {
      const s = socketService.getSocket();
      setSocket(s);
      setSocketReady(socketService.isConnected());
    }, 500);

    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [authReady, token, patchDebug]);

  useEffect(() => {
    setSocket(socketService.getSocket());
  }, [debug.status]);

  const isConnected = debug.status === 'connected';
  const isLive = isConnected || debug.status === 'reconnecting' || debug.status === 'connecting';

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isLive,
        status: debug.status,
        debug,
        authReady,
        socketReady,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
