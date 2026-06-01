import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TaskQueueItem } from '../services/api';
import {
  ListOrdered, Trash2, Clock,
  CheckCircle, XCircle, Loader2, ArrowUp, ArrowRight, ArrowDown
} from 'lucide-react';

interface TaskQueueProps {
  tasks: TaskQueueItem[];
  onAddTask: (prompt: string, priority: 'urgent' | 'normal' | 'low') => void;
  onRemoveTask: (id: string) => void;
  compact?: boolean;
}

const priorityConfig = {
  urgent: { icon: ArrowUp, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Urgent' },
  normal: { icon: ArrowRight, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', label: 'Normal' },
  low: { icon: ArrowDown, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', label: 'Low' },
};

const statusConfig = {
  queued: { icon: Clock, color: 'text-slate-400' },
  running: { icon: Loader2, color: 'text-cyan-400' },
  completed: { icon: CheckCircle, color: 'text-emerald-400' },
  failed: { icon: XCircle, color: 'text-red-400' },
};

export default function TaskQueue({ tasks, onAddTask, onRemoveTask, compact }: TaskQueueProps) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [showCompleted, setShowCompleted] = useState(!compact);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddTask(input.trim(), priority);
    setInput('');
  };

  const filteredTasks = showCompleted ? tasks : tasks.filter(t => t.status !== 'completed' && t.status !== 'failed');
  const queuedCount = tasks.filter(t => t.status === 'queued').length;
  const runningCount = tasks.filter(t => t.status === 'running').length;

  return (
    <div className="space-y-3">
      {/* Add Task Input */}
      {!compact && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add task to queue..."
              className="flex-1 bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/30 font-mono"
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="px-3 py-2 text-sm bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-md hover:bg-cyan-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Queue
            </button>
          </div>
          <div className="flex gap-1.5">
            {(['urgent', 'normal', 'low'] as const).map((p) => {
              const cfg = priorityConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-full transition-all flex items-center gap-1 ${
                    priority === p
                      ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                      : 'bg-slate-900/30 text-slate-600 border border-slate-800/30 hover:text-slate-400'
                  }`}
                >
                  <cfg.icon size={10} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Queue Stats */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
          <span className="flex items-center gap-1"><ListOrdered size={10} />{tasks.length} total</span>
          {runningCount > 0 && <span className="flex items-center gap-1 text-cyan-400"><Loader2 size={10} className="animate-spin" />{runningCount} running</span>}
          {queuedCount > 0 && <span className="flex items-center gap-1 text-slate-400"><Clock size={10} />{queuedCount} queued</span>}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="ml-auto text-slate-600 hover:text-slate-400 transition-colors"
          >
            {showCompleted ? 'Hide' : 'Show'} completed
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-1.5 max-h-[compact ? 200px : 400px] overflow-y-auto">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-4 text-slate-600 text-xs font-mono">
              {compact ? 'No tasks in queue' : 'Queue is empty'}
            </div>
          ) : (
            filteredTasks.map((task, i) => {
              const pCfg = priorityConfig[task.priority];
              const sCfg = statusConfig[task.status];
              const StatusIcon = sCfg.icon;
              const PriorityIcon = pCfg.icon;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                    task.status === 'completed'
                      ? 'bg-slate-900/20 border-slate-800/20'
                      : task.status === 'failed'
                      ? 'bg-red-400/5 border-red-400/10'
                      : 'bg-slate-900/30 border-slate-800/30'
                  }`}
                >
                  <StatusIcon size={12} className={`${sCfg.color} shrink-0 ${task.status === 'running' ? 'animate-spin' : ''}`} />
                  <span className={`flex-1 text-xs font-mono truncate ${task.status === 'completed' ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                    {task.prompt}
                  </span>
                  <PriorityIcon size={10} className={`${pCfg.color} shrink-0`} />
                  {compact && (
                    <button
                      onClick={() => onRemoveTask(task.id)}
                      className="p-0.5 rounded hover:bg-slate-800/50 text-slate-600 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
