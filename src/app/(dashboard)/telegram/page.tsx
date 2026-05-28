'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTelegramApprovals, useApproveJob, useRejectJob } from '@/hooks/queries/useTelegram';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Smartphone, Keyboard } from 'lucide-react';
import { AIDecisionPanel } from '@/components/jobs/AIDecisionPanel';
import { ApprovalCountdown } from '@/components/approval/ApprovalCountdown';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobRecord } from '@/types/job';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function TelegramPage() {
  const { data: approvals, isLoading } = useTelegramApprovals();
  const { mutate: approveJob } = useApproveJob();
  const { mutate: rejectJob } = useRejectJob();
  const [queue, setQueue] = useState<JobRecord[]>([]);

  useEffect(() => {
    if (approvals) setQueue(approvals as JobRecord[]);
  }, [approvals]);

  const handleAction = useCallback(
    (id: string, action: 'approve' | 'reject') => {
      const item = queue.find((q) => (q.id || q._id) === id);
      if (action === 'approve') {
        approveJob(id, {
          onSuccess: () => toast.success(`Approved ${item?.role || 'job'}`),
        });
      } else {
        rejectJob(id, {
          onSuccess: () => toast.info(`Rejected ${item?.role || 'job'}`),
        });
      }
      setQueue((prev) => prev.filter((j) => (j.id || j._id) !== id));
    },
    [approveJob, rejectJob, queue]
  );

  const front = queue[0];
  const frontId = front ? String(front.id || front._id) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!frontId || e.target instanceof HTMLInputElement) return;
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAction(frontId, 'approve');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleAction(frontId, 'reject');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [frontId, handleAction]);

  const bulkApprove = () => {
    const ids = queue.map((j) => String(j.id || j._id));
    ids.forEach((id) => approveJob(id));
    toast.success(`Approved ${ids.length} jobs`);
    setQueue([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-2">
          <Smartphone className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Approval Center</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Swipe-style queue with live AI match insights.{' '}
          <span className="text-primary font-medium">A</span> approve ·{' '}
          <span className="text-destructive font-medium">R</span> reject
        </p>
        {queue.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="glow-sm">
              {queue.length} in queue
            </Badge>
            <Button size="sm" variant="secondary" onClick={bulkApprove}>
              Approve all
            </Button>
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Keyboard className="w-3.5 h-3.5" />
        Shortcuts active on front card
      </div>

      <div className="relative min-h-[420px] flex items-center justify-center touch-pan-y">
        {isLoading ? (
          <Card className="glass-card border-none shadow-xl w-full max-w-md">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : queue.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {queue.map((item, index) => {
              const isFront = index === 0;
              const id = String(item.id || item._id);
              return (
                <motion.div
                  key={id}
                  layout
                  drag={isFront ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(_, info) => {
                    if (!isFront) return;
                    if (info.offset.x > 100) handleAction(id, 'approve');
                    if (info.offset.x < -100) handleAction(id, 'reject');
                  }}
                  initial={{ scale: 0.9, opacity: 0, y: 40 }}
                  animate={{
                    scale: isFront ? 1 : Math.max(0.85, 0.95 - index * 0.04),
                    opacity: isFront ? 1 : Math.max(0.2, 0.6 - index * 0.15),
                    y: index * 16,
                    zIndex: queue.length - index,
                  }}
                  exit={{
                    opacity: 0,
                    x: (item as JobRecord & { _lastAction?: string })._lastAction === 'approve' ? 200 : -200,
                    rotate: (item as JobRecord & { _lastAction?: string })._lastAction === 'approve' ? 12 : -12,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
                >
                  <Card
                    className={`glass-card border-none shadow-2xl ${isFront ? 'glow-border' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-2xl font-bold truncate">{item.role}</CardTitle>
                          <p className="text-sm text-muted-foreground">{item.company}</p>
                        </div>
                        {isFront && (
                          <ApprovalCountdown createdAt={item.createdAt} />
                        )}
                      </div>
                      {isFront && (item.resumeMatchScore ?? 0) > 0 && (
                        <motion.div
                          className="mt-2 h-1 rounded-full bg-muted overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.resumeMatchScore}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </motion.div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AIDecisionPanel job={item} />
                    </CardContent>
                    <CardFooter className="gap-3">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-red-500/50 text-red-500"
                        onClick={() => {
                          (item as JobRecord & { _lastAction?: string })._lastAction = 'reject';
                          handleAction(id, 'reject');
                        }}
                      >
                        <X className="w-5 h-5 mr-2" /> Reject (R)
                      </Button>
                      <Button
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => {
                          (item as JobRecord & { _lastAction?: string })._lastAction = 'approve';
                          handleAction(id, 'approve');
                        }}
                      >
                        <Check className="w-5 h-5 mr-2" /> Approve (A)
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <EmptyState
            icon={Check}
            title="Queue clear"
            description="New approval requests will slide in here in real time when the AI finds high-match roles."
          />
        )}
      </div>
    </div>
  );
}
