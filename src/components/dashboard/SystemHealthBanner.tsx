'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useJobStats } from '@/hooks/queries/useJobs';
import { useWhatsAppStatus } from '@/hooks/queries/useWhatsApp';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

export function SystemHealthBanner() {
  const { data: stats } = useJobStats();
  const { data: wa } = useWhatsAppStatus();
  const { isConnected } = useSocket();

  const waOk = wa?.status === 'connected';
  const healthy = isConnected && waOk;
  const score = healthy ? 100 : waOk ? 72 : isConnected ? 55 : 40;

  return (
    <motion.div
      layout
      className={cn(
        'rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border',
        healthy
          ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-transparent to-primary/5'
          : 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            healthy ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          )}
        >
          {healthy ? (
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">System status</p>
          <p className="text-xl font-bold">
            {healthy ? 'All systems operational' : 'Degraded — check integrations'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats?.pending ?? 0} pending · Socket {isConnected ? 'live' : 'offline'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-4xl font-bold tabular-nums text-gradient">{score}%</p>
        <p className="text-xs text-muted-foreground">health index</p>
      </div>
    </motion.div>
  );
}
