export type SocketConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface SocketDebugState {
  socketId: string | null;
  status: SocketConnectionStatus;
  transport: string | null;
  reconnectAttempts: number;
  lastHeartbeatAt: number | null;
  lastError: string | null;
  lastEvent: string | null;
  url: string;
}

export const initialSocketDebugState: SocketDebugState = {
  socketId: null,
  status: 'disconnected',
  transport: null,
  reconnectAttempts: 0,
  lastHeartbeatAt: null,
  lastError: null,
  lastEvent: null,
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
};
