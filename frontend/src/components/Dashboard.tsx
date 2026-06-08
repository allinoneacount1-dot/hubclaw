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
  { id: '6', user_id: 'demo', name: 'UI/UX Designer', description: 'Creates modern design systems, wireframes, and Figma-compatible specs.', model_engine: 'gemini-2.0-pro-exp', temperature: 0.7, max_tokens: 8192, tools_config: { 'Web Search': true }, stars: 17, system_prompt: 'You are a UI/UX designer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '7', user_id: 'demo', name: 'SEO Specialist', description: 'Optimizes content, analyzes keyword trends, and audits website performance.', model_engine: 'gemini-1.5-pro', temperature: 0.5, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 22, system_prompt: 'You are an SEO specialist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '8', user_id: 'demo', name: 'Financial Advisor', description: 'Analyzes market data, creates financial forecasts, and budgeting plans.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 38, system_prompt: 'You are a financial advisor.', created_at: '2026-06-01T00:00:00Z' },
  { id: '9', user_id: 'demo', name: 'Legal Document Reviewer', description: 'Reviews contracts, identifies risks, and summarizes key legal terms.', model_engine: 'gemini-1.5-flash', temperature: 0.1, max_tokens: 8192, tools_config: { 'Web Search': true }, stars: 15, system_prompt: 'You are a legal document reviewer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '10', user_id: 'demo', name: 'Customer Support Bot', description: 'Handles common queries, escalates complex issues, and tracks tickets.', model_engine: 'gemini-2.0-flash', temperature: 0.6, max_tokens: 2048, tools_config: { 'Discord Webhook': true }, stars: 41, system_prompt: 'You are a customer support agent.', created_at: '2026-06-01T00:00:00Z' },
  { id: '11', user_id: 'demo', name: 'Content Creator', description: 'Writes blog posts, articles, and marketing copy with SEO optimization.', model_engine: 'gemini-1.5-pro', temperature: 0.8, max_tokens: 8192, tools_config: { 'Web Search': true }, stars: 29, system_prompt: 'You are a content creator.', created_at: '2026-06-01T00:00:00Z' },
  { id: '12', user_id: 'demo', name: 'Video Script Writer', description: 'Crafts engaging video scripts for YouTube, TikTok, and tutorials.', model_engine: 'gemini-2.0-flash', temperature: 0.7, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 11, system_prompt: 'You are a video script writer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '13', user_id: 'demo', name: 'Product Manager', description: 'Defines product roadmaps, writes user stories, and prioritizes features.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true }, stars: 36, system_prompt: 'You are a product manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '14', user_id: 'demo', name: 'QA Tester', description: 'Creates test plans, finds bugs, and writes detailed bug reports.', model_engine: 'gemini-1.5-flash', temperature: 0.2, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 24, system_prompt: 'You are a QA tester.', created_at: '2026-06-01T00:00:00Z' },
  { id: '15', user_id: 'demo', name: 'Marketing Strategist', description: 'Develops marketing campaigns, analyzes trends, and tracks metrics.', model_engine: 'gemini-2.0-pro-exp', temperature: 0.6, max_tokens: 4096, tools_config: { 'Web Search': true, 'Discord Webhook': true }, stars: 19, system_prompt: 'You are a marketing strategist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '16', user_id: 'demo', name: 'Math Tutor', description: 'Explains math concepts, solves problems, and creates practice exercises.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Python Sandbox': true }, stars: 42, system_prompt: 'You are a math tutor.', created_at: '2026-06-01T00:00:00Z' },
  { id: '17', user_id: 'demo', name: 'Language Translator', description: 'Translates text between 50+ languages with cultural context.', model_engine: 'gemini-2.0-flash', temperature: 0.4, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 14, system_prompt: 'You are a professional translator.', created_at: '2026-06-01T00:00:00Z' },
  { id: '18', user_id: 'demo', name: 'Recipe Creator', description: 'Generates recipes based on ingredients, dietary restrictions, and cuisine.', model_engine: 'gemini-1.5-flash', temperature: 0.7, max_tokens: 2048, tools_config: { 'Web Search': true }, stars: 27, system_prompt: 'You are a professional chef.', created_at: '2026-06-01T00:00:00Z' },
  { id: '19', user_id: 'demo', name: 'Resume Builder', description: 'Creates professional resumes, cover letters, and LinkedIn profiles.', model_engine: 'gemini-1.5-pro', temperature: 0.5, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 31, system_prompt: 'You are a career advisor.', created_at: '2026-06-01T00:00:00Z' },
  { id: '20', user_id: 'demo', name: 'Music Composer', description: 'Writes lyrics, composes melodies, and gives production tips.', model_engine: 'gemini-2.0-flash', temperature: 0.9, max_tokens: 2048, tools_config: {}, stars: 18, system_prompt: 'You are a music composer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '21', user_id: 'demo', name: 'Fitness Coach', description: 'Creates workout plans, gives nutrition advice, and tracks progress.', model_engine: 'gemini-1.5-pro', temperature: 0.5, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 34, system_prompt: 'You are a fitness coach.', created_at: '2026-06-01T00:00:00Z' },
  { id: '22', user_id: 'demo', name: 'Travel Planner', description: 'Plans trips, finds deals, and creates itineraries for destinations.', model_engine: 'gemini-1.5-flash', temperature: 0.6, max_tokens: 8192, tools_config: { 'Web Search': true }, stars: 21, system_prompt: 'You are a travel agent.', created_at: '2026-06-01T00:00:00Z' },
  { id: '23', user_id: 'demo', name: 'Game Designer', description: 'Designs game mechanics, creates storylines, and balances gameplay.', model_engine: 'gemini-2.0-pro-exp', temperature: 0.8, max_tokens: 8192, tools_config: { 'Python Sandbox': true }, stars: 13, system_prompt: 'You are a game designer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '24', user_id: 'demo', name: 'Psychologist', description: 'Listens actively, gives supportive advice, and recommends resources.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 47, system_prompt: 'You are a compassionate psychologist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '25', user_id: 'demo', name: 'Technical Writer', description: 'Writes documentation, API guides, and technical tutorials.', model_engine: 'gemini-1.5-flash', temperature: 0.3, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 26, system_prompt: 'You are a technical writer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '26', user_id: 'demo', name: 'Cryptocurrency Analyst', description: 'Analyzes crypto markets, tracks trends, and explains blockchain concepts.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 39, system_prompt: 'You are a cryptocurrency analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '27', user_id: 'demo', name: 'Interior Designer', description: 'Designs room layouts, color schemes, and furniture recommendations.', model_engine: 'gemini-2.0-flash', temperature: 0.7, max_tokens: 2048, tools_config: { 'Web Search': true }, stars: 10, system_prompt: 'You are an interior designer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '28', user_id: 'demo', name: 'Book Author', description: 'Writes novels, short stories, and outlines plots and characters.', model_engine: 'gemini-1.5-pro', temperature: 0.9, max_tokens: 8192, tools_config: {}, stars: 44, system_prompt: 'You are a book author.', created_at: '2026-06-01T00:00:00Z' },
  { id: '29', user_id: 'demo', name: 'Cybersecurity Expert', description: 'Audits security, finds vulnerabilities, and gives best practices.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 8192, tools_config: { 'Web Search': true, 'GitHub Repo Manager': true }, stars: 32, system_prompt: 'You are a cybersecurity expert.', created_at: '2026-06-01T00:00:00Z' },
  { id: '30', user_id: 'demo', name: 'Podcast Host', description: 'Plans episodes, writes show notes, and suggests interview questions.', model_engine: 'gemini-2.0-flash', temperature: 0.6, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 20, system_prompt: 'You are a podcast host.', created_at: '2026-06-01T00:00:00Z' },
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
