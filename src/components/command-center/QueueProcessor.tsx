'use client';

import { motion } from 'framer-motion';
import { useJobStats } from '@/hooks/queries/useJobs';
import { useRealtimeStats } from '@/hooks/queries/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export function QueueProcessor() {
  const { data: stats } = useJobStats();
  const { data: realtime } = useRealtimeStats();

  const pending = stats?.pending ?? 0;
  const processing =
    (realtime as { processingJobs?: number })?.processingJobs ??
    (realtime as { queueSize?: number })?.queueSize ??
    0;
  const total = Math.max(pending + processing, 1);
  const pendingPct = Math.round((pending / total) * 100);

  return (
    <Card className="glass-card border-none h-full glow-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          Queue processor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-2xl font-bold tabular-nums mb-3">
          <span className="text-amber-500">{pending}</span>
          <span className="text-muted-foreground text-sm font-normal self-center">pending</span>
          <span className="text-primary">{processing}</span>
          <span className="text-muted-foreground text-sm font-normal self-center">active</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            className="h-full bg-amber-500"
            animate={{ width: `${pendingPct}%` }}
            transition={{ type: 'spring', stiffness: 120 }}
          />
          <motion.div
            className="h-full bg-primary flex-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
          PROCESSING_QUEUE · realtime
        </p>
      </CardContent>
    </Card>
  );
}
