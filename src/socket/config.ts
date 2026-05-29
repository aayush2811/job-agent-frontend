/** Socket.IO client defaults — polling first for EC2 / reverse-proxy reliability */

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || '';

export const SOCKET_DEBUG = process.env.NEXT_PUBLIC_SOCKET_DEBUG === 'true';

export const SOCKET_CONNECT_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_SOCKET_TIMEOUT || '20000',
  10
);

export const SOCKET_ERROR_LOG_THROTTLE_MS = 30000;

export function buildSocketOptions(token: string) {
  return {
    path: '/socket.io',
    transports: ['polling', 'websocket'] as ('polling' | 'websocket')[],
    upgrade: true,
    rememberUpgrade: true,
    timeout: SOCKET_CONNECT_TIMEOUT,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0.5,
    withCredentials: true,
    forceNew: true,
    auth: { token },
  };
}
