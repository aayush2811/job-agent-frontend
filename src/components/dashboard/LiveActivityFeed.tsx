'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageCircle, Briefcase, FileText, AlertCircle, XCircle } from 'lucide-react';

type ActivityType = 'job_found' | 'auto_applied' | 'whatsapp_sent' | 'approval_pending' | 'failed';

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
}

const getIcon = (type: ActivityType) => {
  switch (type) {
    case 'job_found': return <Briefcase className="w-4 h-4 text-blue-500" />;
    case 'auto_applied': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'whatsapp_sent': return <MessageCircle className="w-4 h-4 text-green-400" />;
    case 'approval_pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
  }
};

const getBgColor = (type: ActivityType) => {
  switch (type) {
    case 'job_found': return 'bg-blue-500/10 border-blue-500/20';
    case 'auto_applied': return 'bg-green-500/10 border-green-500/20';
    case 'whatsapp_sent': return 'bg-green-400/10 border-green-400/20';
    case 'approval_pending': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'failed': return 'bg-red-500/10 border-red-500/20';
  }
};

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Simulation Loop
  useEffect(() => {
    let idCounter = 0;
    const types: ActivityType[] = ['job_found', 'auto_applied', 'whatsapp_sent', 'approval_pending', 'failed'];
    const messages = [
      'Found new matching role at Google',
      'Successfully submitted application to Meta',
      'Sent outreach message to recruiter',
      'Waiting for Telegram approval for Stripe',
      'Application failed: Captcha required'
    ];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * types.length);
      const newActivity: Activity = {
        id: `act-${idCounter++}`,
        type: types[idx],
        message: messages[idx],
        timestamp: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 10)); // Keep only last 10
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card border-none h-full flex flex-col shadow-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Live Activity</CardTitle>
        <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-ping" />
          Live
        </span>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden relative">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {activities.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground mt-8"
              >
                Waiting for agent activity...
              </motion.div>
            )}
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor(activity.type)} backdrop-blur-sm shadow-sm`}
              >
                <div className="mt-0.5">{getIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </CardContent>
    </Card>
  );
}
