import { io, Socket } from 'socket.io-client';
import type { SocketDebugState } from './types';
import { logger } from '@/lib/logger';
import {
  SOCKET_URL,
  SOCKET_DEBUG,
  buildSocketOptions,
  SOCKET_ERROR_LOG_THROTTLE_MS,
} from './config';
import { getAccessToken } from '@/lib/auth-tokens';
import { useAuthStore } from '@/store/useAuthStore';

const SILENT_EVENTS = new Set([
  'server-heartbeat',
  'server:hello',
  'ping',
  'pong',
]);

type DebugListener = (state: Partial<SocketDebugState>) => void;

function resolveToken(explicit?: string | null): string | null {
  return explicit || useAuthStore.getState().token || getAccessToken();
}

function isAuthConnectError(message: string): boolean {
  return /authentication required|invalid or expired token|unauthorized/i.test(message);
}

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Set<DebugListener>();
  private lastConnectErrorLogAt = 0;
  private connectErrorCount = 0;
  private authPaused = false;
  private currentToken: string | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: DebugListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(patch: Partial<SocketDebugState>) {
    this.listeners.forEach((fn) => fn(patch));
  }

  private logConnectError(message: string) {
    this.connectErrorCount += 1;
    const now = Date.now();
    if (now - this.lastConnectErrorLogAt < SOCKET_ERROR_LOG_THROTTLE_MS) {
      return;
    }
    this.lastConnectErrorLogAt = now;
    logger.warn(
      'Socket',
      `connect_error (attempts=${this.connectErrorCount}): ${message}`
    );
  }

  private teardown() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.io.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Full reconnect with a fresh handshake (required when JWT changes).
   */
  reconnectWithToken(token: string): Socket | null {
    this.authPaused = false;
    this.currentToken = token;
    this.teardown();
    return this.connect(token);
  }

  connect(explicitToken?: string | null): Socket | null {
    const token = resolveToken(explicitToken);
    if (!token) {
      this.disconnect();
      return null;
    }

    if (this.authPaused && token === this.currentToken) {
      return null;
    }

    this.authPaused = false;
    this.currentToken = token;

    if (this.socket?.connected && this.currentToken === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.notify({ status: 'reconnecting' });
        console.log('[Socket] Socket connect started (reconnect)');
        this.socket.connect();
      }
      return this.socket;
    }

    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
    }

    this.notify({ status: 'connecting', url: SOCKET_URL });
    console.log('[Socket] Socket connect started. URL:', SOCKET_URL);

    this.socket = io(SOCKET_URL, buildSocketOptions(token));
    this.bindCoreEvents(this.socket);

    if (SOCKET_DEBUG) {
      this.bindDiagnosticEvents(this.socket);
    }

    return this.socket;
  }

  /** Debounced connect — avoids storms when token/hydration updates rapidly */
  scheduleConnect(token: string, delayMs = 150) {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = setTimeout(() => {
      this.connectTimer = null;
      this.reconnectWithToken(token);
    }, delayMs);
  }

  private bindCoreEvents(socket: Socket) {
    socket.on('connect', () => {
      this.connectErrorCount = 0;
      this.authPaused = false;
      const transport = socket.io.engine?.transport?.name ?? null;
      logger.info('Socket', `connected id=${socket.id} transport=${transport}`);
      console.log('[Socket] Socket connected. ID:', socket.id, 'Transport:', transport);
      this.notify({
        status: 'connected',
        socketId: socket.id ?? null,
        transport,
        lastError: null,
        lastEvent: 'connect',
        reconnectAttempts: 0,
      });
    });

    socket.on('disconnect', (reason) => {
      const willReconnect =
        !this.authPaused && reason !== 'io server disconnect' && reason !== 'io client disconnect';
      logger.info('Socket', `disconnected reason=${reason}`);
      this.notify({
        status: willReconnect ? 'reconnecting' : 'disconnected',
        socketId: null,
        lastEvent: `disconnect:${reason}`,
      });
    });

    socket.on('connect_error', (err) => {
      const msg = err?.message || 'connect_error';

      if (isAuthConnectError(msg)) {
        this.authPaused = true;
        socket.io.opts.reconnection = false;
        this.teardown();
        this.notify({
          status: 'disconnected',
          lastError: msg,
          lastEvent: 'connect_error:auth',
        });
        logger.warn('Socket', `auth rejected — waiting for valid token (${msg})`);
        return;
      }

      this.logConnectError(msg);
      this.notify({
        status: 'reconnecting',
        lastError: msg,
        lastEvent: 'connect_error',
      });
    });

    socket.io.on('reconnect', (attempt) => {
      logger.debug('Socket', `reconnected after ${attempt} attempts`);
      this.notify({
        status: 'connected',
        reconnectAttempts: attempt,
        lastError: null,
        lastEvent: 'reconnect',
      });
    });

    socket.io.on('reconnect_attempt', (attempt) => {
      if (this.authPaused) return;
      this.notify({
        status: 'reconnecting',
        reconnectAttempts: attempt,
        lastEvent: `reconnect_attempt:${attempt}`,
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

    const engine = socket.io.engine;
    if (engine) {
      engine.on('upgradeError', (err: Error) => {
        logger.debug(
          'Socket',
          `websocket upgrade failed — continuing on polling: ${err?.message || err}`
        );
        this.notify({
          transport: 'polling',
          lastEvent: 'upgrade_error',
        });
      });
    }
  }

  private bindDiagnosticEvents(socket: Socket) {
    socket.io.engine?.on('upgrade', () => {
      logger.debug('Socket', `upgraded to ${socket.io.engine?.transport?.name}`);
    });

    socket.onAny((event) => {
      if (SILENT_EVENTS.has(event)) return;
      if (['connect', 'disconnect', 'connect_error'].includes(event)) return;
      logger.debug('Socket', `event ${event}`);
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  isAuthPaused(): boolean {
    return this.authPaused;
  }

  getStatus(): SocketDebugState['status'] {
    if (this.socket?.connected) return 'connected';
    if (this.socket?.active) return 'reconnecting';
    return 'disconnected';
  }

  disconnect() {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    this.authPaused = false;
    this.currentToken = null;
    this.teardown();
    this.notify({
      status: 'disconnected',
      socketId: null,
      transport: null,
    });
  }
}

export const socketService = new SocketService();
export { SOCKET_URL };
