'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useUploadResume } from '@/hooks/queries/useResumes';
import { UploadCloud, FileType, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ResumeUpload() {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { mutate: uploadResume, isPending } = useUploadResume();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
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
      uploadResume(file, {
        onError: () => {
          setUploadError('Upload failed. Please try again.');
          toast.error('Failed to upload resume');
        },
        onSuccess: () => {
          toast.success('Resume uploaded successfully');
        }
      });
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isPending
  });

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
      
      <div 
        {...getRootProps()}
        className={cn(
          "relative group border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer overflow-hidden",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isPending ? (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Uploading Document...</p>
                <p className="text-xs text-muted-foreground">Sending to backend API</p>
              </div>
              
              {/* Fake progress bar */}
              <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden mt-4">
                <div className="h-full bg-primary w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isDragActive ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <UploadCloud className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or DOCX (max. 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm animate-in fade-in slide-in-from-top-1">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      {!isPending && !uploadError && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span>Secure and private. Only you can view this.</span>
        </div>
      )}
    </div>
  );
}
