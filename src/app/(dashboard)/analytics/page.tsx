'use client';

import { useEffect } from 'react';
import { useDashboardStats } from '@/hooks/queries/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', apps: 40 },
  { name: 'Tue', apps: 30 },
  { name: 'Wed', apps: 20 },
  { name: 'Thu', apps: 27 },
  { name: 'Fri', apps: 18 },
  { name: 'Sat', apps: 23 },
  { name: 'Sun', apps: 34 },
];

export default function AnalyticsPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  useEffect(() => {
    console.log('[AnalyticsPage] Mounted. Loading:', isLoading);
    if (stats) console.log('[AnalyticsPage] Stats:', stats);
    if (error) console.error('[AnalyticsPage] Error:', error);
  }, [stats, isLoading, error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Analytics</h1>
        <p className="text-muted-foreground mt-2">Detailed metrics and conversion rates.</p>
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
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.applications || 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.interviews || 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.offers || 0}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="glass-card border-none shadow-lg mt-6">
        <CardHeader>
          <CardTitle>Application Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="apps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
