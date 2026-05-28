import type { ActivityItem, ActivityKind } from '@/types/activity';
import { useActivityStore } from '@/store/useActivityStore';
import { useTimelineStore, eventToTimeline } from '@/store/useTimelineStore';
import { toast } from 'sonner';

function mapSocketEvent(event: string): { kind: ActivityKind; title: string } {
  const map: Record<string, { kind: ActivityKind; title: string }> = {
    'job-created': { kind: 'job_found', title: 'Job discovered' },
    'job-scored': { kind: 'job_scored', title: 'Job scored' },
    'job-matched': { kind: 'match', title: 'Resume matched' },
    'match-updated': { kind: 'match', title: 'Match updated' },
    'approval-pending': { kind: 'approval', title: 'Awaiting approval' },
    'approval-resolved': { kind: 'approval', title: 'Approval resolved' },
    'approval-timeout': { kind: 'approval', title: 'Approval expired' },
    'job-applied': { kind: 'applied', title: 'Application sent' },
    'application-failed': { kind: 'failed', title: 'Application failed' },
    'application-retrying': { kind: 'system', title: 'Retrying apply' },
    'application-start': { kind: 'applied', title: 'Applying now' },
    'resume-uploaded': { kind: 'resume', title: 'Resume uploaded' },
    'resume-updated': { kind: 'resume', title: 'Resume updated' },
    'resume-deleted': { kind: 'resume', title: 'Resume removed' },
    'whatsapp-status': { kind: 'whatsapp', title: 'WhatsApp status' },
    'qr-updated': { kind: 'whatsapp', title: 'WhatsApp QR' },
    'telegram-approval-requested': { kind: 'telegram', title: 'Telegram alert' },
    'telegram-approval-updated': { kind: 'telegram', title: 'Telegram update' },
    'dashboard-update': { kind: 'system', title: 'Pipeline update' },
  };
  return map[event] || { kind: 'system', title: event.replace(/-/g, ' ') };
}

function defaultMessage(event: string, payload: Record<string, unknown>): string {
  if (payload.message) return String(payload.message);
  if (payload.role && payload.company) {
    return `${payload.role} @ ${payload.company}`;
  }
  if (payload.jobId) return `Job ${String(payload.jobId).slice(-6)}`;
  if (payload.reason) return String(payload.reason);
  if (payload.status) return String(payload.status);
  return event.replace(/-/g, ' ');
}

export function emitActivity(
  event: string,
  payload: Record<string, unknown> = {},
  options?: { toast?: boolean; silent?: boolean }
) {
  const { kind, title } = mapSocketEvent(event);
  const item: Omit<ActivityItem, 'id'> = {
    kind,
    title,
    message: defaultMessage(event, payload),
    timestamp: new Date(String(payload.at || Date.now())),
    meta: { event, ...payload },
  };

  if (!options?.silent) {
    useActivityStore.getState().push(item);
  }

  const tl = eventToTimeline(event, payload);
  if (tl) {
    useTimelineStore.getState().pushStage(tl);
  }

  if (event === 'whatsapp-status' && payload.status === 'connected') {
    useActivityStore.getState().push({
      kind: 'whatsapp',
      title: 'WhatsApp connected',
      message: 'Inbox listening for job leads',
      timestamp: new Date(),
      meta: payload,
    });
  }

  if (options?.toast) {
    toast.message(title, { description: item.message });
  }
}

export function mapLogToActivity(log: {
  _id?: string;
  type?: string;
  message?: string;
  createdAt?: string;
}): ActivityItem {
  const t = String(log.type || '').toLowerCase();
  let kind: ActivityKind = 'system';
  if (t.includes('fail') || t.includes('err')) kind = 'failed';
  else if (t.includes('apply')) kind = 'applied';
  else if (t.includes('approve') || t.includes('pending')) kind = 'approval';
  else if (t.includes('match')) kind = 'match';
  else if (t.includes('telegram')) kind = 'telegram';
  else if (t.includes('whatsapp')) kind = 'whatsapp';
  else if (t.includes('job')) kind = 'job_found';

  return {
    id: log._id || `log-${Math.random()}`,
    kind,
    title: log.type || 'Activity',
    message: log.message || '—',
    timestamp: new Date(log.createdAt || Date.now()),
  };
}
