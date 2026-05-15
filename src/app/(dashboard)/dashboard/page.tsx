'use client';

import { useEffect } from 'react';
import { useJobStats } from '@/hooks/queries/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { JobPipelineVisualization } from '@/components/dashboard/JobPipelineVisualization';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { LiveLogViewer } from '@/components/dashboard/LiveLogViewer';
import { SocketDebugPanel } from '@/components/socket/SocketDebugPanel';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useJobStats();

  useEffect(() => {
    console.log('[DashboardPage] Mounted. Loading:', isLoading);
    if (stats) console.log('[DashboardPage] Stats:', stats);
    if (error) console.error('[DashboardPage] Error:', error);
  }, [stats, isLoading, error]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">AI Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of your autonomous job agent.</p>
      </div>

      {/* Top Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="glass-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Extracted</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-blue-500/80 mt-1">Scanning across 4 platforms</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                <p className="text-xs text-yellow-500/80 mt-1">Awaiting your review in Telegram</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto Applied</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.approved || 0}</div>
                <p className="text-xs text-green-500/80 mt-1">Successfully submitted by AI</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">100%</div>
                <p className="text-xs text-purple-500/80 mt-1">WhatsApp & DB Connected</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Realtime Pipeline */}
      <div className="w-full">
        <JobPipelineVisualization />
      </div>

      {/* Split View: Activity Feed & Logs */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 lg:h-[400px]">
        <LiveActivityFeed />
        <LiveLogViewer />
      </div>

      <div className="pt-6">
        <SocketDebugPanel />
      </div>
    </div>
  );
}
