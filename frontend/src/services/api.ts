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

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
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

  // Run
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

  // Analytics
  getAnalytics: (agentId?: string) =>
    fetchJSON<AnalyticsData>(`/api/analytics/${agentId || ''}`),
};
