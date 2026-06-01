import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, RunResponse } from '../services/api';
import { api } from '../services/api';
import {
  ArrowLeft, Copy, Rocket, Star, GitFork,
  Play, Loader2, Check, Settings, Terminal
} from 'lucide-react';

interface CommandCenterProps {
  agent: Agent;
  onBack: () => void;
}

interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRun = async () => {
    if (!input.trim() || isRunning) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const typingMsg: ChatMessage = {
      role: 'system',
      content: 'Running agent...',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
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

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [
          ...filtered,
          {
            role: 'agent',
            content: result.response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (err: any) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [
          ...filtered,
          {
            role: 'agent',
            content: `Error: ${err.message}`,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`/api/run/${agent.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTool = (tool: string) => {
    setTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

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
          {/* Column 1: Architect Suite */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', mass: 0.5, damping: 18 }}
            className="space-y-4"
          >
            {/* Model Configuration */}
            <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={14} className="text-cyan-400" />
                <h3 className="text-sm font-medium text-slate-300">Model Configuration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-500 mb-1.5 block">Engine</label>
                  <select
                    value={modelEngine}
                    onChange={(e) => setModelEngine(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800/30 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/30 transition-colors"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-mono text-slate-500">Temperature</label>
                    <motion.span
                      key={temperature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-mono text-cyan-400"
                    >
                      {temperature.toFixed(2)}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800/30 h-1 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-mono text-slate-500">Max Tokens</label>
                    <motion.span
                      key={maxTokens}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-mono text-cyan-400"
                    >
                      {maxTokens}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800/30 h-1 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* System Directive */}
            <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">System Directive</h3>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Define agent behavior, personality, and constraints..."
                className="w-full h-32 bg-transparent border-0 text-sm font-mono text-slate-400 resize-none focus:outline-none placeholder:text-slate-600"
              />
            </div>

            {/* Neural Tools */}
            <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Neural Tools</h3>
              <div className="space-y-3">
                {Object.entries(tools).map(([tool, enabled]) => (
                  <motion.div
                    key={tool}
                    className="flex items-center justify-between"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm text-slate-400">{tool}</span>
                    <button
                      onClick={() => toggleTool(tool)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        enabled ? 'bg-cyan-400/30' : 'bg-slate-800/50'
                      }`}
                    >
                      <motion.div
                        className={`absolute top-0.5 w-4 h-4 rounded-full ${
                          enabled ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                        animate={{ x: enabled ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Neural Sandbox */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', mass: 0.5, damping: 18 }}
            className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md flex flex-col"
          >
            <div className="px-5 py-3 border-b border-slate-800/30 flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" />
              <h3 className="text-sm font-medium text-slate-300">Live Sandbox Testbed</h3>
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 p-5 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
                  Awaiting input...
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
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
                        <span className="whitespace-pre-wrap font-mono text-xs">{msg.content}</span>
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
