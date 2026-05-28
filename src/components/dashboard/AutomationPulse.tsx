'use client';

import { motion } from 'framer-motion';
import { useActivityStore } from '@/store/useActivityStore';
import { useSocket } from '@/hooks/useSocket';
import { PulseDot } from '@/components/ui/pulse-dot';
import { Activity } from 'lucide-react';

export function AutomationPulse() {
  const pulseAt = useActivityStore((s) => s.pulseAt);
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full glass glow-border text-sm">
      <PulseDot active={isConnected} variant={isConnected ? 'success' : 'warning'} />
      <span className="font-medium text-foreground/90">
        {isConnected ? 'Automation live' : 'Connecting…'}
      </span>
      <motion.div
        key={pulseAt}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 text-xs text-muted-foreground ml-auto"
      >
        <Activity className="w-3 h-3" />
        {pulseAt ? 'Signal received' : 'Standing by'}
      </motion.div>
    </div>
  );
}
