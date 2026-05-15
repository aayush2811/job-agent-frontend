'use client';

import { useSocket } from '@/providers/SocketProvider';
import { SOCKET_URL } from '@/socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-right break-all">{value ?? '—'}</span>
    </div>
  );
}

export function SocketDebugPanel() {
  const { debug, status, isConnected } = useSocket();

  const heartbeatLabel = debug.lastHeartbeatAt
    ? new Date(debug.lastHeartbeatAt).toLocaleTimeString()
    : '—';

  return (
    <Card className="glass-card border-dashed border-amber-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          Socket diagnostics
          <span
            className={`text-xs font-normal px-2 py-0.5 rounded-full ${
              isConnected
                ? 'bg-green-500/15 text-green-600'
                : status === 'reconnecting' || status === 'connecting'
                  ? 'bg-amber-500/15 text-amber-600'
                  : 'bg-red-500/15 text-red-600'
            }`}
          >
            {status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <Row label="URL" value={SOCKET_URL} />
        <Row label="Socket ID" value={debug.socketId} />
        <Row label="Transport" value={debug.transport} />
        <Row label="Reconnect attempts" value={debug.reconnectAttempts} />
        <Row label="Last heartbeat" value={heartbeatLabel} />
        <Row label="Last event" value={debug.lastEvent} />
        <Row label="Last error" value={debug.lastError} />
      </CardContent>
    </Card>
  );
}
