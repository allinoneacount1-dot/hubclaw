import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { Agent } from '../services/api';
import AgentCard from './AgentCard';
import { Search, Plus, Activity, Zap } from 'lucide-react';

interface DashboardProps {
  onAgentClick: (agent: Agent) => void;
  onAnalyticsClick: () => void;
}

export default function Dashboard({ onAgentClick, onAnalyticsClick }: DashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data.agents);
    } catch (err) {
      console.error('Failed to load agents:', err);
      // Seed mock agents for demo
      setAgents([
        {
          id: '1', user_id: 'demo', name: 'Data Analyst Agent',
          description: 'Analyzes datasets and generates insights with Python sandbox and web search.',
          model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096,
          tools_config: { 'Web Search': true, 'Python Sandbox': true },
          stars: 12, system_prompt: 'You are a data analyst.', created_at: new Date().toISOString(),
        },
        {
          id: '2', user_id: 'demo', name: 'Code Review Bot',
          description: 'Reviews GitHub PRs with static analysis and security scanning.',
          model_engine: 'gemini-1.5-flash', temperature: 0.1, max_tokens: 8192,
          tools_config: { 'GitHub Repo Manager': true },
          stars: 28, system_prompt: 'You are a code reviewer.', created_at: new Date().toISOString(),
        },
        {
          id: '3', user_id: 'demo', name: 'Social Media Manager',
          description: 'Auto-posts to Twitter, Discord with sentiment analysis.',
          model_engine: 'gemini-2.0-flash', temperature: 0.8, max_tokens: 2048,
          tools_config: { 'Discord Webhook': true, 'Web Search': true },
          stars: 5, system_prompt: 'You are a social media manager.', created_at: new Date().toISOString(),
        },
        {
          id: '4', user_id: 'demo', name: 'Research Assistant',
          description: 'Deep research with multi-source synthesis and citation tracking.',
          model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 8192,
          tools_config: { 'Web Search': true, 'Python Sandbox': true },
          stars: 45, system_prompt: 'You are a research assistant.', created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen bg-slate-950"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1
            className="text-lg font-light tracking-widest text-slate-300 animate-breathe"
          >
            HubClaw
          </motion.h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-64 pl-9 pr-4 py-2 bg-slate-900/30 border border-slate-800/30 rounded-full text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/30 focus:w-72 transition-all duration-300"
              />
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-slate-800/50 border border-slate-800/30 flex items-center justify-center text-xs font-mono text-cyan-400">
              Op
            </div>

            <button
              onClick={() => {
                // Quick create a new agent
                const name = prompt('Agent name:');
                if (name) {
                  api.createAgent({ name, description: 'New agent' }).then((res) => {
                    onAgentClick(res.agent);
                  }).catch(() => {});
                }
              }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 border border-slate-800/30 hover:border-cyan-400/30 rounded-full transition-all duration-300 flex items-center gap-1.5"
            >
              <Plus size={14} />
              Initialize
            </button>
          </div>
        </div>
      </header>

      {/* Global Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          <button className="text-sm text-cyan-400 border-b border-cyan-400/30 pb-0.5">
            Dashboard
          </button>
          <button
            onClick={onAnalyticsClick}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Global Analytics
          </button>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-light text-slate-500 mb-1"
        >
          Welcome back, Operator.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 text-xs font-mono text-slate-600"
        >
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-400" />
            {agents.length} Active
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-cyan-400" />
            4.2k Telemetry
          </span>
        </motion.div>
      </div>

      {/* Agent Registry Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-600 text-sm font-mono">
            Loading agents...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={i}
                onClick={onAgentClick}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
