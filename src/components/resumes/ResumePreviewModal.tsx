'use client';

import { Resume } from '@/types/resume';
import { X, FileText, CheckCircle2, TrendingUp, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface ResumePreviewModalProps {
  resume: Resume;
  onClose: () => void;
}

export function ResumePreviewModal({ resume, onClose }: ResumePreviewModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{resume.title}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{resume.originalFileName}</span>
                <span>•</span>
                <span>{(resume.fileSize / 1024).toFixed(0)} KB</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Split Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left Pane - Real PDF Viewer */}
          <div className="w-full md:w-1/2 border-r bg-muted/10 p-4 flex flex-col h-full">
            {resume.fileUrl ? (
              <iframe 
                src={`${resume.fileUrl}#toolbar=0&navpanes=0`} 
                className="w-full flex-1 rounded-xl border bg-white shadow-inner min-h-[450px]" 
                title="Resume Preview"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-background border shadow-sm rounded-xl p-8 max-w-md mx-auto">
                <Search className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No preview available</p>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  This document has no valid file path.
                </p>
              </div>
            )}
          </div>

          {/* Right Pane - AI Insights */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-card space-y-8">
            
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-gradient-to-br from-green-500/10 to-background border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">ATS Compatibility</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-foreground">{resume.aiMetrics.atsScore}%</span>
                  <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-500/10 to-background border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Impact Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-foreground">{resume.aiMetrics.impactScore}</span>
                  <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Extracted Skills */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                AI Extracted Skills
              </h3>
              <div className="space-y-3">
                {resume.parsedData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium truncate" title={skill.name}>{skill.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground">{skill.confidence}%</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Keywords */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Identified Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.parsedData.keywords.map((kw, idx) => (
                  <div key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1.5 border">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {kw}
                  </div>
                ))}
              </div>
            </section>
            
          </div>
        </div>

      </div>
    </div>
  );
}
