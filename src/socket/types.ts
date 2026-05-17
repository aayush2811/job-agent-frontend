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

// Frontend event listeners map (Events we listen to)
export interface ClientToServerEvents {
  // Empty for now as we mostly listen to server events
}

export interface ServerToClientEvents {
  // Resumes
  'resume-uploaded': () => void;
  'resume-updated': () => void;
  'resume-deleted': () => void;
  
  // Jobs
  'job-added': () => void;
  'job-updated': () => void;
  'job-deleted': () => void;
  
  // Applications
  'application-added': () => void;
  'application-updated': () => void;
  
  // Telegram
  'telegram-approval-requested': () => void;
  'telegram-approval-updated': () => void;
  
  // WhatsApp
  'whatsapp-message-received': () => void;
  'whatsapp-message-sent': () => void;
  'whatsapp-status-changed': () => void;
}

