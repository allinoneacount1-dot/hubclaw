import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, RunResponse, TaskQueueItem, TokenBudget } from '../services/api';
import { api } from '../services/api';
import {
  ArrowLeft, Copy, Rocket, Star, GitFork,
  Play, Loader2, Check, Settings, Terminal,
  History, GitBranch, ListOrdered, Shield,
  ChevronDown, ChevronRight, MessageSquare
} from 'lucide-react';
import TaskQueue from './TaskQueue';
import OutputFormatter from './OutputFormatter';
import SafetyGuardrails from './SafetyGuardrails';

interface CommandCenterProps {
  agent: Agent;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
  branchId?: string;
}

interface ConversationBranch {
  id: string;
  label: string;
  messages: ChatMessage[];
  parentMessageId?: string;
}

export default function CommandCenter({ agent, onBack }: CommandCenterProps) {
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt || '');
  const [modelEngine, setModelEngine] = useState(agent.model_engine || 'gemini-1.5-flash');
  const [temperature, setTemperature] = useState(agent.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(agent.max_tokens ?? 2048);
  const [tools, setTools] = useState<Record<string, boolean>>(
    agent.tools_config || {
      'Web Search': false,
      'Python Sandbox': false,
      'GitHub Repo Manager': false,
      'Discord Webhook': false,
    }
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New feature states
  const [activeTab, setActiveTab] = useState<'config' | 'queue' | 'history' | 'safety'>('config');
  const [tasks, setTasks] = useState<TaskQueueItem[]>([]);
  const [tokenBudget, setTokenBudget] = useState<TokenBudget>({ dailyLimit: 100000, used: 0 });
  const [branches, setBranches] = useState<ConversationBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('main');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    model: true, prompt: true, tools: true, queue: false, history: false, safety: false
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeBranch = branches.find(b => b.id === activeBranchId);
  const displayMessages = activeBranch ? activeBranch.messages : messages;

  const handleRun = async () => {
    if (!input.trim() || isRunning) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      branchId: activeBranchId,
    };

    const typingMsg: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'system',
      content: 'Running agent...',
      timestamp: new Date(),
      isTyping: true,
      branchId: activeBranchId,
    };

    if (activeBranchId === 'main') {
      setMessages((prev) => [...prev, userMsg, typingMsg]);
    } else {
      setBranches(prev => prev.map(b =>
        b.id === activeBranchId
          ? { ...b, messages: [...b.messages, userMsg, typingMsg] }
          : b
      ));
    }
    setInput('');
    setIsRunning(true);

    try {
      const result: RunResponse = await api.runAgent({
        agentId: agent.id,
        systemPrompt,
        userMessage: input,
        modelEngine,
        temperature,
        maxTokens,
        toolsConfig: tools,
      });

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: 'agent',
        content: result.response,
        timestamp: new Date(),
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
        model: modelEngine,
        branchId: activeBranchId,
      };

      const updateMessages = (prev: ChatMessage[]) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, agentMsg];
      };

      if (activeBranchId === 'main') {
        setMessages(updateMessages);
      } else {
        setBranches(prev => prev.map(b =>
          b.id === activeBranchId
            ? { ...b, messages: updateMessages(b.messages) }
            : b
        ));
      }

      // Update token budget
      setTokenBudget(prev => ({
        ...prev,
        used: prev.used + (result.tokensUsed || 0),
      }));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'agent',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
        branchId: activeBranchId,
      };

      const updateMessages = (prev: ChatMessage[]) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, errorMsg];
      };

      if (activeBranchId === 'main') {
        setMessages(updateMessages);
      } else {
        setBranches(prev => prev.map(b =>
          b.id === activeBranchId
            ? { ...b, messages: updateMessages(b.messages) }
            : b
        ));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleBranch = (parentMessageId?: string) => {
    const branchId = `branch-${Date.now()}`;
    const parentMsg = messages.find(m => m.id === parentMessageId);
    const newBranch: ConversationBranch = {
      id: branchId,
      label: `Branch from: ${parentMsg?.content.slice(0, 30) || 'start'}...`,
      messages: parentMsg ? [parentMsg] : [],
      parentMessageId,
    };
    setBranches(prev => [...prev, newBranch]);
    setActiveBranchId(branchId);
  };

  const handleAddTask = (prompt: string, priority: 'urgent' | 'normal' | 'low') => {
    const task: TaskQueueItem = {
      id: `task-${Date.now()}`,
      agentId: agent.id,
      prompt,
      priority,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, task]);
  };

  const handleRemoveTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`/api/run/${agent.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTool = (tool: string) => {
    setTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalTokensUsed = displayMessages.reduce((sum, m) => sum + (m.tokensUsed || 0), 0);
  const avgLatency = displayMessages.length > 0
    ? displayMessages.reduce((sum, m) => sum + (m.latencyMs || 0), 0) / displayMessages.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen bg-slate-950"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Terminal Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Stats inline */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-slate-600 mr-3">
              <span>{displayMessages.filter(m => m.role === 'agent').length} runs</span>
              <span>{totalTokensUsed.toLocaleString()} tokens</span>
              <span>{Math.round(avgLatency)}ms avg</span>
            </div>

            <button
              onClick={handleCopyEndpoint}
              className="p-2 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button className="p-2 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all">
              <Rocket size={16} />
            </button>
            <button className="p-2 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all">
              <Star size={16} />
            </button>
            <button className="p-2 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all">
              <GitFork size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Title Block */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-medium text-slate-200">
            <span className="text-slate-500">operator</span>
            <span className="text-slate-600"> / </span>
            {agent.name}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs font-mono text-emerald-400/70">Synced</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Config Suite */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', mass: 0.5, damping: 18 }}
            className="space-y-4"
          >
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-900/30 rounded-lg p-1 border border-slate-800/30">
              {[
                { id: 'config' as const, label: 'Config', icon: Settings },
                { id: 'queue' as const, label: 'Queue', icon: ListOrdered, count: tasks.filter(t => t.status === 'queued').length },
                { id: 'history' as const, label: 'History', icon: History, count: branches.length },
                { id: 'safety' as const, label: 'Safety', icon: Shield },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[9px] bg-cyan-400/20 text-cyan-400 px-1 rounded-full">{tab.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Config Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Model Configuration */}
                  <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
                    <button
                      onClick={() => toggleSection('model')}
                      className="flex items-center gap-2 mb-4 w-full"
                    >
                      {expandedSections.model ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                      <Settings size={14} className="text-cyan-400" />
                      <h3 className="text-sm font-medium text-slate-300">Model Configuration</h3>
                    </button>

                    <AnimatePresence>
                      {expandedSections.model && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-xs font-mono text-slate-500 mb-1.5 block">Engine</label>
                            <select
                              value={modelEngine}
                              onChange={(e) => setModelEngine(e.target.value)}
                              className="w-full bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/30 transition-colors"
                            >
                              <optgroup label="Google Gemini">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                              </optgroup>
                              <optgroup label="Anthropic Claude">
                                <option value="claude-sonnet-4">Claude Sonnet 4</option>
                                <option value="claude-haiku-4">Claude Haiku 4</option>
                                <option value="claude-opus-4">Claude Opus 4</option>
                              </optgroup>
                              <optgroup label="OpenAI">
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="o1">o1</option>
                                <option value="o3-mini">o3-mini</option>
                              </optgroup>
                              <optgroup label="DeepSeek">
                                <option value="deepseek-v3">DeepSeek V3</option>
                                <option value="deepseek-r1">DeepSeek R1</option>
                              </optgroup>
                              <optgroup label="xAI Grok">
                                <option value="grok-3">Grok 3</option>
                                <option value="grok-3-mini">Grok 3 Mini</option>
                              </optgroup>
                              <optgroup label="Mistral">
                                <option value="mistral-large">Mistral Large</option>
                                <option value="mistral-small">Mistral Small</option>
                              </optgroup>
                              <optgroup label="Ollama (Local)">
                                <option value="llama-3-70b">Llama 3 70B</option>
                                <option value="llama-3-8b">Llama 3 8B</option>
                                <option value="qwen-2.5-72b">Qwen 2.5 72B</option>
                                <option value="codellama-34b">Code Llama 34B</option>
                              </optgroup>
                            </select>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-xs font-mono text-slate-500">Temperature</label>
                              <motion.span key={temperature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-mono text-cyan-400">
                                {temperature.toFixed(2)}
                              </motion.span>
                            </div>
                            <input type="range" min="0" max="2" step="0.01" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-cyan-400 bg-slate-800/30 h-1 rounded-full appearance-none cursor-pointer" />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-xs font-mono text-slate-500">Max Tokens</label>
                              <motion.span key={maxTokens} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-mono text-cyan-400">
                                {maxTokens}
                              </motion.span>
                            </div>
                            <input type="range" min="256" max="8192" step="256" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-cyan-400 bg-slate-800/30 h-1 rounded-full appearance-none cursor-pointer" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* System Directive */}
                  <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => toggleSection('prompt')} className="flex items-center gap-2">
                        {expandedSections.prompt ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                        <h3 className="text-sm font-medium text-slate-300">System Directive</h3>
                      </button>
                      <select
                        onChange={(e) => { const val = e.target.value; if (val) setSystemPrompt(val); }}
                        value=""
                        className="text-xs font-mono bg-slate-900/50 border border-slate-800/30 rounded px-2 py-1 text-slate-400 focus:outline-none"
                      >
                        <option value="">Load template...</option>
                        <option value="You are an expert data analyst. Your role is to analyze datasets, identify patterns, generate statistical insights, and produce clear visualizations. Always validate your findings with quantitative evidence before presenting conclusions.">Data Analyst</option>
                        <option value="You are a senior code reviewer. Analyze pull requests for code quality, security vulnerabilities, performance issues, and adherence to best practices. Provide constructive feedback with specific line references and suggested improvements.">Code Reviewer</option>
                        <option value="You are a social media strategist. Create engaging, platform-optimized content that drives engagement and brand awareness. Analyze sentiment, track trends, and adapt tone to match target audience demographics.">Social Media Manager</option>
                        <option value="You are a research assistant specializing in deep, multi-source synthesis. Gather information from diverse sources, cross-reference facts, identify knowledge gaps, and present findings with proper citations and confidence levels.">Research Assistant</option>
                        <option value="You are a DevOps engineer focused on CI/CD pipeline monitoring and incident response. Monitor deployment health, detect anomalies, auto-rollback failed deploys, and maintain system reliability with minimal downtime.">DevOps Sentinel</option>
                        <option value="You are a legal document analyst. Extract key clauses, identify risks and obligations, flag unusual terms, and summarize complex legal language into actionable insights. Always note when professional legal review is recommended.">Legal Parser</option>
                        <option value="You are a cryptocurrency and DeFi analyst. Track on-chain data, whale movements, yield farming opportunities, and market sentiment. Provide risk assessments and highlight emerging trends in the Web3 ecosystem.">Crypto Scout</option>
                        <option value="You are an email management assistant. Auto-categorize inbound emails by urgency and topic, draft contextually appropriate responses, and prioritize action items. Maintain professional tone and flag sensitive communications.">Email Triage</option>
                        <option value="You are a SQL expert. Convert natural language queries into optimized SQL with proper indexing hints, JOIN strategies, and query plans. Support PostgreSQL, MySQL, and BigQuery dialects.">SQL Generator</option>
                        <option value="You are a QA engineer specializing in API testing. Generate comprehensive test suites covering happy paths, edge cases, error handling, and security scenarios. Include load testing and contract validation.">API Tester</option>
                        <option value="You are a customer success analyst. Predict churn risk by analyzing usage patterns, support tickets, and engagement metrics. Propose targeted retention strategies with measurable impact.">Churn Predictor</option>
                        <option value="You are a technical writer. Generate clear, comprehensive documentation including README files, API references, changelogs, and onboarding guides. Adapt detail level to target audience expertise.">Doc Writer</option>
                        <option value="You are a cybersecurity specialist. Scan codebases for OWASP vulnerabilities, insecure dependencies, and misconfigurations. Provide prioritized remediation steps with CVSS scoring.">Security Auditor</option>
                        <option value="You are a meeting assistant. Transcribe discussions, extract action items with owners and deadlines, identify decisions made, and generate concise executive summaries.">Meeting Summarizer</option>
                        <option value="You are a competitive intelligence analyst. Monitor competitor pricing, product changes, and market positioning. Alert on significant shifts and provide strategic recommendations.">Price Monitor</option>
                        <option value="You are a talent acquisition specialist. Source candidates from GitHub, LinkedIn, and technical communities. Evaluate technical fit, cultural alignment, and growth potential.">Talent Sourcer</option>
                        <option value="You are a site reliability engineer. Monitor application logs for anomalies, predict failures before they occur, and automate incident response. Maintain SLOs and error budgets.">SRE Analyst</option>
                        <option value="You are a content strategist. Plan editorial calendars based on audience analytics, seasonal trends, and engagement data. Optimize posting schedules for maximum reach.">Content Planner</option>
                        <option value="You are a dependency management specialist. Monitor for outdated packages, test compatibility of updates, and automate PR creation with changelog summaries and breaking change alerts.">Dep Updater</option>
                        <option value="You are a support operations coordinator. Classify tickets by urgency and topic, route to appropriate teams, suggest knowledge base articles, and track resolution SLAs.">Support Router</option>
                        <option value="You are a statistics expert specializing in A/B testing. Calculate statistical significance, confidence intervals, and minimum sample sizes. Guard against common pitfalls like peeking and multiple comparisons.">A/B Analyst</option>
                        <option value="You are a community moderator. Monitor channels for policy violations, toxic content, and spam. Apply graduated responses from warnings to bans with clear documentation.">Community Mod</option>
                        <option value="You are a release manager. Draft release notes from commit history and PRs, categorize changes by impact, and communicate breaking changes clearly to stakeholders.">Release Manager</option>
                        <option value="You are a knowledge management specialist. Organize internal documentation, maintain taxonomies, identify stale content, and ensure information discoverability across teams.">KB Curator</option>
                        <option value="You are a workflow automation orchestrator. Chain multiple AI agents together for complex multi-step processes. Handle error recovery, parallel execution, and result aggregation.">Workflow Orchestrator</option>
                      </select>
                    </div>
                    <AnimatePresence>
                      {expandedSections.prompt && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Define agent behavior, personality, and constraints..."
                            className="w-full h-40 bg-transparent border-0 text-sm font-mono text-slate-400 resize-none focus:outline-none placeholder:text-slate-600"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Neural Tools */}
                  <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
                    <button onClick={() => toggleSection('tools')} className="flex items-center gap-2 mb-4 w-full">
                      {expandedSections.tools ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                      <h3 className="text-sm font-medium text-slate-300">Neural Tools</h3>
                    </button>
                    <AnimatePresence>
                      {expandedSections.tools && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3">
                          {Object.entries(tools).map(([tool, enabled]) => (
                            <motion.div key={tool} className="flex items-center justify-between" whileTap={{ scale: 0.98 }}>
                              <span className="text-sm text-slate-400">{tool}</span>
                              <button
                                onClick={() => toggleTool(tool)}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${enabled ? 'bg-cyan-400/30' : 'bg-slate-800/50'}`}
                              >
                                <motion.div
                                  className={`absolute top-0.5 w-4 h-4 rounded-full ${enabled ? 'bg-cyan-400' : 'bg-slate-600'}`}
                                  animate={{ x: enabled ? 22 : 2 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Queue Tab */}
              {activeTab === 'queue' && (
                <motion.div key="queue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ListOrdered size={14} className="text-cyan-400" />
                      <h3 className="text-sm font-medium text-slate-300">Task Queue</h3>
                    </div>
                    <TaskQueue tasks={tasks} onAddTask={handleAddTask} onRemoveTask={handleRemoveTask} />
                  </div>
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch size={14} className="text-cyan-400" />
                      <h3 className="text-sm font-medium text-slate-300">Conversation Branches</h3>
                    </div>

                    {/* Branch Selector */}
                    <div className="space-y-2 mb-4">
                      <button
                        onClick={() => setActiveBranchId('main')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono transition-all ${
                          activeBranchId === 'main'
                            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                            : 'bg-slate-900/30 text-slate-500 border border-slate-800/30 hover:text-slate-300'
                        }`}
                      >
                        <MessageSquare size={12} />
                        Main ({messages.length} msgs)
                      </button>

                      {branches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => setActiveBranchId(branch.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono transition-all ${
                            activeBranchId === branch.id
                              ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                              : 'bg-slate-900/30 text-slate-500 border border-slate-800/30 hover:text-slate-300'
                          }`}
                        >
                          <GitBranch size={12} />
                          {branch.label} ({branch.messages.length} msgs)
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleBranch()}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900/30 text-slate-500 border border-slate-800/30 rounded-md hover:text-cyan-400 hover:border-cyan-400/20 transition-all flex items-center justify-center gap-1"
                    >
                      <GitBranch size={12} />
                      Branch from current
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Safety Tab */}
              {activeTab === 'safety' && (
                <motion.div key="safety" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <SafetyGuardrails
                    budget={tokenBudget}
                    onUpdateBudget={(update) => setTokenBudget(prev => ({ ...prev, ...update }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Column 2: Neural Sandbox */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', mass: 0.5, damping: 18 }}
            className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md flex flex-col"
          >
            <div className="px-5 py-3 border-b border-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" />
                <h3 className="text-sm font-medium text-slate-300">Live Sandbox Testbed</h3>
              </div>
              {displayMessages.length > 0 && (
                <OutputFormatter content={displayMessages[displayMessages.length - 1]?.content || ''} />
              )}
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 p-5 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {displayMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
                  Awaiting input...
                </div>
              )}

              <AnimatePresence>
                {displayMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', mass: 0.5, damping: 18 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-cyan-400/10 border border-cyan-400/20 text-slate-300'
                          : msg.isTyping
                          ? 'bg-slate-800/30 text-slate-500 font-mono'
                          : 'bg-slate-800/30 border border-slate-800/30 text-slate-400'
                      }`}
                    >
                      {msg.isTyping ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin" />
                          {msg.content}
                        </span>
                      ) : (
                        <div>
                          <span className="whitespace-pre-wrap font-mono text-xs">{msg.content}</span>
                          {msg.tokensUsed && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800/20 text-[9px] font-mono text-slate-600">
                              {msg.tokensUsed && <span>{msg.tokensUsed} tokens</span>}
                              {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                              {msg.model && <span>{msg.model}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-slate-800/30">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent border-0 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none font-mono"
                />
                <button
                  onClick={handleRun}
                  disabled={isRunning || !input.trim()}
                  className="p-2 rounded-md bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
