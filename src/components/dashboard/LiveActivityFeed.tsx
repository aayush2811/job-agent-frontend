'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  MessageCircle,
  Briefcase,
  AlertCircle,
  XCircle,
  Brain,
  FileText,
  Radio,
} from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityKind } from '@/types/activity';
import type { ReactNode } from 'react';
import { formatDistanceToNow } from '@/lib/format-time';

const iconMap: Record<ActivityKind, ReactNode> = {
  job_found: <Briefcase className="w-4 h-4 text-blue-500" />,
  job_scored: <Brain className="w-4 h-4 text-violet-500" />,
  match: <Brain className="w-4 h-4 text-indigo-500" />,
  approval: <AlertCircle className="w-4 h-4 text-amber-500" />,
  applied: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  whatsapp: <MessageCircle className="w-4 h-4 text-green-400" />,
  resume: <FileText className="w-4 h-4 text-cyan-500" />,
  telegram: <Radio className="w-4 h-4 text-sky-500" />,
  system: <Radio className="w-4 h-4 text-muted-foreground" />,
};

const bgMap: Record<ActivityKind, string> = {
  job_found: 'bg-blue-500/10 border-blue-500/20',
  job_scored: 'bg-violet-500/10 border-violet-500/20',
  match: 'bg-indigo-500/10 border-indigo-500/20',
  approval: 'bg-amber-500/10 border-amber-500/20',
  applied: 'bg-emerald-500/10 border-emerald-500/20',
  failed: 'bg-red-500/10 border-red-500/20',
  whatsapp: 'bg-green-400/10 border-green-400/20',
  resume: 'bg-cyan-500/10 border-cyan-500/20',
  telegram: 'bg-sky-500/10 border-sky-500/20',
  system: 'bg-muted/50 border-border',
};

export function LiveActivityFeed() {
  const { activities, pulseAt } = useActivityFeed(12);

  return (
    <Card className="glass-card border-none shadow-lg h-full flex flex-col glow-border overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Live Activity</span>
          <motion.span
            key={pulseAt}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="text-xs font-normal text-primary"
          >
            streaming
          </motion.span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Waiting for automation events…
            </p>
          ) : (
            activities.map((act) => (
              <motion.div
                key={act.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex gap-3 p-3 rounded-lg border ${bgMap[act.kind]}`}
              >
                <div className="mt-0.5 shrink-0">{iconMap[act.kind]}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{act.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{act.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(act.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
