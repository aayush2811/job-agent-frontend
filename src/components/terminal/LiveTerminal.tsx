'use client';

import { useMemo, useState } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityKind } from '@/types/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTERS: { id: ActivityKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'job_found', label: 'Jobs' },
  { id: 'match', label: 'Match' },
  { id: 'approval', label: 'Approval' },
  { id: 'applied', label: 'Applied' },
  { id: 'failed', label: 'Errors' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WA' },
];

const kindColor: Record<ActivityKind, string> = {
  job_found: 'text-blue-400',
  job_scored: 'text-purple-400',
  match: 'text-indigo-400',
  approval: 'text-amber-400',
  applied: 'text-emerald-400',
  failed: 'text-red-400',
  whatsapp: 'text-green-400',
  telegram: 'text-sky-400',
  resume: 'text-cyan-400',
  system: 'text-muted-foreground',
};

export function LiveTerminal() {
  const { activities, pulseAt } = useActivityFeed(60);
  const [filter, setFilter] = useState<ActivityKind | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return activities;
    if (filter === 'match') {
      return activities.filter((a) => a.kind === 'match' || a.kind === 'job_scored');
    }
    return activities.filter((a) => a.kind === filter);
  }, [activities, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((a) => {
      const key = a.timestamp.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Card className="glass-card border-none h-full flex flex-col overflow-hidden font-mono text-xs">
      <CardHeader className="pb-2 shrink-0 border-b border-emerald-500/20 bg-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
            <Terminal className="w-4 h-4" />
            Live terminal
            <span className="text-[10px] text-muted-foreground font-normal">
              stream #{String(pulseAt).slice(-6) || 'idle'}
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-1">
            <Filter className="w-3 h-3 text-muted-foreground self-center mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] border transition-colors',
                  filter === f.id
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 bg-black/50 min-h-[320px] space-y-4">
        {grouped.length === 0 ? (
          <p className="text-muted-foreground">$ awaiting stream…</p>
        ) : (
          grouped.map(([day, items]) => (
            <div key={day}>
              <p className="text-[10px] text-primary/60 mb-2 uppercase tracking-widest">── {day}</p>
              {items.map((act) => (
                <div
                  key={act.id}
                  className="flex gap-2 py-0.5 hover:bg-white/5 rounded px-1 -mx-1"
                >
                  <span className="text-muted-foreground shrink-0">
                    [{act.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={cn('shrink-0 uppercase w-16', kindColor[act.kind])}>
                    {act.kind}
                  </span>
                  <span className="text-foreground/90 truncate">
                    <span className="text-foreground">{act.title}</span>
                    <span className="text-muted-foreground"> — {act.message}</span>
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
        <p className="text-[10px] text-emerald-500/50 pt-2 border-t border-border/30">
          diagnostics: filter={filter} lines={filtered.length} buffer=60
        </p>
      </CardContent>
    </Card>
  );
}
