'use client';

import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseDot } from '@/components/ui/pulse-dot';
import { Wifi } from 'lucide-react';

export function SocketMonitor() {
  const { status, debug, isConnected, socketReady } = useSocket();

  const rows = [
    { label: 'Connection', value: status },
    { label: 'Transport', value: debug.transport || '—' },
    { label: 'Socket ID', value: debug.socketId?.slice(0, 12) || '—' },
    { label: 'Ready', value: socketReady ? 'yes' : 'no' },
    { label: 'Last event', value: debug.lastEvent || '—' },
  ];

  return (
    <Card className="glass-card border-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" />
          Socket monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <PulseDot active={isConnected} variant={isConnected ? 'success' : 'warning'} />
          <span className="text-sm font-medium capitalize">{status}</span>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="truncate max-w-[140px] text-foreground/90">{r.value}</span>
          </div>
        ))}
        {debug.lastError && (
          <p className="text-[10px] text-destructive mt-2 line-clamp-2">{debug.lastError}</p>
        )}
      </CardContent>
    </Card>
  );
}
