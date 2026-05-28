'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BrainCircuit, CheckSquare, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipelineStats } from '@/hooks/queries/useAnalytics';
import { useSocket } from '@/hooks/useSocket';

const nodes = [
  { id: 'found', label: 'Found', icon: Search, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 'scored', label: 'Scored', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-500' },
  { id: 'approval', label: 'Approval', icon: CheckSquare, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { id: 'applying', label: 'Applying', icon: Send, color: 'text-orange-500', bg: 'bg-orange-500' },
  { id: 'applied', label: 'Applied', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500' },
];

export function JobPipelineVisualization() {
  const { data: pipelineData, refetch } = usePipelineStats();
  const { socket } = useSocket();
  const [activeNode, setActiveNode] = useState(0);

  // Invalidate stats and shift active visual node on live events
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (nodeIndex: number) => {
      setActiveNode(nodeIndex);
      refetch();
    };

    socket.on('job-created', () => handleUpdate(0));
    socket.on('job-scored', () => handleUpdate(1));
    socket.on('approval-pending', () => handleUpdate(2));
    socket.on('application-start', () => handleUpdate(3));
    socket.on('job-applied', () => handleUpdate(4));
    socket.on('dashboard-update', () => refetch());
    socket.on('job-matched', () => refetch());
    socket.on('match-updated', () => refetch());

    return () => {
      socket.off('job-created');
      socket.off('job-scored');
      socket.off('approval-pending');
      socket.off('application-start');
      socket.off('job-applied');
      socket.off('dashboard-update');
      socket.off('job-matched');
      socket.off('match-updated');
    };
  }, [socket, refetch]);

  const p = pipelineData || {
    found: 0,
    scored: 0,
    approvalPending: 0,
    applying: 0,
    applied: 0,
  };
  const counters = [
    p.found ?? 0,
    p.scored ?? 0,
    p.approvalPending ?? 0,
    p.applying ?? 0,
    p.applied ?? 0,
  ];

  return (
    <Card className="glass-card border-none shadow-lg overflow-hidden relative glow-border">
      <div className="absolute inset-0 terminal-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px ai-scan-line opacity-50" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-lg flex items-center gap-2">
          Realtime Pipeline
          <span className="text-xs font-normal text-primary animate-pulse">LIVE</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex justify-between items-center px-4 py-8">
          {/* Connecting Line */}
          <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 -translate-y-1/2 bg-muted-foreground/20">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(activeNode / (nodes.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {nodes.map((node, i) => {
            const isActive = i <= activeNode;
            const isCurrent = i === activeNode;
            
            return (
              <div key={node.id} className="relative z-10 flex flex-col items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: isCurrent ? 1.2 : 1,
                    boxShadow: isCurrent ? `0 0 20px var(--${node.bg.split('-')[1]})` : 'none'
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                    isActive ? `${node.bg}/20 ${node.color} border-${node.bg.split('-')[1]}-500/50` : 'bg-background border-muted text-muted-foreground'
                  }`}
                >
                  <node.icon className="w-5 h-5" />
                  {isCurrent && (
                    <motion.div 
                      className={`absolute -inset-2 rounded-full border border-${node.bg.split('-')[1]}-500/30`}
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <div className="text-center">
                  <div className={`text-sm font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {node.label}
                  </div>
                  <motion.div 
                    key={counters[i]}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xs font-medium text-muted-foreground mt-0.5"
                  >
                    {counters[i].toLocaleString()}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
