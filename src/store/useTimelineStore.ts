import { create } from 'zustand';
import type { TimelineEntry, TimelineStageId } from '@/types/timeline';

const MAX = 24;

interface TimelineState {
  entries: TimelineEntry[];
  activeJobId: string | null;
  pushStage: (entry: Omit<TimelineEntry, 'id'>) => void;
  clear: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  entries: [],
  activeJobId: null,
  pushStage: (entry) =>
    set((state) => {
      const id = `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newEntry: TimelineEntry = { ...entry, id };
      const withoutDup =
        entry.jobId && entry.stage !== 'outcome'
          ? state.entries.filter(
              (e) => !(e.jobId === entry.jobId && e.stage === entry.stage)
            )
          : state.entries;
      return {
        entries: [newEntry, ...withoutDup].slice(0, MAX),
        activeJobId: entry.jobId || state.activeJobId,
      };
    }),
  clear: () => set({ entries: [], activeJobId: null }),
}));

export function eventToTimeline(
  event: string,
  payload: Record<string, unknown>
): Omit<TimelineEntry, 'id'> | null {
  const jobId = payload.jobId ? String(payload.jobId) : undefined;
  const role = payload.role ? String(payload.role) : '';
  const company = payload.company ? String(payload.company) : '';
  const detail = role && company ? `${role} @ ${company}` : jobId ? `Job …${jobId.slice(-6)}` : '';

  const map: Record<string, { stage: TimelineStageId; label: string; status: TimelineEntry['status'] }> = {
    'job-created': { stage: 'found', label: 'Job discovered', status: 'done' },
    'job-matched': { stage: 'matched', label: 'AI match computed', status: 'done' },
    'match-updated': { stage: 'matched', label: 'Match refined', status: 'active' },
    'approval-pending': { stage: 'approval', label: 'Approval requested', status: 'active' },
    'telegram-approval-requested': { stage: 'approval', label: 'Telegram alert sent', status: 'active' },
    'application-start': { stage: 'applying', label: 'Applying…', status: 'active' },
    'job-applied': { stage: 'applied', label: 'Application sent', status: 'done' },
    'application-failed': { stage: 'outcome', label: 'Application failed', status: 'failed' },
    'approval-resolved': {
      stage: 'outcome',
      label: payload.action === 'rejected' ? 'Rejected' : 'Approved',
      status: payload.action === 'rejected' ? 'failed' : 'done',
    },
  };

  const m = map[event];
  if (!m) return null;

  return {
    jobId,
    stage: m.stage,
    label: m.label,
    detail,
    timestamp: new Date(String(payload.at || Date.now())),
    status: m.status,
  };
}
