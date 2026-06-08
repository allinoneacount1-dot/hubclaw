import { supabase } from '../config/supabase';

export const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  model_engine: string;
  temperature: number;
  max_tokens: number;
  tools_config?: Record<string, boolean>;
  github_sync_url?: string;
  created_at?: string;
  stars?: number;
}

export interface RunResponse {
  response: string;
  tokensUsed: number;
  latencyMs: number;
  status: 'success' | 'error';
}

export interface AnalyticsData {
  tokenTrends: { date: string; tokens: number }[];
  latencyMatrix: { label: string; latency: number }[];
  recentLogs: { message: string; status: string; timestamp?: string }[];
  totalExecutions: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  tags: string[];
  isBuiltIn: boolean;
  created_at?: string;
}

export interface TaskQueueItem {
  id: string;
  agentId: string;
  prompt: string;
  priority: 'urgent' | 'normal' | 'low';
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ConversationBranch {
  id: string;
  parentMessageId?: string;
  messages: ChatMessage[];
  label: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
}

export interface OrchestrationPipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export interface PipelineStep {
  id: string;
  agentId: string;
  agentName: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependsOn?: string[];
}

export interface TokenBudget {
  dailyLimit: number;
  used: number;
  agentId?: string;
}

export type ThemeMode = 'dark' | 'light' | 'auto';
export type ExportFormat = 'markdown' | 'json' | 'csv' | 'txt';

// Helper to get auth headers
async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }

  return headers;
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { ...headers, ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

export const api = {
  // Agents
  getAgents: () => fetchJSON<{ agents: Agent[] }>('/api/agents'),
  getAgent: (id: string) => fetchJSON<{ agent: Agent }>(`/api/agents/${id}`),
  createAgent: (data: Partial<Agent>) =>
    fetchJSON<{ agent: Agent }>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  forkAgent: (id: string) =>
    fetchJSON<{ agent: Agent }>(`/api/agents/${id}/fork`, { method: 'POST' }),

  // Run (OpenRouter)
  runAgent: (data: {
    agentId?: string;
    systemPrompt?: string;
    userMessage: string;
    modelEngine?: string;
    temperature?: number;
    maxTokens?: number;
    toolsConfig?: Record<string, boolean>;
  }) => fetchJSON<RunResponse>('/api/run', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Models
  getModels: () => fetchJSON<{ models: OpenRouterModel[] }>('/api/run/models'),

  // Analytics
  getAnalytics: (agentId?: string) =>
    fetchJSON<AnalyticsData>(`/api/analytics/${agentId || ''}`),

  // Prompts
  getPrompts: () => fetchJSON<{ prompts: PromptTemplate[] }>('/api/prompts'),
  createPrompt: (data: Partial<PromptTemplate>) =>
    fetchJSON<{ prompt: PromptTemplate }>('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deletePrompt: (id: string) =>
    fetchJSON(`/api/prompts/${id}`, { method: 'DELETE' }),

  // Task Queue
  getTasks: (agentId?: string) =>
    fetchJSON<{ tasks: TaskQueueItem[] }>(`/api/tasks/${agentId || ''}`),
  createTask: (data: {
    agentId: string;
    prompt: string;
    priority?: 'urgent' | 'normal' | 'low';
    systemPrompt?: string;
    modelEngine?: string;
  }) => fetchJSON<{ task: TaskQueueItem }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Token Budget
  getTokenBudget: () => fetchJSON<TokenBudget>('/api/budget'),
  setTokenBudget: (data: TokenBudget) =>
    fetchJSON<TokenBudget>('/api/budget', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
