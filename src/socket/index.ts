import { io, Socket } from 'socket.io-client';
import type { SocketDebugState } from './types';
import { logger } from '@/lib/logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const DEBUG = process.env.NEXT_PUBLIC_SOCKET_DEBUG === 'true';

type DebugListener = (state: Partial<SocketDebugState>) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Set<DebugListener>();

  subscribe(listener: DebugListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(patch: Partial<SocketDebugState>) {
    this.listeners.forEach((fn) => fn(patch));
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.connect();
      return this.socket;
    }

    this.notify({ status: 'connecting', url: SOCKET_URL });

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    this.bindCoreEvents(this.socket);
    if (DEBUG) this.bindDiagnosticEvents(this.socket);

    return this.socket;
  }

  private bindCoreEvents(socket: Socket) {
    socket.on('connect', () => {
      logger.info('Socket', `connected id=${socket.id}`);
      this.notify({
        status: 'connected',
        socketId: socket.id ?? null,
        transport: socket.io.engine?.transport?.name ?? null,
        lastError: null,
        lastEvent: 'connect',
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket', `disconnected reason=${reason}`);
      this.notify({
        status: 'disconnected',
        socketId: null,
        lastEvent: `disconnect:${reason}`,
      });
    });

    socket.on('connect_error', (err) => {
      logger.error('Socket', 'connect_error', err.message);
      this.notify({
        status: 'disconnected',
        lastError: err.message,
        lastEvent: 'connect_error',
      });
    });
  }

  private bindDiagnosticEvents(socket: Socket) {
    socket.io.on('reconnect_attempt', (attempt) => {
      logger.debug('Socket', `reconnect_attempt ${attempt}`);
      this.notify({
        status: 'reconnecting',
        reconnectAttempts: attempt,
        lastEvent: `reconnect_attempt:${attempt}`,
      });
    });

    socket.io.on('reconnect', (attempt) => {
      logger.debug('Socket', `reconnected after ${attempt}`);
      this.notify({
        status: 'connected',
        reconnectAttempts: attempt,
        lastEvent: `reconnect:${attempt}`,
      });
    });

    socket.io.on('reconnect_failed', () => {
      logger.error('Socket', 'reconnect_failed');
      this.notify({
        status: 'disconnected',
        lastError: 'reconnect_failed',
        lastEvent: 'reconnect_failed',
      });
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.notify({
        status: 'disconnected',
        socketId: null,
        transport: null,
      });
    }
  }
}

export const socketService = new SocketService();
export { SOCKET_URL };
