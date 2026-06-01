import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../services/api';
import type { OrchestrationPipeline } from '../services/api';
import {
  GitBranch, Play, Plus, Trash2, CheckCircle,
  Loader2, XCircle, ArrowRight
} from 'lucide-react';

interface OrchestrationViewProps {
  agents: Agent[];
  pipelines: OrchestrationPipeline[];
  onCreatePipeline: (name: string) => void;
  onDeletePipeline: (id: string) => void;
  onRunPipeline: (id: string) => void;
  onAddStep: (pipelineId: string, agentId: string, input: string) => void;
  onRemoveStep: (pipelineId: string, stepId: string) => void;
  compact?: boolean;
}

const statusIcons = {
  pending: ArrowRight,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-slate-500',
  running: 'text-cyan-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
};

export default function OrchestrationView({
  agents, pipelines, onCreatePipeline, onDeletePipeline,
  onRunPipeline, onAddStep, onRemoveStep, compact
}: OrchestrationViewProps) {
  const [newPipelineName, setNewPipelineName] = useState('');
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState<string | null>(null);
  const [stepInput, setStepInput] = useState('');
  const [stepAgentId, setStepAgentId] = useState('');

  const handleCreate = () => {
    if (!newPipelineName.trim()) return;
    onCreatePipeline(newPipelineName.trim());
    setNewPipelineName('');
  };

  const handleAddStep = (pipelineId: string) => {
    if (!stepAgentId || !stepInput.trim()) return;
    onAddStep(pipelineId, stepAgentId, stepInput.trim());
    setStepInput('');
    setStepAgentId('');
    setAddingStep(null);
  };

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newPipelineName}
            onChange={(e) => setNewPipelineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New pipeline name..."
            className="flex-1 bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/30 font-mono"
          />
          <button
            onClick={handleCreate}
            disabled={!newPipelineName.trim()}
            className="px-3 py-2 text-sm bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-md hover:bg-cyan-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {pipelines.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-xs font-mono">
              <GitBranch size={24} className="mx-auto mb-2 text-slate-700" />
              No pipelines. Create one to chain multiple agents.
            </div>
          ) : (
            pipelines.map((pipeline) => {
              const isExpanded = expandedPipeline === pipeline.id;
              const completedSteps = pipeline.steps.filter(s => s.status === 'completed').length;
              const totalSteps = pipeline.steps.length;

              return (
                <motion.div
                  key={pipeline.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/20 transition-colors"
                    onClick={() => setExpandedPipeline(isExpanded ? null : pipeline.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch size={14} className="text-cyan-400" />
                      <span className="text-sm font-medium text-slate-200">{pipeline.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {completedSteps}/{totalSteps} steps
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pipeline.status === 'running' && <Loader2 size={12} className="text-cyan-400 animate-spin" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); onRunPipeline(pipeline.id); }}
                        disabled={pipeline.status === 'running' || pipeline.steps.length === 0}
                        className="p-1.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Play size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeletePipeline(pipeline.id); }}
                        className="p-1.5 rounded hover:bg-slate-800/50 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800/20"
                      >
                        <div className="p-4 space-y-2">
                          {pipeline.steps.map((step, i) => {
                            const StatusIcon = statusIcons[step.status];
                            return (
                              <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                                  step.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                                  step.status === 'running' ? 'bg-cyan-400/10 text-cyan-400' :
                                  step.status === 'failed' ? 'bg-red-400/10 text-red-400' :
                                  'bg-slate-800/30 text-slate-500'
                                }`}>
                                  {i + 1}
                                </div>

                                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900/30 border border-slate-800/20">
                                  <StatusIcon size={12} className={`${statusColors[step.status]} ${step.status === 'running' ? 'animate-spin' : ''}`} />
                                  <span className="text-xs font-mono text-slate-400 flex-1 truncate">{step.agentName}</span>
                                  <span className="text-[10px] font-mono text-slate-600 truncate max-w-[120px]">{step.input}</span>
                                  <button
                                    onClick={() => onRemoveStep(pipeline.id, step.id)}
                                    className="p-0.5 rounded hover:bg-slate-800/50 text-slate-600 hover:text-red-400 transition-all shrink-0"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}

                          {addingStep === pipeline.id ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2 pl-9"
                            >
                              <select
                                value={stepAgentId}
                                onChange={(e) => setStepAgentId(e.target.value)}
                                className="bg-slate-900/50 border border-slate-800/30 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                              >
                                <option value="">Select agent...</option>
                                {agents.map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={stepInput}
                                onChange={(e) => setStepInput(e.target.value)}
                                placeholder="Step input..."
                                className="flex-1 bg-slate-900/50 border border-slate-800/30 rounded px-2 py-1.5 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddStep(pipeline.id)}
                                className="px-2 py-1.5 text-[10px] bg-cyan-400/15 text-cyan-400 rounded border border-cyan-400/20 hover:bg-cyan-400/25 transition-all"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setAddingStep(null)}
                                className="px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => setAddingStep(pipeline.id)}
                              className="flex items-center gap-1 pl-9 text-[10px] font-mono text-slate-600 hover:text-cyan-400 transition-colors"
                            >
                              <Plus size={10} />
                              Add step
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
