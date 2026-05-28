'use client';

import { useJobStats } from '@/hooks/queries/useJobs';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, CheckCircle, Clock, Zap } from 'lucide-react';
import { JobPipelineVisualization } from '@/components/dashboard/JobPipelineVisualization';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { MetricCounter } from '@/components/dashboard/MetricCounter';
import { AutomationPulse } from '@/components/dashboard/AutomationPulse';
import { SystemHealthBanner } from '@/components/dashboard/SystemHealthBanner';
import { useRealtimeStats } from '@/hooks/queries/useAnalytics';
import { AutomationHeartbeat } from '@/components/command-center/AutomationHeartbeat';
import { SocketMonitor } from '@/components/command-center/SocketMonitor';
import { QueueProcessor } from '@/components/command-center/QueueProcessor';
import { AutomationTimeline } from '@/components/timeline/AutomationTimeline';
import { LiveTerminal } from '@/components/terminal/LiveTerminal';

export default function DashboardPage() {
  const { data: stats, isLoading } = useJobStats();
  const { data: realtime } = useRealtimeStats();

  const queueSize =
    (realtime as { queueSize?: number })?.queueSize ??
    (realtime as { activeQueue?: number })?.activeQueue ??
    stats?.pending ??
    0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-1">Mission control</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
            AI Command Center
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Autonomous job-hunting OS — live pipeline, AI decisions, and realtime automation.
          </p>
        </div>
        <AutomationPulse />
      </div>

      <AutomationHeartbeat />
      <SystemHealthBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <MetricCounter
              label="Jobs extracted"
              value={stats?.total || 0}
              hint="Live ingestion"
              icon={Briefcase}
              accent="text-blue-500"
            />
            <MetricCounter
              label="Approval queue"
              value={stats?.pending || 0}
              hint={`${queueSize} processing`}
              icon={Clock}
              accent="text-amber-500"
              glow
            />
            <MetricCounter
              label="Auto applied"
              value={stats?.approved || 0}
              hint="AI submissions"
              icon={CheckCircle}
              accent="text-emerald-500"
            />
            <MetricCounter
              label="Throughput"
              value={(stats?.total || 0) + (stats?.approved || 0)}
              hint="Total actions"
              icon={Zap}
              accent="text-primary"
              glow
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JobPipelineVisualization />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <QueueProcessor />
          <SocketMonitor />
        </div>
      </div>

      <AutomationTimeline />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 min-h-[360px]">
        <LiveActivityFeed />
        <LiveTerminal />
      </div>
    </div>
  );
}
