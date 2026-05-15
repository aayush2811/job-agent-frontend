'use client';

import { useEffect, useState } from 'react';
import { useTelegramApprovals } from '@/hooks/queries/useTelegram';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Smartphone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegramPage() {
  const { data: approvals, isLoading, error } = useTelegramApprovals();
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    if (approvals) {
      // Load initial approvals into local queue state so we can pop them off
      setQueue(approvals);
    }
  }, [approvals]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    // In real app, call mutation here
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Telegram Approval Center</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Review the AI agent's auto-apply requests in real-time. Approving a job will immediately trigger the Puppeteer auto-apply sequence.
        </p>
      </div>

      <div className="relative min-h-[400px] flex items-center justify-center">
        {isLoading ? (
          <Card className="glass-card border-none shadow-xl w-full max-w-md absolute z-10">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full mt-4" />
            </CardContent>
            <CardFooter className="gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardFooter>
          </Card>
        ) : queue.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {queue.map((item, index) => {
              const isFront = index === 0;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ 
                    scale: isFront ? 1 : 0.95 - (index * 0.05), 
                    opacity: isFront ? 1 : 0.5 - (index * 0.2),
                    y: index * 20,
                    zIndex: queue.length - index
                  }}
                  exit={{ scale: 0.8, opacity: 0, x: item._lastAction === 'approve' ? 200 : -200, rotate: item._lastAction === 'approve' ? 15 : -15 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute w-full max-w-md"
                >
                  <Card className={`glass-card border-none shadow-2xl transition-all duration-300 ${isFront ? 'ring-1 ring-white/10' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold">{item.action}</CardTitle>
                          <div className="text-sm text-blue-400 mt-1 flex items-center font-medium">
                            Score: 95% Match <ArrowRight className="w-3 h-3 mx-1" /> Highly Recommended
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-black/20 rounded-lg space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Salary Range</span>
                          <span className="font-medium text-green-400">$120k - $150k</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium">Remote (US)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Requested</span>
                          <span className="font-medium">{new Date(item.date).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        "Your resume matches 9/10 required skills. The AI agent has drafted a highly customized cover letter and is ready to submit."
                      </p>
                    </CardContent>
                    <CardFooter className="gap-3 pt-2">
                      <Button 
                        size="lg"
                        className="w-full border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" 
                        variant="outline"
                        onClick={() => {
                          item._lastAction = 'reject';
                          handleAction(item.id, 'reject');
                        }}
                      >
                        <X className="w-5 h-5 mr-2" /> Reject
                      </Button>
                      <Button 
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20" 
                        onClick={() => {
                          item._lastAction = 'approve';
                          handleAction(item.id, 'approve');
                        }}
                      >
                        <Check className="w-5 h-5 mr-2" /> Approve
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 glass-card rounded-2xl border border-white/5 w-full max-w-md"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground">
              The AI agent is currently searching for more roles. New approvals will appear here in real-time.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
