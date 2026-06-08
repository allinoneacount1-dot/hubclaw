import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PromptTemplate } from '../services/api';
import {
  ArrowLeft, Search, Plus, Trash2, Copy, Tag,
  BookOpen, Check, FolderOpen, Star
} from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { pageTransition } from '../utils/transitions';

const CATEGORIES = ['All', 'Analysis', 'Development', 'Content', 'Research', 'Operations', 'Security', 'Custom'];

const BUILT_IN_PROMPTS: PromptTemplate[] = [
  { id: 'p1', name: 'Data Analyst', category: 'Analysis', content: 'You are an expert data analyst. Your role is to analyze datasets, identify patterns, generate statistical insights, and produce clear visualizations. Always validate your findings with quantitative evidence before presenting conclusions.', tags: ['data', 'analytics', 'statistics'], isBuiltIn: true },
  { id: 'p2', name: 'Code Reviewer', category: 'Development', content: 'You are a senior code reviewer. Analyze pull requests for code quality, security vulnerabilities, performance issues, and adherence to best practices. Provide constructive feedback with specific line references and suggested improvements.', tags: ['code', 'review', 'security'], isBuiltIn: true },
  { id: 'p3', name: 'Social Media Manager', category: 'Content', content: 'You are a social media strategist. Create engaging, platform-optimized content that drives engagement and brand awareness. Analyze sentiment, track trends, and adapt tone to match target audience demographics.', tags: ['social', 'content', 'marketing'], isBuiltIn: true },
  { id: 'p4', name: 'Research Assistant', category: 'Research', content: 'You are a research assistant specializing in deep, multi-source synthesis. Gather information from diverse sources, cross-reference facts, identify knowledge gaps, and present findings with proper citations and confidence levels.', tags: ['research', 'synthesis', 'citations'], isBuiltIn: true },
  { id: 'p5', name: 'DevOps Sentinel', category: 'Operations', content: 'You are a DevOps engineer focused on CI/CD pipeline monitoring and incident response. Monitor deployment health, detect anomalies, auto-rollback failed deploys, and maintain system reliability with minimal downtime.', tags: ['devops', 'cicd', 'monitoring'], isBuiltIn: true },
  { id: 'p6', name: 'Legal Parser', category: 'Analysis', content: 'You are a legal document analyst. Extract key clauses, identify risks and obligations, flag unusual terms, and summarize complex legal language into actionable insights. Always note when professional legal review is recommended.', tags: ['legal', 'contracts', 'risk'], isBuiltIn: true },
  { id: 'p7', name: 'Crypto Market Scout', category: 'Analysis', content: 'You are a cryptocurrency and DeFi analyst. Track on-chain data, whale movements, yield farming opportunities, and market sentiment. Provide risk assessments and highlight emerging trends in the Web3 ecosystem.', tags: ['crypto', 'defi', 'web3'], isBuiltIn: true },
  { id: 'p8', name: 'Email Triage', category: 'Operations', content: 'You are an email management assistant. Auto-categorize inbound emails by urgency and topic, draft contextually appropriate responses, and prioritize action items. Maintain professional tone and flag sensitive communications.', tags: ['email', 'triage', 'automation'], isBuiltIn: true },
  { id: 'p9', name: 'SQL Generator', category: 'Development', content: 'You are a SQL expert. Convert natural language queries into optimized SQL with proper indexing hints, JOIN strategies, and query plans. Support PostgreSQL, MySQL, and BigQuery dialects.', tags: ['sql', 'database', 'query'], isBuiltIn: true },
  { id: 'p10', name: 'API Tester', category: 'Development', content: 'You are a QA engineer specializing in API testing. Generate comprehensive test suites covering happy paths, edge cases, error handling, and security scenarios. Include load testing and contract validation.', tags: ['api', 'testing', 'qa'], isBuiltIn: true },
  { id: 'p11', name: 'Security Auditor', category: 'Security', content: 'You are a cybersecurity specialist. Scan codebases for OWASP vulnerabilities, insecure dependencies, and misconfigurations. Provide prioritized remediation steps with CVSS scoring.', tags: ['security', 'owasp', 'audit'], isBuiltIn: true },
  { id: 'p12', name: 'Meeting Summarizer', category: 'Operations', content: 'You are a meeting assistant. Transcribe discussions, extract action items with owners and deadlines, identify decisions made, and generate concise executive summaries.', tags: ['meeting', 'summary', 'action-items'], isBuiltIn: true },
  { id: 'p13', name: 'Doc Writer', category: 'Content', content: 'You are a technical writer. Generate clear, comprehensive documentation including README files, API references, changelogs, and onboarding guides. Adapt detail level to target audience expertise.', tags: ['docs', 'writing', 'technical'], isBuiltIn: true },
  { id: 'p14', name: 'Churn Predictor', category: 'Analysis', content: 'You are a customer success analyst. Predict churn risk by analyzing usage patterns, support tickets, and engagement metrics. Propose targeted retention strategies with measurable impact.', tags: ['churn', 'retention', 'analytics'], isBuiltIn: true },
  { id: 'p15', name: 'Talent Sourcer', category: 'Operations', content: 'You are a talent acquisition specialist. Source candidates from GitHub, LinkedIn, and technical communities. Evaluate technical fit, cultural alignment, and growth potential.', tags: ['hiring', 'recruiting', 'talent'], isBuiltIn: true },
  { id: 'p16', name: 'A/B Analyst', category: 'Analysis', content: 'You are a statistics expert specializing in A/B testing. Calculate statistical significance, confidence intervals, and minimum sample sizes. Guard against common pitfalls like peeking and multiple comparisons.', tags: ['ab-test', 'statistics', 'experiment'], isBuiltIn: true },
  { id: 'p17', name: 'Release Manager', category: 'Operations', content: 'You are a release manager. Draft release notes from commit history and PRs, categorize changes by impact, and communicate breaking changes clearly to stakeholders.', tags: ['release', 'notes', 'changelog'], isBuiltIn: true },
  { id: 'p18', name: 'KB Curator', category: 'Operations', content: 'You are a knowledge management specialist. Organize internal documentation, maintain taxonomies, identify stale content, and ensure information discoverability across teams.', tags: ['knowledge', 'docs', 'taxonomy'], isBuiltIn: true },
  { id: 'p19', name: 'Workflow Orchestrator', category: 'Operations', content: 'You are a workflow automation orchestrator. Chain multiple AI agents together for complex multi-step processes. Handle error recovery, parallel execution, and result aggregation.', tags: ['workflow', 'automation', 'multi-agent'], isBuiltIn: true },
  { id: 'p20', name: 'Community Mod', category: 'Operations', content: 'You are a community moderator. Monitor channels for policy violations, toxic content, and spam. Apply graduated responses from warnings to bans with clear documentation.', tags: ['moderation', 'community', 'safety'], isBuiltIn: true },
  { id: 'p21', name: 'Price Monitor', category: 'Analysis', content: 'You are a competitive intelligence analyst. Monitor competitor pricing, product changes, and market positioning. Alert on significant shifts and provide strategic recommendations.', tags: ['pricing', 'competition', 'market'], isBuiltIn: true },
  { id: 'p22', name: 'Dep Updater', category: 'Development', content: 'You are a dependency management specialist. Monitor for outdated packages, test compatibility of updates, and automate PR creation with changelog summaries and breaking change alerts.', tags: ['dependencies', 'updates', 'automation'], isBuiltIn: true },
  { id: 'p23', name: 'Support Router', category: 'Operations', content: 'You are a support operations coordinator. Classify tickets by urgency and topic, route to appropriate teams, suggest knowledge base articles, and track resolution SLAs.', tags: ['support', 'routing', 'tickets'], isBuiltIn: true },
  { id: 'p24', name: 'SRE Analyst', category: 'Operations', content: 'You are a site reliability engineer. Monitor application logs for anomalies, predict failures before they occur, and automate incident response. Maintain SLOs and error budgets.', tags: ['sre', 'reliability', 'monitoring'], isBuiltIn: true },
  { id: 'p25', name: 'Content Planner', category: 'Content', content: 'You are a content strategist. Plan editorial calendars based on audience analytics, seasonal trends, and engagement data. Optimize posting schedules for maximum reach.', tags: ['content', 'planning', 'calendar'], isBuiltIn: true },
];

interface PromptLibraryProps {
  onBack: () => void;
  onSelect?: (content: string) => void;
}

export default function PromptLibrary({ onBack, onSelect }: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(BUILT_IN_PROMPTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ name: '', category: 'Custom', content: '', tags: '' });
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const filtered = prompts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase()));
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = () => {
    if (!newPrompt.name || !newPrompt.content) return;
    const prompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: newPrompt.name,
      category: newPrompt.category,
      content: newPrompt.content,
      tags: newPrompt.tags.split(',').map(t => t.trim()).filter(Boolean),
      isBuiltIn: false,
      created_at: new Date().toISOString(),
    };
    setPrompts(prev => [prompt, ...prev]);
    setNewPrompt({ name: '', category: 'Custom', content: '', tags: '' });
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen bg-slate-950"
    >
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Back to Dashboard">
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-cyan-400" />
            <h2 className="text-sm font-medium text-slate-300">Prompt Library</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">{prompts.length} templates</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', onClick: onBack }, { label: 'Prompt Library' }]} />
        <div className="flex items-center gap-4 mt-6 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts by name, content, or tags..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/30 border border-slate-800/30 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/30"
              aria-label="Search prompts"
            />
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 text-sm text-cyan-400 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10 transition-all flex items-center gap-1.5 shrink-0"
            aria-label="Create new prompt"
          >
            <Plus size={14} />
            New Prompt
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-mono rounded-full transition-all ${
                category === cat
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-slate-900/30 text-slate-500 border border-slate-800/30 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-lg border border-cyan-400/20 bg-slate-900/50 p-5 space-y-3"
            >
              <input
                type="text"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(p => ({ ...p, name: e.target.value }))}
                placeholder="Prompt name..."
                className="w-full bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/30"
              />
              <div className="flex gap-3">
                <select
                  value={newPrompt.category}
                  onChange={(e) => setNewPrompt(p => ({ ...p, category: e.target.value }))}
                  className="bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newPrompt.tags}
                  onChange={(e) => setNewPrompt(p => ({ ...p, tags: e.target.value }))}
                  placeholder="tags (comma separated)..."
                  className="flex-1 bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <textarea
                value={newPrompt.content}
                onChange={(e) => setNewPrompt(p => ({ ...p, content: e.target.value }))}
                placeholder="Prompt content..."
                className="w-full h-24 bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-1.5 text-xs bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-md hover:bg-cyan-400/30 transition-all">Save Prompt</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, type: 'spring', mass: 0.5, damping: 18 }}
              className="group rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-4 hover:border-cyan-400/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} className="text-cyan-400/60" />
                  <h3 className="text-sm font-medium text-slate-200">{prompt.name}</h3>
                  {prompt.isBuiltIn && <Star size={10} className="text-amber-400/60" />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(prompt.content, prompt.id)}
                    className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-cyan-400 transition-all"
                    title="Copy"
                    aria-label="Copy prompt"
                  >
                    {copied === prompt.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(prompt.content)}
                      className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-cyan-400 transition-all"
                      title="Use this prompt"
                      aria-label="Use prompt"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  {!prompt.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-red-400 transition-all"
                      title="Delete"
                      aria-label="Delete prompt"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-800/30">
                  {prompt.category}
                </span>
                {prompt.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-mono text-slate-600 flex items-center gap-0.5">
                    <Tag size={8} />{tag}
                  </span>
                ))}
              </div>

              <p
                className="text-xs text-slate-500 font-mono cursor-pointer hover:text-slate-400 transition-colors"
                onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
              >
                {expandedPrompt === prompt.id ? prompt.content : prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '...' : '')}
              </p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600 text-sm font-mono">
            No prompts found. Try a different search or category.
          </div>
        )}
      </div>
    </motion.div>
  );
}
