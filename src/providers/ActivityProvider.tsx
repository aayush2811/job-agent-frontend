'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { emitActivity, mapLogToActivity } from '@/lib/activity-bus';
import { useActivityStore } from '@/store/useActivityStore';
import { useRealtimeStats } from '@/hooks/queries/useAnalytics';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';

/** All realtime events — mission control bus */
const PIPELINE_EVENTS = [
  'job-created',
  'job-scored',
  'job-matched',
  'match-updated',
  'approval-pending',
  'approval-resolved',
  'approval-timeout',
  'job-applied',
  'application-failed',
  'application-retrying',
  'application-start',
  'dashboard-update',
  'resume-uploaded',
  'resume-updated',
  'resume-deleted',
  'whatsapp-status',
  'qr-updated',
  'telegram-approval-requested',
  'telegram-approval-updated',
];

const INVALIDATE_ON: Record<string, string[][]> = {
  'job-created': [['jobs'], ['jobStats'], ['dashboardStats'], ['pipelineStats']],
  'job-scored': [['jobs'], ['pipelineStats']],
  'job-matched': [['jobs'], ['telegramApprovals']],
  'match-updated': [['jobs']],
  'approval-pending': [['jobs'], ['jobStats'], ['telegramApprovals']],
  'approval-resolved': [['jobs'], ['jobStats'], ['telegramApprovals']],
  'approval-timeout': [['jobs'], ['telegramApprovals']],
  'job-applied': [['jobs'], ['jobStats'], ['applications'], ['dashboardStats']],
  'application-failed': [['jobs'], ['applications']],
  'application-start': [['jobs'], ['applications']],
  'resume-uploaded': [['resumes']],
  'resume-updated': [['resumes']],
  'resume-deleted': [['resumes']],
  'whatsapp-status': [['whatsappStatus']],
  'qr-updated': [['whatsappStatus']],
  'telegram-approval-requested': [['telegramApprovals']],
  'telegram-approval-updated': [['telegramApprovals']],
};

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const enabled = useAuthQueryEnabled();
  const { data: realtime } = useRealtimeStats();
  const pushMany = useActivityStore((s) => s.pushMany);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!enabled || seededRef.current) return;
    const logs =
      (realtime as { latestActivity?: unknown[]; recentActivity?: unknown[] })
        ?.latestActivity ||
      (realtime as { recentActivity?: unknown[] })?.recentActivity;
    if (!logs?.length) return;
    seededRef.current = true;
    const mapped = (logs as Parameters<typeof mapLogToActivity>[0][]).map(mapLogToActivity);
    pushMany(mapped.slice(0, 30));
  }, [enabled, realtime, pushMany]);

  useEffect(() => {
    if (!socket) return;

    const handlers = PIPELINE_EVENTS.map((event) => {
      const handler = (payload: Record<string, unknown>) => {
        const showToast =
          event === 'approval-pending' ||
          event === 'telegram-approval-requested' ||
          event === 'job-applied' ||
          event === 'application-failed';
        emitActivity(event, payload, { toast: showToast });

        const keys = INVALIDATE_ON[event];
        if (keys) {
          keys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      };
      socket.on(event, handler);
      return { event, handler };
    });

    return () => {
      handlers.forEach(({ event, handler }) => {
        socket.off(event, handler);
      });
    };
  }, [socket, queryClient]);

  return <>{children}</>;
}
