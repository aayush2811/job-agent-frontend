'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const DEFAULT_MS = 15 * 60 * 1000;

export function ApprovalCountdown({ createdAt }: { createdAt?: string | Date }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const start = createdAt ? new Date(createdAt).getTime() : Date.now();
    const deadline = start + DEFAULT_MS;

    const tick = () => {
      const left = deadline - Date.now();
      setRemaining(left > 0 ? left : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  if (remaining === null) return null;

  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);
  const urgent = remaining < 120000;

  return (
    <motion.div
      animate={urgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: urgent ? Infinity : 0, duration: 1 }}
      className={`flex items-center gap-2 text-xs font-mono rounded-full px-3 py-1 border ${
        urgent
          ? 'border-red-500/40 bg-red-500/10 text-red-400'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {remaining === 0 ? 'SLA expired' : `${min}:${sec.toString().padStart(2, '0')} left`}
    </motion.div>
  );
}
