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

const MOCK_AGENTS: Agent[] = [
  { id: '1', user_id: 'demo', name: 'Data Analyst Agent', description: 'Analyzes datasets and generates insights with Python sandbox and web search.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 12, system_prompt: 'You are a data analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '2', user_id: 'demo', name: 'Code Review Bot', description: 'Reviews GitHub PRs with static analysis and security scanning.', model_engine: 'gemini-1.5-flash', temperature: 0.1, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 28, system_prompt: 'You are a code reviewer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '3', user_id: 'demo', name: 'Social Media Manager', description: 'Auto-posts to Twitter, Discord with sentiment analysis.', model_engine: 'gemini-2.0-flash', temperature: 0.8, max_tokens: 2048, tools_config: { 'Discord Webhook': true, 'Web Search': true }, stars: 5, system_prompt: 'You are a social media manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '4', user_id: 'demo', name: 'Research Assistant', description: 'Deep research with multi-source synthesis and citation tracking.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 8192, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 45, system_prompt: 'You are a research assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '5', user_id: 'demo', name: 'DevOps Sentinel', description: 'Monitors CI/CD pipelines, auto-rolls back failed deploys.', model_engine: 'gemini-1.5-pro', temperature: 0.2, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true, 'Discord Webhook': true }, stars: 33, system_prompt: 'You are a DevOps engineer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '6', user_id: 'demo', name: 'Legal Document Parser', description: 'Extracts clauses, risks, and obligations from legal contracts.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 8192, tools_config: { 'Web Search': true }, stars: 19, system_prompt: 'You are a legal analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '7', user_id: 'demo', name: 'Crypto Market Scout', description: 'Tracks on-chain data, whale movements, and DeFi yield opportunities.', model_engine: 'gemini-2.0-flash', temperature: 0.5, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 67, system_prompt: 'You are a crypto analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '8', user_id: 'demo', name: 'Email Triage Engine', description: 'Auto-categorizes, prioritizes, and drafts responses for inbound emails.', model_engine: 'gemini-1.5-flash', temperature: 0.3, max_tokens: 2048, tools_config: { 'Discord Webhook': true }, stars: 22, system_prompt: 'You are an email assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '9', user_id: 'demo', name: 'SQL Query Generator', description: 'Converts natural language to optimized SQL queries with schema awareness.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 4096, tools_config: { 'Python Sandbox': true }, stars: 41, system_prompt: 'You are a database expert.', created_at: '2026-06-01T00:00:00Z' },
  { id: '10', user_id: 'demo', name: 'Image Caption Pro', description: 'Generates SEO-optimized alt text and captions for image libraries.', model_engine: 'gemini-1.5-flash', temperature: 0.6, max_tokens: 1024, tools_config: {}, stars: 8, system_prompt: 'You are a content writer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '11', user_id: 'demo', name: 'API Test Runner', description: 'Auto-generates and executes API test suites with edge case coverage.', model_engine: 'gemini-1.5-pro', temperature: 0.2, max_tokens: 8192, tools_config: { 'Python Sandbox': true, 'GitHub Repo Manager': true }, stars: 36, system_prompt: 'You are a QA engineer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '12', user_id: 'demo', name: 'Churn Predictor', description: 'Analyzes user behavior patterns to predict and prevent customer churn.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Python Sandbox': true, 'Web Search': true }, stars: 29, system_prompt: 'You are a data scientist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '13', user_id: 'demo', name: 'Documentation Writer', description: 'Auto-generates README, API docs, and changelogs from code analysis.', model_engine: 'gemini-1.5-flash', temperature: 0.4, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 53, system_prompt: 'You are a technical writer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '14', user_id: 'demo', name: 'Sentiment Analyzer', description: 'Real-time sentiment tracking across social media and reviews.', model_engine: 'gemini-2.0-flash', temperature: 0.5, max_tokens: 2048, tools_config: { 'Web Search': true, 'Discord Webhook': true }, stars: 17, system_prompt: 'You are a sentiment analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '15', user_id: 'demo', name: 'Invoice Processor', description: 'Extracts line items, validates totals, and categorizes expenses from invoices.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 4096, tools_config: { 'Python Sandbox': true }, stars: 14, system_prompt: 'You are an accounting assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '16', user_id: 'demo', name: 'Talent Sourcer', description: 'Scans GitHub, LinkedIn for candidates matching role requirements.', model_engine: 'gemini-1.5-flash', temperature: 0.4, max_tokens: 4096, tools_config: { 'Web Search': true }, stars: 31, system_prompt: 'You are a recruiter.', created_at: '2026-06-01T00:00:00Z' },
  { id: '17', user_id: 'demo', name: 'Security Auditor', description: 'Scans codebases for OWASP vulnerabilities and suggests fixes.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true, 'Python Sandbox': true }, stars: 72, system_prompt: 'You are a security expert.', created_at: '2026-06-01T00:00:00Z' },
  { id: '18', user_id: 'demo', name: 'Meeting Summarizer', description: 'Transcribes and summarizes action items from meeting recordings.', model_engine: 'gemini-1.5-flash', temperature: 0.3, max_tokens: 4096, tools_config: { 'Discord Webhook': true }, stars: 25, system_prompt: 'You are a meeting assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '19', user_id: 'demo', name: 'Price Monitor', description: 'Tracks competitor prices and alerts on significant market shifts.', model_engine: 'gemini-2.0-flash', temperature: 0.3, max_tokens: 2048, tools_config: { 'Web Search': true, 'Discord Webhook': true }, stars: 11, system_prompt: 'You are a market analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '20', user_id: 'demo', name: 'Onboarding Guide', description: 'Interactive walkthrough generator for new team members.', model_engine: 'gemini-1.5-flash', temperature: 0.5, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true }, stars: 9, system_prompt: 'You are an onboarding specialist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '21', user_id: 'demo', name: 'Log Anomaly Detector', description: 'Identifies patterns and anomalies in application logs in real-time.', model_engine: 'gemini-1.5-pro', temperature: 0.2, max_tokens: 4096, tools_config: { 'Python Sandbox': true }, stars: 38, system_prompt: 'You are a site reliability engineer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '22', user_id: 'demo', name: 'Content Calendar Planner', description: 'Generates optimized posting schedules based on audience analytics.', model_engine: 'gemini-2.0-flash', temperature: 0.6, max_tokens: 2048, tools_config: { 'Web Search': true }, stars: 16, system_prompt: 'You are a content strategist.', created_at: '2026-06-01T00:00:00Z' },
  { id: '23', user_id: 'demo', name: 'Dependency Updater', description: 'Checks for outdated deps, tests compatibility, and opens update PRs.', model_engine: 'gemini-1.5-flash', temperature: 0.2, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true, 'Python Sandbox': true }, stars: 44, system_prompt: 'You are a dependency manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '24', user_id: 'demo', name: 'Support Ticket Router', description: 'Classifies and routes support tickets to the right team automatically.', model_engine: 'gemini-1.5-flash', temperature: 0.3, max_tokens: 2048, tools_config: { 'Discord Webhook': true }, stars: 21, system_prompt: 'You are a support coordinator.', created_at: '2026-06-01T00:00:00Z' },
  { id: '25', user_id: 'demo', name: 'A/B Test Analyzer', description: 'Statistical analysis of experiment results with confidence intervals.', model_engine: 'gemini-1.5-pro', temperature: 0.1, max_tokens: 4096, tools_config: { 'Python Sandbox': true }, stars: 27, system_prompt: 'You are a statistician.', created_at: '2026-06-01T00:00:00Z' },
  { id: '26', user_id: 'demo', name: 'Slack Moderator', description: 'Monitors channels for policy violations and auto-flags inappropriate content.', model_engine: 'gemini-2.0-flash', temperature: 0.4, max_tokens: 2048, tools_config: { 'Discord Webhook': true }, stars: 13, system_prompt: 'You are a community moderator.', created_at: '2026-06-01T00:00:00Z' },
  { id: '27', user_id: 'demo', name: 'Release Note Generator', description: 'Drafts release notes from commit history and PR descriptions.', model_engine: 'gemini-1.5-flash', temperature: 0.4, max_tokens: 4096, tools_config: { 'GitHub Repo Manager': true }, stars: 35, system_prompt: 'You are a release manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '28', user_id: 'demo', name: 'Form Filler', description: 'Auto-fills web forms from structured data with validation.', model_engine: 'gemini-1.5-flash', temperature: 0.2, max_tokens: 2048, tools_config: { 'Python Sandbox': true }, stars: 7, system_prompt: 'You are a form automation assistant.', created_at: '2026-06-01T00:00:00Z' },
  { id: '29', user_id: 'demo', name: 'Knowledge Base Curator', description: 'Organizes, tags, and keeps internal documentation up to date.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 8192, tools_config: { 'Web Search': true, 'GitHub Repo Manager': true }, stars: 19, system_prompt: 'You are a knowledge manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '30', user_id: 'demo', name: 'Workflow Orchestrator', description: 'Chains multiple agents together for complex multi-step automation.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 8192, tools_config: { 'Web Search': true, 'Python Sandbox': true, 'GitHub Repo Manager': true, 'Discord Webhook': true }, stars: 88, system_prompt: 'You are a workflow orchestrator.', created_at: '2026-06-01T00:00:00Z' },
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
      // Fallback to local creation
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
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
            
            {/* Create Agent Modal */}
            <CreateAgentModal 
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onCreate={handleCreateAgent}
            />
          </div>
        </div>
      </header>

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
            {agents.length} Active
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} style={{ color: 'var(--accent)' }} />
            4.2k Telemetry
          </span>
          <span className="flex items-center gap-1.5">
            <Star size={12} style={{ color: 'color-mix(in srgb, orange 50%, var(--text-muted))' }} />
            {agents.reduce((sum, a) => sum + (a.stars || 0), 0)} Stars
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork size={12} style={{ color: 'var(--text-muted)' }} />
            {agents.length} Models
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
