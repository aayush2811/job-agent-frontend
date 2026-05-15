import { io, Socket } from 'socket.io-client';
import type { SocketDebugState } from './types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const DEBUG = process.env.NEXT_PUBLIC_SOCKET_DEBUG !== 'false';

type DebugListener = (state: Partial<SocketDebugState>) => void;

function log(...args: unknown[]) {
  if (DEBUG) {
    console.log('[Socket Client]', ...args);
  }
}

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
      log('reuse existing connected socket', this.socket.id);
      return this.socket;
    }

    if (this.socket) {
      log('reconnecting existing socket instance');
      this.socket.connect();
      return this.socket;
    }

    log('creating socket', SOCKET_URL);

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
    this.bindDiagnosticEvents(this.socket);

    return this.socket;
  }

  private bindCoreEvents(socket: Socket) {
    socket.on('connect', () => {
      log('connected', socket.id, 'transport=', socket.io.engine.transport.name);
      this.notify({
        status: 'connected',
        socketId: socket.id ?? null,
        transport: socket.io.engine.transport.name,
        lastError: null,
        lastEvent: 'connect',
      });
    });

    socket.on('disconnect', (reason) => {
      log('disconnected', reason);
      this.notify({
        status: 'disconnected',
        socketId: null,
        lastEvent: `disconnect:${reason}`,
      });
    });

    socket.on('connect_error', (err) => {
      log('connect_error', err.message);
      this.notify({
        status: 'disconnected',
        lastError: err.message,
        lastEvent: 'connect_error',
      });
    });
  }

  private bindDiagnosticEvents(socket: Socket) {
    socket.io.on('reconnect_attempt', (attempt) => {
      log('reconnect_attempt', attempt);
      this.notify({
        status: 'reconnecting',
        reconnectAttempts: attempt,
        lastEvent: `reconnect_attempt:${attempt}`,
      });
    });

    socket.io.on('reconnect', (attempt) => {
      log('reconnected after', attempt);
      this.notify({
        status: 'connected',
        reconnectAttempts: attempt,
        lastEvent: `reconnect:${attempt}`,
      });
    });

    socket.io.on('reconnect_failed', () => {
      log('reconnect_failed');
      this.notify({
        status: 'disconnected',
        lastError: 'reconnect_failed',
        lastEvent: 'reconnect_failed',
      });
    });

    socket.io.engine.on('upgrade', (transport) => {
      log('transport upgraded', transport.name);
      this.notify({
        transport: transport.name,
        lastEvent: `upgrade:${transport.name}`,
      });
    });

    socket.on('server-heartbeat', (payload: { timestamp?: number; status?: string }) => {
      log('server-heartbeat', payload);
      this.notify({
        lastHeartbeatAt: payload?.timestamp ?? Date.now(),
        lastEvent: 'server-heartbeat',
      });
    });

    socket.on('server:hello', (payload: unknown) => {
      log('server:hello', payload);
      this.notify({ lastEvent: 'server:hello' });
    });

    socket.on('whatsapp-status', (payload: unknown) => {
      log('whatsapp-status', payload);
      this.notify({ lastEvent: 'whatsapp-status' });
    });

    socket.on('qr-updated', (payload: unknown) => {
      log('qr-updated', payload);
      this.notify({ lastEvent: 'qr-updated' });
    });

    socket.onAny((event, ...args) => {
      if (['server-heartbeat', 'connect', 'disconnect'].includes(event)) return;
      log('event', event, args[0]);
      this.notify({ lastEvent: event });
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
      log('disconnect called');
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
