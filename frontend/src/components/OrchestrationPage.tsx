import { motion } from 'framer-motion';
import type { Agent, OrchestrationPipeline } from '../services/api';
import OrchestrationView from './OrchestrationView';
import { ArrowLeft, GitBranch } from 'lucide-react';

interface OrchestrationPageProps {
  agents: Agent[];
  pipelines: OrchestrationPipeline[];
  onCreatePipeline: (name: string) => void;
  onDeletePipeline: (id: string) => void;
  onRunPipeline: (id: string) => void;
  onAddStep: (pipelineId: string, agentId: string, input: string) => void;
  onRemoveStep: (pipelineId: string, stepId: string) => void;
  onBack: () => void;
}

export default function OrchestrationPage({
  agents, pipelines, onCreatePipeline, onDeletePipeline,
  onRunPipeline, onAddStep, onRemoveStep, onBack
}: OrchestrationPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen bg-slate-950"
    >
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-cyan-400" />
            <h2 className="text-sm font-medium text-slate-300">Multi-Agent Orchestration</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">{pipelines.length} pipelines</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <OrchestrationView
          agents={agents}
          pipelines={pipelines}
          onCreatePipeline={onCreatePipeline}
          onDeletePipeline={onDeletePipeline}
          onRunPipeline={onRunPipeline}
          onAddStep={onAddStep}
          onRemoveStep={onRemoveStep}
        />
      </div>
    </motion.div>
  );
}
