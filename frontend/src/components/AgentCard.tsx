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
      className="group relative cursor-pointer rounded-lg border backdrop-blur-md p-5 transition-all duration-300"
      style={{ 
        willChange: 'transform',
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--border-color)'
      }}
      whileHover={{ y: -2 }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--accent)'
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h3 
                className="text-sm font-medium transition-colors"
                style={{ 
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                {agent.name}
              </h3>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {agent.model_engine || 'gemini-1.5-flash'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>★</span>
            <span>{agent.stars || 0}</span>
          </div>
        </div>

        {agent.description && (
          <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
            {agent.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
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
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
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
