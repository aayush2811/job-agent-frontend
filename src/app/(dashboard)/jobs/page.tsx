'use client';

import { useState } from 'react';
import { useJobs } from '@/hooks/queries/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { JobMatchInsightPanel } from '@/components/jobs/JobMatchInsight';
import { JobAutomationCard } from '@/components/jobs/JobAutomationCard';
import type { JobRecord } from '@/types/job';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PulseDot } from '@/components/ui/pulse-dot';
import { useSocket } from '@/hooks/useSocket';

const columns = [
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => {
      const status = row.getValue('status');
      return (
        <Badge
          variant="outline"
          className={
            status === 'approved' || status === 'auto_applied'
              ? 'border-green-500 text-green-500'
              : status === 'rejected' || status === 'failed'
                ? 'border-red-500 text-red-500'
                : 'border-yellow-500 text-yellow-500'
          }
        >
          {String(status)}
        </Badge>
      );
    },
  },
  {
    id: 'aiMatch',
    header: 'AI Match',
    cell: ({ row }: { row: { original: JobRecord } }) => (
      <JobMatchInsightPanel job={row.original} compact />
    ),
  },
  {
    accessorKey: 'matchScore',
    header: 'Pipeline',
    cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => {
      const score = row.getValue('matchScore');
      return score != null ? `${score}%` : '—';
    },
  },
];

export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs();
  const { isConnected } = useSocket();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const list = (jobs as JobRecord[]) || [];

  const table = useReactTable({
    data: list,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient flex items-center gap-2">
            Job Automation
            <PulseDot active={isConnected} variant="primary" />
          </h1>
          <p className="text-muted-foreground mt-2">
            AI is actively scoring, matching resumes, and queuing applications in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="w-4 h-4 mr-1" /> Cards
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            <List className="w-4 h-4 mr-1" /> Table
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Connect WhatsApp and let the agent extract leads. New jobs will appear here with live AI match scores."
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((job, i) => (
            <JobAutomationCard key={job.id || job._id || i} job={job} index={i} />
          ))}
        </div>
      ) : (
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle>All jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
