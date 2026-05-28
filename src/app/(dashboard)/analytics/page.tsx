'use client';

import { useMemo } from 'react';
import { useDashboardStats, usePlatformStats } from '@/hooks/queries/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/charts/ChartContainer';

export default function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { data: platforms, isLoading: isPlatformLoading } = usePlatformStats();

  const chartData = useMemo(() => {
    const daily = stats?.dailyActivity || [];
    if (daily.length > 0) {
      return daily.map((d: any) => ({
        name: d.name || d.date || '—',
        apps: d.apps ?? d.count ?? 0,
      }));
    }
    return [
      { name: 'Mon', apps: 0 },
      { name: 'Tue', apps: 0 },
      { name: 'Wed', apps: 0 },
      { name: 'Thu', apps: 0 },
      { name: 'Fri', apps: 0 },
      { name: 'Sat', apps: 0 },
      { name: 'Sun', apps: 0 },
    ];
  }, [stats?.dailyActivity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Analytics</h1>
        <p className="text-muted-foreground mt-2">Detailed metrics and conversion rates.</p>
        {isError && (
          <p className="text-sm text-yellow-600 mt-2">
            Live analytics unavailable — showing safe defaults.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalJobs ?? 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.applications ?? 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.interviews ?? 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.successRate ?? 0}%</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-6">
        <Card className="glass-card border-none shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="apps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle>Job Extraction Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPlatformLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : platforms && platforms.length > 0 ? (
              platforms.map((p: any, idx: number) => {
                const totalExtractedJobs = platforms.reduce((acc: number, curr: any) => acc + (curr.jobs || 0), 0);
                const percent = totalExtractedJobs > 0 ? Math.round((p.jobs / totalExtractedJobs) * 100) : 0;
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{p.name || 'Platform'}</span>
                      <span className="text-muted-foreground font-mono">{p.jobs} jobs ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No platform data found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
