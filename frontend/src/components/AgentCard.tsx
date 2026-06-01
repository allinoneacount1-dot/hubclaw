import { motion } from 'framer-motion';
import type { Agent } from '../services/api';
import { Sparkles } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  index: number;
}

export default function AgentCard({ agent, onClick, index }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', mass: 0.5, damping: 18 }}
      onClick={() => onClick(agent)}
      className="group relative cursor-pointer rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/50"
      style={{ willChange: 'transform' }}
      whileHover={{ y: -2 }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-slate-800/50 flex items-center justify-center text-cyan-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {agent.model_engine || 'gemini-1.5-flash'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>★</span>
            <span>{agent.stars || 0}</span>
          </div>
        </div>

        {agent.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {agent.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span>temp: {agent.temperature ?? 0.7}</span>
          <span>tokens: {agent.max_tokens ?? 2048}</span>
        </div>

        {/* Tools indicators */}
        {agent.tools_config && Object.keys(agent.tools_config).length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {Object.entries(agent.tools_config)
              .filter(([, v]) => v)
              .map(([k]) => (
                <span
                  key={k}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 border border-slate-800/30"
                >
                  {k.replace(/_/g, ' ')}
                </span>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
