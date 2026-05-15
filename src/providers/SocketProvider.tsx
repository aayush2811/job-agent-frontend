'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '@/socket';
import { Socket } from 'socket.io-client';
import {
  initialSocketDebugState,
  type SocketDebugState,
  type SocketConnectionStatus,
} from '@/socket/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  status: SocketConnectionStatus;
  debug: SocketDebugState;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  status: 'disconnected',
  debug: initialSocketDebugState,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [debug, setDebug] = useState<SocketDebugState>(initialSocketDebugState);

  const patchDebug = useCallback((patch: Partial<SocketDebugState>) => {
    setDebug((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    const unsub = socketService.subscribe(patchDebug);

    if (socketInstance.connected) {
      patchDebug({
        status: 'connected',
        socketId: socketInstance.id ?? null,
        transport: socketInstance.io.engine?.transport?.name ?? null,
      });
    }

    return () => {
      unsub();
    };
  }, [patchDebug]);

  const isConnected = debug.status === 'connected';

  return (
    <SocketContext.Provider value={{ socket, isConnected, status: debug.status, debug }}>
      {children}
    </SocketContext.Provider>
  );
}
