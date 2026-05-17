'use client';

import { useApplications } from '@/hooks/queries/useApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Search, Send, FileText } from 'lucide-react';

const mockTimelineSteps = [
  { label: 'Job Found', icon: Search, status: 'complete', time: '10:30 AM' },
  { label: 'Resume Scored (95%)', icon: FileText, status: 'complete', time: '10:31 AM' },
  { label: 'Approval Received', icon: CheckCircle2, status: 'complete', time: '10:45 AM' },
  { label: 'Submitted Application', icon: Send, status: 'current', time: 'In Progress' },
  { label: 'Awaiting Response', icon: Clock, status: 'pending', time: '--:--' },
];

export default function ApplicationsPage() {
  const { data: apps, isLoading } = useApplications();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Application Tracker</h1>
        <p className="text-muted-foreground mt-2">Real-time status of your auto-applied roles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="glass-card border-none shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))
        ) : apps && apps.length > 0 ? (
          apps.map((app: any, idx: number) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card border-none shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/5">
                  <CardTitle className="text-xl font-bold">{app.company}</CardTitle>
                  <Badge variant={app.status === 'applied' ? 'default' : 'secondary'} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/20">
                    {app.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Vertical Timeline */}
                  <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-muted">
                    {mockTimelineSteps.map((step, index) => {
                      const isComplete = step.status === 'complete';
                      const isCurrent = step.status === 'current';
                      const isPending = step.status === 'pending';

                      return (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Icon */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-colors duration-300
                            ${isComplete ? 'bg-blue-500 text-white' : isCurrent ? 'bg-purple-500 text-white animate-pulse' : 'bg-muted text-muted-foreground'}
                          `}>
                            <step.icon className="w-4 h-4" />
                          </div>
                          
                          {/* Card */}
                          <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm backdrop-blur-sm transition-all duration-300
                            ${isComplete ? 'bg-white/5 border-white/10' : isCurrent ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5 opacity-50'}
                          `}>
                            <div className="flex items-center justify-between mb-1">
                              <div className={`font-bold ${isCurrent ? 'text-purple-400' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                              <div className="text-xs text-muted-foreground font-mono">{step.time}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {isComplete && 'Successfully executed by agent.'}
                              {isCurrent && 'Agent is currently processing this step.'}
                              {isPending && 'Waiting for previous steps to finish.'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No applications found. Try running the auto-apply agent!
          </div>
        )}
      </div>
    </div>
  );
}
