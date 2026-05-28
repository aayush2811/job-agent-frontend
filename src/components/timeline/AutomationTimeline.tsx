'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/store/useTimelineStore';
import { TIMELINE_STAGES, type TimelineStageId } from '@/types/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/format-time';

const stageColors: Record<TimelineStageId, string> = {
  found: 'border-blue-500/50 bg-blue-500/10',
  matched: 'border-indigo-500/50 bg-indigo-500/10',
  resume: 'border-cyan-500/50 bg-cyan-500/10',
  approval: 'border-amber-500/50 bg-amber-500/10',
  applying: 'border-orange-500/50 bg-orange-500/10',
  applied: 'border-emerald-500/50 bg-emerald-500/10',
  outcome: 'border-muted bg-muted/30',
};

function statusDot(status: string) {
  if (status === 'failed') return 'bg-red-500';
  if (status === 'active') return 'bg-primary animate-pulse';
  if (status === 'done') return 'bg-emerald-500';
  return 'bg-muted-foreground';
}

export function AutomationTimeline() {
  const entries = useTimelineStore((s) => s.entries);

  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          Automation timeline
          <span className="text-xs font-normal text-primary ml-auto animate-pulse">LIVE</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="hidden md:grid grid-cols-7 gap-2 mb-6">
          {TIMELINE_STAGES.map((s, i) => (
            <div key={s.id} className="text-center">
              <div
                className={cn(
                  'h-1 rounded-full mb-2',
                  entries.some((e) => e.stage === s.id) ? 'bg-primary' : 'bg-muted'
                )}
              />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative space-y-0 max-h-[280px] overflow-y-auto pr-1">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
          <AnimatePresence mode="popLayout" initial={false}>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-8 py-6">
                Waiting for automation events…
              </p>
            ) : (
              entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative flex gap-4 pb-6 pl-1"
                >
                  <div
                    className={cn(
                      'relative z-10 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center shrink-0 mt-0.5'
                    )}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full', statusDot(entry.status))} />
                  </div>
                  <div
                    className={cn(
                      'flex-1 rounded-lg border px-3 py-2 min-w-0',
                      stageColors[entry.stage]
                    )}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium">{entry.label}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(entry.timestamp)}
                      </span>
                    </div>
                    {entry.detail && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.detail}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
