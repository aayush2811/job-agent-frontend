'use client';

import { motion } from 'framer-motion';
import { useActivityStore } from '@/store/useActivityStore';
import { useSocket } from '@/hooks/useSocket';
import { Activity, Radio } from 'lucide-react';

export function AutomationHeartbeat() {
  const pulseAt = useActivityStore((s) => s.pulseAt);
  const count = useActivityStore((s) => s.items.length);
  const { isConnected, socketReady } = useSocket();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-4 md:p-5 glow-border">
      <div className="absolute inset-0 ai-scan-line opacity-30 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            key={pulseAt}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
          >
            <Activity className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Automation heartbeat
            </p>
            <p className="text-lg font-semibold">
              {isConnected ? 'Agent is live' : 'Reconnecting…'}
            </p>
            <p className="text-xs text-muted-foreground">
              {count} events in stream · socket {socketReady ? 'ready' : 'pending'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-primary/80">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LAST_SIGNAL {pulseAt ? new Date(pulseAt).toLocaleTimeString() : '—'}</span>
        </div>
      </div>
    </div>
  );
}
