'use client';

import { useSystemHealth } from '@/hooks/queries/useHealth';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PulseDot } from '@/components/ui/pulse-dot';
import {
  Server,
  Database,
  MessageCircle,
  Send,
  Wifi,
  Activity,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function StatusTile({
  label,
  status,
  ok,
  detail,
  icon: Icon,
}: {
  label: string;
  status: string;
  ok: boolean;
  detail?: string;
  icon: typeof Server;
}) {
  return (
    <Card className="glass-card border-none">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <Icon className={cn('w-5 h-5', ok ? 'text-emerald-500' : 'text-amber-500')} />
          <PulseDot active={ok} variant={ok ? 'success' : 'warning'} />
        </div>
        <p className="font-medium mt-3">{label}</p>
        <p className="text-lg capitalize font-semibold">{status}</p>
        {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
      </CardContent>
    </Card>
  );
}

export default function SystemHealthPage() {
  const { data: health, isLoading, isError } = useSystemHealth();
  const { status: socketStatus, isConnected } = useSocket();

  const uptimeSec = health?.server?.uptime ?? 0;
  const uptimeStr =
    uptimeSec > 3600
      ? `${(uptimeSec / 3600).toFixed(1)}h`
      : `${Math.floor(uptimeSec / 60)}m`;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gradient">Automation Health</h1>
        <p className="text-muted-foreground mt-1">
          Mission diagnostics — integrations, queue, database, and realtime transport.
        </p>
      </div>

      <Card className="glass-card border-none glow-border overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Platform status</p>
              <p className="text-2xl font-bold capitalize">
                {isLoading ? '…' : health?.status || (isError ? 'unknown' : 'degraded')}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Uptime</p>
              <p className="font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {uptimeStr}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Environment</p>
              <p className="font-mono">{health?.server?.nodeEnv || '—'}</p>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusTile
            label="API Server"
            status={health?.server?.running ? 'running' : 'down'}
            ok={Boolean(health?.server?.running)}
            detail={`PID env · ${health?.server?.nodeEnv}`}
            icon={Server}
          />
          <StatusTile
            label="MongoDB"
            status={health?.mongo?.status || 'unknown'}
            ok={Boolean(health?.mongo?.connected)}
            icon={Database}
          />
          <StatusTile
            label="Socket.IO"
            status={isConnected ? 'connected' : socketStatus}
            ok={isConnected}
            detail={`${health?.socket?.connections ?? 0} server connections`}
            icon={Wifi}
          />
          <StatusTile
            label="WhatsApp"
            status={health?.whatsapp?.status || 'unknown'}
            ok={health?.whatsapp?.status === 'connected'}
            icon={MessageCircle}
          />
          <StatusTile
            label="Telegram"
            status={health?.telegram?.status || 'unknown'}
            ok={
              health?.telegram?.status === 'running' && Boolean(health?.telegram?.isPolling)
            }
            detail={
              health?.telegram?.chatConnected ? 'Chat linked' : 'Check TELEGRAM_CHAT_ID'
            }
            icon={Send}
          />
          <StatusTile
            label="Automation"
            status={health?.status === 'ok' ? 'healthy' : 'degraded'}
            ok={health?.status === 'ok'}
            detail="Composite health index"
            icon={Activity}
          />
        </div>
      )}
    </div>
  );
}
