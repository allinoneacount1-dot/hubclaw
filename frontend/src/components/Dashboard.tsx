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
  { id: '31', user_id: 'demo', name: 'Data Analyst Agent', description: 'Analyzes datasets and generates insights with Python sandbox and web search.', model_engine: 'gemini-1.5-pro', temperature: 0.3, max_tokens: 4096, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 12, system_prompt: 'You are a data analyst.', created_at: '2026-06-01T00:00:00Z' },
  { id: '32', user_id: 'demo', name: 'Code Review Bot', description: 'Reviews GitHub PRs with static analysis and security scanning.', model_engine: 'gemini-1.5-flash', temperature: 0.1, max_tokens: 8192, tools_config: { 'GitHub Repo Manager': true }, stars: 28, system_prompt: 'You are a code reviewer.', created_at: '2026-06-01T00:00:00Z' },
  { id: '33', user_id: 'demo', name: 'Social Media Manager', description: 'Auto-posts to Twitter, Discord with sentiment analysis.', model_engine: 'gemini-2.0-flash', temperature: 0.8, max_tokens: 2048, tools_config: { 'Discord Webhook': true, 'Web Search': true }, stars: 5, system_prompt: 'You are a social media manager.', created_at: '2026-06-01T00:00:00Z' },
  { id: '34', user_id: 'demo', name: 'Research Assistant', description: 'Deep research with multi-source synthesis and citation tracking.', model_engine: 'gemini-1.5-pro', temperature: 0.4, max_tokens: 8192, tools_config: { 'Web Search': true, 'Python Sandbox': true }, stars: 45, system_prompt: 'You are a research assistant.', created_at: '2026-06-01T00:00:00Z' },
];

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
      setAgents(data.agents.length > 0 ? data.agents : MOCK_AGENTS);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setAgents(MOCK_AGENTS);
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
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="HubClaw" className="h-8 w-8 rounded-lg object-cover" />
            <motion.h1 className="text-lg font-light tracking-widest text-slate-300 animate-breathe">
              HubClaw
            </motion.h1>
          </div>

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
