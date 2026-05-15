'use client';

import { useSocket } from '@/providers/SocketProvider';
import { Badge } from '@/components/ui/badge';
import type { SocketConnectionStatus } from '@/socket/types';

const labels: Record<SocketConnectionStatus, string> = {
  connected: 'Socket: Connected',
  connecting: 'Socket: Connecting…',
  reconnecting: 'Socket: Reconnecting…',
  disconnected: 'Socket: Disconnected',
};

const styles: Record<SocketConnectionStatus, string> = {
  connected: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  connecting: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  reconnecting: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  disconnected: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
};

const dotStyles: Record<SocketConnectionStatus, string> = {
  connected: 'bg-green-500 animate-pulse',
  connecting: 'bg-amber-500 animate-pulse',
  reconnecting: 'bg-amber-500 animate-pulse',
  disconnected: 'bg-red-500',
};

export function SocketStatusBadge() {
  const { status, debug } = useSocket();
  const label = labels[status];

  return (
    <Badge variant="outline" className={styles[status]} title={debug.lastError ?? undefined}>
      <span className={`h-1.5 w-1.5 rounded-full mr-2 ${dotStyles[status]}`} />
      {label}
      {debug.transport ? (
        <span className="ml-1 opacity-70 text-[10px]">({debug.transport})</span>
      ) : null}
    </Badge>
  );
}
