'use client';

import { Badge } from '@/components/ui/badge';
import type { JobRecord, RecommendedResumeRef } from '@/types/job';
import { Sparkles, FileText, AlertTriangle } from 'lucide-react';

function resolveResume(job: JobRecord): RecommendedResumeRef | null {
  const ref = job.recommendedResumeId;
  if (!ref) return null;
  if (typeof ref === 'string') return { _id: ref, title: 'Resume' };
  return ref;
}

function scoreTone(score: number) {
  if (score >= 80) return 'border-green-500/40 text-green-500 bg-green-500/10';
  if (score >= 55) return 'border-yellow-500/40 text-yellow-500 bg-yellow-500/10';
  return 'border-red-500/40 text-red-400 bg-red-500/10';
}

function confidenceTone(confidence: number) {
  if (confidence >= 70) return 'text-green-500';
  if (confidence >= 45) return 'text-yellow-500';
  return 'text-muted-foreground';
}

interface JobMatchInsightProps {
  job: JobRecord;
  compact?: boolean;
}

export function JobMatchInsightPanel({ job, compact = false }: JobMatchInsightProps) {
  const aiScore = job.resumeMatchScore ?? 0;
  const confidence = job.confidence ?? 0;
  const resume = resolveResume(job);
  const matched = job.matchedSkills ?? [];
  const missing = job.missingSkills ?? [];

  if (!aiScore && !resume && !matched.length) {
    return (
      <span className="text-xs text-muted-foreground">No AI match yet</span>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={`text-xs ${scoreTone(aiScore)}`}>
          <Sparkles className="w-3 h-3 mr-1" />
          {aiScore}%
        </Badge>
        {resume?.title && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {resume.title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={scoreTone(aiScore)}>
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          AI Match {aiScore}%
        </Badge>
        <span className={`text-xs font-medium ${confidenceTone(confidence)}`}>
          Confidence {confidence}%
        </span>
      </div>
      {resume?.title && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{resume.title}</span>
          {resume.isDefault && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              default
            </Badge>
          )}
        </div>
      )}
      {job.experienceMatch && (
        <p className="text-xs text-muted-foreground">Experience: {job.experienceMatch}</p>
      )}
      {matched.length > 0 && (
        <p className="text-xs">
          <span className="text-green-500/90">Matched: </span>
          {matched.slice(0, 6).join(', ')}
          {matched.length > 6 ? '…' : ''}
        </p>
      )}
      {missing.length > 0 && (
        <p className="text-xs flex items-start gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <span className="text-amber-500/90">Missing: </span>
            {missing.slice(0, 5).join(', ')}
            {missing.length > 5 ? '…' : ''}
          </span>
        </p>
      )}
    </div>
  );
}
