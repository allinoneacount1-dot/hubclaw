import { motion } from 'framer-motion';
import type { Agent, OrchestrationPipeline } from '../services/api';
import OrchestrationView from './OrchestrationView';
import { ArrowLeft, GitBranch } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { pageTransition } from '../utils/transitions';

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
      {...pageTransition}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="sticky top-0 z-20 backdrop-blur-md border-b" style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
        borderColor: 'var(--border-color)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }} aria-label="Back to Dashboard">
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <GitBranch size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Multi-Agent Orchestration</h2>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{pipelines.length} pipelines</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', onClick: onBack }, { label: 'Orchestration' }]} />
        <div className="mt-6">
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
      </div>
    </motion.div>
  );
}
