'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useUploadResume } from '@/hooks/queries/useResumes';
import { UploadCloud, XCircle, Loader2, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';

export function ResumeUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'upload' | 'parse'>('idle');
  const { mutate: uploadResume, isPending } = useUploadResume();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setUploadError(null);

      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        if (error.code === 'file-invalid-type') {
          setUploadError('Please upload a PDF or DOCX file.');
        } else if (error.code === 'file-too-large') {
          setUploadError('File size must be less than 5MB.');
        } else {
          setUploadError(error.message);
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setPhase('upload');
        uploadResume(file, {
          onError: (err) => {
            setPhase('idle');
            const errMsg = getApiErrorMessage(err, 'Upload failed. Please try again.');
            setUploadError(errMsg);
            toast.error(errMsg);
          },
          onSuccess: () => {
            setPhase('parse');
            setTimeout(() => setPhase('idle'), 1200);
            toast.success('Resume parsed — AI skills extracted');
            onSuccess?.();
          },
        });
      }
    },
    [uploadResume, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isPending,
  });

  const busy = isPending || phase !== 'idle';

  return (
    <div className="glass-card rounded-2xl border-none p-6 shadow-lg glow-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Premium Resume Upload</h3>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center cursor-pointer overflow-hidden',
          isDragActive && 'border-primary bg-primary/10 scale-[1.01]',
          !isDragActive && 'border-primary/30 hover:border-primary/60 hover:bg-primary/5',
          busy && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <motion.div
            layoutId="upload-glow"
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"
          />
        )}

        <div className="relative flex flex-col items-center justify-center space-y-4">
          {busy ? (
            <>
              <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center glow-ring">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {phase === 'parse' ? 'Extracting skills with AI…' : 'Uploading securely…'}
                </p>
                <p className="text-xs text-muted-foreground">PDF/DOCX → structured profile</p>
              </div>
              <div className="w-full max-w-[220px] h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary"
                  initial={{ width: '8%' }}
                  animate={{ width: phase === 'parse' ? '100%' : '65%' }}
                  transition={{ duration: phase === 'parse' ? 1 : 2, ease: 'easeInOut' }}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                  isDragActive
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
                )}
              >
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  <span className="text-primary">Drop resume</span> or click to browse
                </p>
                <p className="text-xs text-muted-foreground">PDF · DOCX · max 5MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        Owner-only access · encrypted in transit
      </div>
    </div>
  );
}
