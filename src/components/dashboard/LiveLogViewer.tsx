'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface LogEntry {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error';
  time: string;
}

export function LiveLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let counter = 0;
    const msgs = [
      { t: 'info', m: 'Scanning LinkedIn for new roles...' },
      { t: 'success', m: 'Extracted 14 potential matches.' },
      { t: 'info', m: 'Initializing Puppeteer session for auto-apply.' },
      { t: 'warn', m: 'Cloudflare challenge detected. Bypassing...' },
      { t: 'success', m: 'Application submitted to YCombinator startup.' },
      { t: 'info', m: 'Sleeping for 45s to avoid rate limits.' },
      { t: 'error', m: 'Failed to click submit button: timeout.' }
    ];

    const interval = setInterval(() => {
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const entry: LogEntry = {
        id: counter++,
        text: msg.m,
        type: msg.t as any,
        time: new Date().toISOString().split('T')[1].slice(0, 8)
      };
      setLogs(prev => [...prev.slice(-49), entry]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="glass-card border-none shadow-lg h-full overflow-hidden flex flex-col bg-[#0a0a0a]">
      <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
        <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          ai-agent-engine.log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div ref={scrollRef} className="h-full p-4 overflow-y-auto font-mono text-xs space-y-1.5 hide-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-muted-foreground/50 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'info' ? 'text-blue-400' : ''}
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'error' ? 'text-red-400' : ''}
              `}>
                {log.type === 'error' ? 'ERR!' : log.type === 'warn' ? 'WARN' : '>'} 
                <span className="ml-2 text-gray-300">{log.text}</span>
              </span>
            </div>
          ))}
          {logs.length === 0 && <div className="text-muted-foreground">Waiting for logs...</div>}
        </div>
      </CardContent>
    </Card>
  );
}
