import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TokenBudget } from '../services/api';
import { Shield, AlertTriangle, TrendingUp, Settings2 } from 'lucide-react';

interface SafetyGuardrailsProps {
  budget: TokenBudget;
  onUpdateBudget: (budget: Partial<TokenBudget>) => void;
  className?: string;
}

export default function SafetyGuardrails({ budget, onUpdateBudget, className }: SafetyGuardrailsProps) {
  const [editing, setEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(String(budget.dailyLimit));

  const usagePercent = budget.dailyLimit > 0 ? Math.min((budget.used / budget.dailyLimit) * 100, 100) : 0;
  const remaining = Math.max(budget.dailyLimit - budget.used, 0);
  const isWarning = usagePercent >= 70;
  const isCritical = usagePercent >= 90;

  const handleSave = () => {
    const limit = parseInt(newLimit);
    if (limit > 0) {
      onUpdateBudget({ dailyLimit: limit });
    }
    setEditing(false);
  };

  return (
    <div className={`rounded-lg border ${isCritical ? 'border-red-400/30 bg-red-400/5' : isWarning ? 'border-amber-400/30 bg-amber-400/5' : 'border-slate-800/30 bg-slate-900/30'} backdrop-blur-md p-4 ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield size={14} className={isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'} />
          <h3 className="text-xs font-medium text-slate-300">Token Budget Guard</h3>
          {isCritical && <AlertTriangle size={12} className="text-red-400 animate-pulse" />}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-cyan-400 transition-all"
        >
          <Settings2 size={12} />
        </button>
      </div>

      {editing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-3"
        >
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            className="w-24 bg-slate-900/50 border border-slate-800/30 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400/30"
          />
          <span className="text-[10px] font-mono text-slate-500">tokens/day</span>
          <button onClick={handleSave} className="px-2 py-1 text-[10px] bg-cyan-400/15 text-cyan-400 rounded border border-cyan-400/20 hover:bg-cyan-400/25 transition-all">Save</button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
        </motion.div>
      ) : null}

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono text-slate-500">Daily Usage</span>
          <span className={`text-[10px] font-mono ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-400'}`}>
            {budget.used.toLocaleString()} / {budget.dailyLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usagePercent}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className={`h-full rounded-full ${
              isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <TrendingUp size={10} />
          {usagePercent.toFixed(1)}% used
        </span>
        <span className={remaining < 1000 ? 'text-amber-400' : ''}>
          {remaining.toLocaleString()} remaining
        </span>
      </div>

      {isCritical && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-[10px] font-mono text-red-400/70 flex items-center gap-1"
        >
          <AlertTriangle size={10} />
          Budget nearly exhausted. Agent execution may be throttled.
        </motion.p>
      )}
    </div>
  );
}
