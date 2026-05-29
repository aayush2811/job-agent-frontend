'use client';

import { useDemoLoginDebugStore } from '@/store/useDemoLoginDebugStore';

export function DemoLoginDebugPanel() {
  const { apiUrl, endpointCalled, responseStatus, errorMessage } = useDemoLoginDebugStore();

  // If there hasn't been any login attempt yet, we can show default/placeholder values but indicate "No attempt".
  const hasAttempted = Boolean(apiUrl || responseStatus || errorMessage);
  
  // Decide color status dot
  let statusColor = 'bg-yellow-500'; // Amber for no attempt / pending
  if (hasAttempted) {
    if (responseStatus.includes('Fallback Active') || responseStatus.startsWith('200') || responseStatus.startsWith('201')) {
      statusColor = 'bg-emerald-500'; // Green for success/fallback
    } else if (responseStatus === 'Pending...') {
      statusColor = 'bg-amber-500 animate-pulse'; // Amber pulse for pending
    } else {
      statusColor = 'bg-rose-500'; // Red for errors
    }
  }

  const currentApiUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || '(not set)';
  const currentEndpoint = endpointCalled || '/auth/demo-login';

  return (
    <div className="w-full max-w-md mx-auto mt-6 rounded-xl border border-border/40 bg-card/65 backdrop-blur-md p-5 shadow-lg text-left text-xs font-mono space-y-3.5 relative overflow-hidden transition-all duration-300">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
          Demo Login Debug Panel
        </span>
        {hasAttempted && (
          <span className="text-[10px] text-muted-foreground italic">
            Last Attempted
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-tight">API URL</span>
          <span className="text-foreground break-all text-[11px] font-semibold">{currentApiUrl}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-tight">Endpoint Called</span>
          <span className="text-foreground break-all text-[11px] font-semibold">{currentEndpoint}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-tight">Response Status</span>
          <span className={`text-[11px] font-semibold ${
            responseStatus.includes('Fallback') || responseStatus.startsWith('200')
              ? 'text-emerald-500'
              : responseStatus === 'Pending...'
              ? 'text-amber-500'
              : hasAttempted
              ? 'text-rose-500'
              : 'text-muted-foreground'
          }`}>
            {responseStatus || 'No attempt registered'}
          </span>
        </div>
        
        {hasAttempted && errorMessage && (
          <div className="pt-1.5 border-t border-border/20">
            <span className="text-rose-400 block text-[10px] uppercase tracking-tight">Error Detail</span>
            <div className="text-rose-400/90 break-words text-[11px] bg-rose-500/10 border border-rose-500/20 rounded p-2 mt-1 max-h-24 overflow-y-auto font-sans leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
