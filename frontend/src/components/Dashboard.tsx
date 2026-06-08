import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { Agent } from '../services/api';
import AgentCard from './AgentCard';
import CreateAgentModal from './CreateAgentModal';
import { Search, Plus, Activity, Zap, Star, GitFork, Home } from 'lucide-react';
import { useAppStore } from '../store';
import { DashboardSkeleton } from './Skeleton';
import Breadcrumb from './Breadcrumb';
import { pageTransition } from '../utils/transitions';
import { WalletButton } from './WalletButton';

const MOCK_AGENTS: Agent[] = [
  { id: '1', user_id: 'demo', name: 'Data Analyst Agent', description: 'Analyzes datasets and generates insights with Python sandbox and web search.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 12, system_prompt: 'You are a data analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '2', user_id: 'demo', name: 'Code Review Bot', description: 'Reviews GitHub PRs with static analysis and security scanning.', model_engine: 'gemini-1.5-flash', temperature: 0.1, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 28, system_prompt: 'You are a code reviewer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '3', user_id: 'demo', name: 'Social Media Manager', description: 'Auto-posts to Twitter, Discord with sentiment analysis.', model_engine: 'gemini-2.0-flash', temperature: 0.8, max_tokens: 2048, tools_config: { 'Discord Webhook': true, 'Web Search': true }, stars: 5, system_prompt: 'You are a social media manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '4', user_id: 'demo', name: 'Research Assistant', description: 'Deep research with multi-source synthesis and citation tracking.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 8192, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 45, system_prompt: 'You are a research assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '5', user_id: 'demo', name: 'DevOps Sentinel', description: 'Monitors CI/CD pipelines, auto-rolls back failed deploys.', model_engine: 'gemini-1.5-pro', temperature: 0.2, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true, 'Discord Webhook': true }, stars: 33, system_prompt: 'You are a DevOps engineer.', created_at: '2026-06-01T00:00:00Z' },
];

interface DashboardProps {
  onAgentClick: (agent: Agent) => void;
  onAnalyticsClick: () => void;
  onPromptsClick: () => void;
  onOrchestrationClick: () => void;
  onGoToLanding: () => void;
  onDocumentationClick: () => void;
}

export default function Dashboard({ onAgentClick, onAnalyticsClick, onPromptsClick, onOrchestrationClick, onGoToLanding, onDocumentationClick }: DashboardProps) {
  const { agents, setAgents, addAgent, addToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      const combinedAgents = data.agents.length > 0 ? data.agents : MOCK_AGENTS;
      setAgents(combinedAgents);
    } catch (err) {
      console.error('Failed to load agents:', err);
      if (agents.length === 0) {
        setAgents(MOCK_AGENTS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (data: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'stars'>) => {
    try {
      const res = await api.createAgent(data);
      addAgent(res.agent);
      addToast('success', 'Agent created successfully!');
    } catch (err) {
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        user_id: 'local',
        ...data,
        created_at: new Date().toISOString(),
        stars: 0
      };
      addAgent(newAgent);
      addToast('success', 'Agent created locally!');
    }
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
          borderBottomColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hubclaw.svg" alt="HubClaw" className="h-10 w-10 rounded-lg object-contain" style={{ filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))' }} />
            <motion.h1
              className="text-lg font-light tracking-widest animate-breathe"
              style={{ color: 'var(--text-secondary)' }}
            >
              HubClaw
            </motion.h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLanding}
              className="p-2 border rounded-full transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
              title="Back to Landing Page"
              aria-label="Back to Landing Page"
            >
              <Home size={16} />
            </button>
            <a
              href="https://pump.fun/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border rounded-full transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
              title="Go to pump.fun"
              aria-label="Go to pump.fun"
            >
              {/* Exact pump.fun capsule pill logo */}
              <svg width="16" height="16" viewBox="0 0 512 512" fill="none">
                <path d="M160 256C160 198.5 206.5 152 264 152C321.5 152 368 198.5 368 256C368 313.5 321.5 360 264 360C206.5 360 160 313.5 160 256Z" fill="#132E27"/>
                <path d="M192 192L264 264L336 192L264 336L192 192Z" fill="#56C58A"/>
                <path d="M192 336L264 264L336 336L264 336L192 336Z" fill="#44A077"/>
                <path d="M196 220C206 210 224 210 234 220C244 230 234 248 219 248C206 248 196 230 196 220Z" fill="white"/>
                <path d="M216 280C228 272 238 280 233 292C228 304 208 300 216 280Z" fill="white"/>
                <path d="M198 264C202 260 210 260 214 264C218 268 212 276 204 276C195 276 194 268 198 264Z" fill="white"/>
              </svg>
            </a>
            <WalletButton />
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-64 pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:w-72 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                aria-label="Search agents"
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm border rounded-full transition-all duration-300 flex items-center gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
              aria-label="Initialize new agent"
            >
              <Plus size={14} />
              Initialize
            </button>
          </div>
        </div>
      </header>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAgent}
      />

      {/* Global Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <div className="flex items-center gap-6 mt-4">
          <button
            className="text-sm pb-0.5 border-b"
            style={{
              color: 'var(--accent)',
              borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={onAnalyticsClick}
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            Global Analytics
          </button>
          <button
            onClick={onPromptsClick}
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            Prompt Library
          </button>
          <button
            onClick={onOrchestrationClick}
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            Orchestration
          </button>
          <button
            onClick={onDocumentationClick}
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            Documentation
          </button>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-light mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Welcome back, Operator.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 text-xs font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-1.5">
            <Activity size={12} style={{ color: 'var(--accent)' }} />
            30 Active
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} style={{ color: 'var(--accent)' }} />
            4.2k Telemetry
          </span>
          <span className="flex items-center gap-1.5">
            <Star size={12} style={{ color: 'color-mix(in srgb, orange 50%, var(--text-muted))' }} />
            123 Stars
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork size={12} style={{ color: 'var(--text-muted)' }} />
            5 Models
          </span>
        </motion.div>
      </div>

      {/* Agent Registry Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
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
      </div>
    </motion.div>
  );
}
