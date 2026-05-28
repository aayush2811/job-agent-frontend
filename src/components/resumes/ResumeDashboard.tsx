'use client';

import { useState } from 'react';
import { useResumes, useResumeStats } from '@/hooks/queries/useResumes';
import { ResumeUpload } from './ResumeUpload';
import { ResumeCard } from './ResumeCard';
import { ResumePreviewModal } from './ResumePreviewModal';
import { Resume } from '@/types/resume';
import { Search, Filter, AlertCircle, FileUp, Zap, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function ResumeDashboard() {
  const { data: resumes, isLoading, isError, error } = useResumes();
  const { data: stats } = useResumeStats();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const filteredResumes = resumes?.filter(resume => 
    resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Resume Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Manage and optimize your professional profiles for AI matching.</p>
          {isError && (
            <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Could not reach resume API — check NEXT_PUBLIC_API_URL and server CORS.
            </p>
          )}
        </div>
        
        {/* Quick Stats */}
        {stats && (
          <div className="flex items-center gap-4 bg-card border rounded-xl p-3 shadow-sm">
            <div className="text-center px-4 border-r">
              <div className="text-2xl font-bold text-primary">{stats.ready}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-green-500">{stats.averageAtsScore}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg ATS</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search resumes or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Resumes Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-card rounded-xl border animate-pulse" />
              ))}
            </div>
          ) : filteredResumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredResumes.map(resume => (
                <ResumeCard 
                  key={resume.id} 
                  resume={resume} 
                  onPreview={() => setSelectedResume(resume)} 
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileUp}
              title={searchQuery ? 'No matches' : 'Upload your first resume'}
              description={
                searchQuery
                  ? 'Try different search terms or tags.'
                  : 'AI will extract skills, score ATS fit, and power job matching automatically.'
              }
            />
          )}
        </div>

        {/* Sidebar Area (Upload) */}
        <div className="lg:col-span-1 space-y-6">
          <ResumeUpload />
          
          {/* Educational / Promo Card */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-xl border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Boost Your Score
            </h3>
            <p className="text-sm text-muted-foreground mb-4 relative z-10">
              Our AI analyzes your resume against millions of successful profiles. Ensure you include quantifiable metrics to improve your impact score.
            </p>
            <button className="text-sm text-primary font-medium hover:underline relative z-10">
              View Optimization Guide &rarr;
            </button>
          </div>
        </div>
      </div>

      {selectedResume && (
        <ResumePreviewModal 
          resume={selectedResume} 
          onClose={() => setSelectedResume(null)} 
        />
      )}
    </div>
  );
}
