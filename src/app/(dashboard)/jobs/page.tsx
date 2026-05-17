'use client';

import { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/queries/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const columns = [
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'role', header: 'Role' },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      return (
        <Badge variant="outline" className={
          status === 'approved' ? 'border-green-500 text-green-500' :
          status === 'rejected' ? 'border-red-500 text-red-500' :
          'border-yellow-500 text-yellow-500'
        }>
          {String(status)}
        </Badge>
      );
    }
  },
  { accessorKey: 'score', header: 'Match Score' },
  { 
    accessorKey: 'date', 
    header: 'Date',
    cell: ({ row }: any) => new Date(row.getValue('date')).toLocaleDateString()
  },
];

export default function JobsPage() {
  const { data: jobs, isLoading, error } = useJobs();
  
  const table = useReactTable({
    data: jobs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Jobs Management</h1>
        <p className="text-muted-foreground mt-2">Manage and track your job postings and matches.</p>
      </div>

      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle>All Extracted Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No jobs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
