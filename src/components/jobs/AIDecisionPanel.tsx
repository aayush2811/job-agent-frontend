'use client';

import { motion } from 'framer-motion';
import type { JobRecord } from '@/types/job';
import { Sparkles, Brain, Target, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

function Meter({ value, label }: { value: number; label: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-primary to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function AIDecisionPanel({ job }: { job: JobRecord }) {
  const aiScore = job.resumeMatchScore ?? 0;
  const pipeline = job.matchScore ?? 0;
  const confidence = job.confidence ?? 0;
  const matched = job.matchedSkills ?? [];
  const missing = job.missingSkills ?? [];
  const resume =
    typeof job.recommendedResumeId === 'object'
      ? job.recommendedResumeId?.title
      : job.recommendedResumeId
        ? 'Selected resume'
        : null;

  const recommendation =
    aiScore >= 85
      ? 'Strong fit — prioritize approval or auto-apply'
      : aiScore >= 65
        ? 'Good fit — review missing skills before applying'
        : 'Weak fit — consider skipping or updating resume';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-4 glow-sm"
    >
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-sm">AI decision engine</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Meter value={aiScore} label="Resume match" />
        <Meter value={confidence} label="Confidence" />
        <Meter value={pipeline} label="Pipeline score" />
      </div>

      {resume && (
        <div className="flex items-start gap-2 text-sm rounded-lg bg-muted/40 p-2">
          <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Selected resume</p>
            <p className="text-muted-foreground text-xs">{resume}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 text-xs">
        {matched.length > 0 && (
          <p>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <Target className="w-3 h-3" /> Matched skills
            </span>
            {matched.join(', ')}
          </p>
        )}
        {missing.length > 0 && (
          <p className="flex items-start gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <span className="text-amber-500 font-medium">Gaps: </span>
              {missing.join(', ')}
            </span>
          </p>
        )}
        {job.experienceMatch && (
          <p className="text-muted-foreground">Experience: {job.experienceMatch}</p>
        )}
      </div>

      <div
        className={cn(
          'flex items-start gap-2 rounded-lg p-3 text-sm border',
          aiScore >= 75
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-amber-500/30 bg-amber-500/10'
        )}
      >
        <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Recommendation
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">{recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
}
