'use client';

import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export function LiveLogViewer() {
  const { activities } = useActivityFeed(40);

  return (
    <Card className="glass-card border-none shadow-lg h-full flex flex-col font-mono text-xs overflow-hidden">
      <CardHeader className="pb-2 shrink-0 border-b border-border/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          Automation Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-1 bg-black/30 min-h-0">
        {activities.length === 0 ? (
          <p className="text-muted-foreground">$ awaiting events…</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex gap-2 text-muted-foreground hover:text-foreground">
              <span className="text-primary/60 shrink-0">
                [{act.timestamp.toLocaleTimeString()}]
              </span>
              <span className="text-emerald-500/80 shrink-0">{act.kind}</span>
              <span className="truncate">{act.message}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
