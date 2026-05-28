'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AIDecisionPanel } from '@/components/jobs/AIDecisionPanel';
import type { JobRecord } from '@/types/job';
import { Brain, Clock, Zap, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

function ConfidenceMeter({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>AI confidence</span>
        <span>{v}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

export function JobAutomationCard({ job, index = 0 }: { job: JobRecord; index?: number }) {
  const aiScore = job.resumeMatchScore ?? job.matchScore ?? 0;
  const isAuto =
    job.status === 'auto_applied' || job.status === 'approved';
  const isPending = job.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'glass-card rounded-xl p-4 border transition-all hover:glow-border',
        isPending && 'border-amber-500/30',
        isAuto && 'border-emerald-500/20'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{job.role}</h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            isAuto && 'border-emerald-500/50 text-emerald-500',
            isPending && 'border-amber-500/50 text-amber-500'
          )}
        >
          {job.status}
        </Badge>
      </div>

      <ConfidenceMeter value={aiScore} />

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
        {job.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" /> {job.email}
          </span>
        )}
        {isAuto && (
          <span className="flex items-center gap-1 text-emerald-500">
            <Zap className="w-3 h-3" /> Auto-apply eligible
          </span>
        )}
        {isPending && (
          <span className="flex items-center gap-1 text-amber-500">
            <Clock className="w-3 h-3" /> Awaiting approval
          </span>
        )}
        <span className="flex items-center gap-1 text-primary">
          <Brain className="w-3 h-3" /> Pipeline {job.matchScore ?? '—'}%
        </span>
      </div>

      {job.matchedSkills?.length ? (
        <p className="text-xs mt-2 text-muted-foreground line-clamp-1">
          Skills: {job.matchedSkills.slice(0, 6).join(', ')}
        </p>
      ) : null}

      <div className="mt-3">
        <AIDecisionPanel job={job} />
      </div>
    </motion.div>
  );
}
