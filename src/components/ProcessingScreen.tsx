'use client';

import { motion } from 'framer-motion';
import { ProcessingState } from '@/types';
import { Brain, Search, Globe, Mail, Target, CheckCircle, Circle } from 'lucide-react';

interface ProcessingScreenProps {
  state: ProcessingState;
}

const agentIcons = {
  'Business Finder': Search,
  'Website Scraper': Globe,
  'Email Finder': Mail,
  'Lead Enrichment': Brain,
  'Lead Scoring': Target,
};

export function ProcessingScreen({ state }: ProcessingScreenProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'running':
        return Circle;
      default:
        return Circle;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 gradient-bg rounded-full flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">AI Agents Working</h1>
          <p className="text-xl text-gray-300">
            Our AI agents are finding and enriching your leads
          </p>
        </div>

        {/* Progress Overview */}
        <div className="glass-intense p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Processing Progress</h3>
              <p className="text-gray-400">
                {state.processedLeads} of {state.totalLeads} leads processed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold gradient-text">
                {Math.round((state.currentAgent / state.agents.length) * 100)}%
              </div>
              <p className="text-gray-400">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(state.currentAgent / state.agents.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full gradient-bg rounded-full"
            />
          </div>

          {/* Agent Pipeline */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Agent Pipeline</h4>
            {state.agents.map((agent, index) => {
              const Icon = agentIcons[agent.name as keyof typeof agentIcons] ?? Search;
              const StatusIcon = getStatusIcon(agent.status);
              
              return (
                <motion.div
                  key={agent.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    agent.status === 'completed' ? 'bg-green-500/20' : 
                    agent.status === 'running' ? 'bg-blue-500/20' : 'bg-gray-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${getStatusColor(agent.status)}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{agent.name}</h5>
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(agent.status)}`} />
                    </div>
                    <p className="text-sm text-gray-400">
                      {agent.status === 'completed' ? 'Completed successfully' :
                       agent.status === 'running' ? 'Processing...' : 'Waiting to start'}
                    </p>
                  </div>
                  
                  <div className="w-24">
                    {agent.status === 'running' && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-blue-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-400">{agent.progress}%</span>
                      </div>
                    )}
                    {agent.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-400 ml-auto" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 text-center"
          >
            <div className="text-3xl font-bold gradient-text mb-2">{state.totalLeads}</div>
            <div className="text-gray-400">Total Leads Found</div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 text-center"
          >
            <div className="text-3xl font-bold gradient-text mb-2">{state.processedLeads}</div>
            <div className="text-gray-400">Leads Enriched</div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 text-center"
          >
            <div className="text-3xl font-bold gradient-text mb-2">
              {Math.round((state.processedLeads / Math.max(state.totalLeads, 1)) * 100)}%
            </div>
            <div className="text-gray-400">Completion Rate</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}