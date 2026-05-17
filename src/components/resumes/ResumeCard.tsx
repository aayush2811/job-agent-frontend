'use client';

import { Resume } from '@/types/resume';
import { useDeleteResume, useSetDefaultResume } from '@/hooks/queries/useResumes';
import { MoreVertical, FileText, CheckCircle2, Star, Trash2, Eye, Activity, Gauge, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ResumeCardProps {
  resume: Resume;
  onPreview: () => void;
}

export function ResumeCard({ resume, onPreview }: ResumeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();
  const { mutate: setDefault } = useSetDefaultResume();

  const isProcessing = resume.status !== 'ready' && resume.status !== 'error';

  return (
    <div className={cn(
      "group relative bg-card rounded-xl border p-5 transition-all duration-300 hover:shadow-md",
      resume.isDefault ? "border-primary/50 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]" : "hover:border-muted-foreground/30",
      isDeleting && "opacity-50 pointer-events-none",
      isProcessing && "animate-pulse"
    )}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            resume.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-base truncate pr-2 text-foreground" title={resume.title}>
              {resume.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{new Date(resume.uploadDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>{(resume.fileSize / 1024).toFixed(0)} KB</span>
            </div>
          </div>
        </div>

        {/* Action Menu Toggle */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border rounded-lg shadow-lg py-1 z-10 animate-in zoom-in-95 origin-top-right">
              <button 
                onClick={onPreview}
                className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
                Preview
              </button>
              <button 
                onClick={() => {
                  // Currently mocked. In a real app, this would open a modal with a form to update title, tags, etc.
                  /* edit metadata — modal TBD */
                }}
                className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                Edit Metadata
              </button>
              {!resume.isDefault && (
                <button 
                  onClick={() => setDefault(resume.id)}
                  className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-muted-foreground" />
                  Set Default
                </button>
              )}
              <div className="h-px bg-border my-1" />
              <button 
                onClick={() => deleteResume(resume.id)}
                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Area */}
      {isProcessing ? (
        <div className="py-4 flex flex-col items-center justify-center space-y-2 bg-muted/30 rounded-lg border border-dashed">
           <Activity className="w-5 h-5 text-primary animate-bounce" />
           <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Analysis in Progress</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* AI Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background rounded-lg p-2.5 border flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                ATS Score
              </span>
              <span className={cn(
                "text-sm font-bold",
                resume.aiMetrics.atsScore >= 80 ? "text-green-500" : 
                resume.aiMetrics.atsScore >= 60 ? "text-yellow-500" : "text-destructive"
              )}>
                {resume.aiMetrics.atsScore}
              </span>
            </div>
            <div className="bg-background rounded-lg p-2.5 border flex items-center justify-between">
               <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Impact
              </span>
              <span className="text-sm font-bold text-foreground">
                {resume.aiMetrics.impactScore}/100
              </span>
            </div>
          </div>

          {/* Extracted Skills */}
          {resume.parsedData.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Top Extracted Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {resume.parsedData.skills.slice(0, 4).map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill.name}
                  </span>
                ))}
                {resume.parsedData.skills.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                    +{resume.parsedData.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges Overlay */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-2 flex gap-1">
        {resume.isDefault && (
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            DEFAULT
          </div>
        )}
      </div>

    </div>
  );
}
