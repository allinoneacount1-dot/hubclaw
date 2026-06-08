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
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="sticky top-0 z-20 backdrop-blur-md border-b" style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
        borderColor: 'var(--border-color)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }} aria-label="Back to Dashboard">
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Prompt Library</h2>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{prompts.length} templates</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', onClick: onBack }, { label: 'Prompt Library' }]} />
        <div className="flex items-center gap-4 mt-6 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts by name, content, or tags..."
              className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:w-full transition-all"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              aria-label="Search prompts"
            />
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 text-sm border rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center gap-1.5 shrink-0"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
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
              className="px-3 py-1.5 text-xs font-mono rounded-full transition-all"
              style={category === cat
                ? {
                    backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                    border: '1px solid',
                    color: 'var(--accent)'
                  }
                : {
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid',
                    color: 'var(--text-muted)'
                  }
              }
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
              className="mb-6 rounded-lg border p-5 space-y-3"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)'
              }}
            >
              <input
                type="text"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(p => ({ ...p, name: e.target.value }))}
                placeholder="Prompt name..."
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="flex gap-3">
                <select
                  value={newPrompt.category}
                  onChange={(e) => setNewPrompt(p => ({ ...p, category: e.target.value }))}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
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
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <textarea
                value={newPrompt.content}
                onChange={(e) => setNewPrompt(p => ({ ...p, content: e.target.value }))}
                placeholder="Prompt content..."
                className="w-full h-24 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none resize-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                <button onClick={handleCreate} className="px-4 py-1.5 text-xs border rounded-md hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                    color: 'var(--accent)'
                  }}
                >Save Prompt</button>
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
              className="group rounded-lg border backdrop-blur-md p-4 hover:border-[var(--accent)] transition-all"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} style={{ color: 'color-mix(in srgb, var(--accent) 60%, transparent)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{prompt.name}</h3>
                  {prompt.isBuiltIn && <Star size={10} style={{ color: 'color-mix(in srgb, orange 60%, transparent)' }} />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(prompt.content, prompt.id)}
                    className="p-1 rounded transition-all"
                    title="Copy"
                    aria-label="Copy prompt"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {copied === prompt.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(prompt.content)}
                      className="p-1 rounded transition-all"
                      title="Use this prompt"
                      aria-label="Use prompt"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  {!prompt.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="p-1 rounded transition-all"
                      title="Delete"
                      aria-label="Delete prompt"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {prompt.category}
                </span>
                {prompt.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-mono flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                    <Tag size={8} />{tag}
                  </span>
                ))}
              </div>

              <p
                className="text-xs font-mono cursor-pointer transition-colors"
                onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                style={{ color: 'var(--text-muted)' }}
              >
                {expandedPrompt === prompt.id ? prompt.content : prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '...' : '')}
              </p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            No prompts found. Try a different search or category.
          </div>
        )}
      </div>
    </motion.div>
  );
}
