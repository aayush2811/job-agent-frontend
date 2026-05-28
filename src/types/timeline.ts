export type TimelineStageId =
  | 'found'
  | 'matched'
  | 'resume'
  | 'approval'
  | 'applying'
  | 'applied'
  | 'outcome';

export interface TimelineEntry {
  id: string;
  jobId?: string;
  stage: TimelineStageId;
  label: string;
  detail: string;
  timestamp: Date;
  status: 'pending' | 'active' | 'done' | 'failed';
}

export const TIMELINE_STAGES: { id: TimelineStageId; label: string }[] = [
  { id: 'found', label: 'Found Job' },
  { id: 'matched', label: 'AI Match' },
  { id: 'resume', label: 'Resume Selected' },
  { id: 'approval', label: 'Approval' },
  { id: 'applying', label: 'Applying' },
  { id: 'applied', label: 'Applied' },
  { id: 'outcome', label: 'Outcome' },
];
