export interface Profile {
  id: string;
  encrypted_gemini_api_key?: string;
}

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

export interface TelemetryLog {
  id: string;
  agent_id: string;
  user_id: string;
  tokens_used: number;
  latency_ms: number;
  status: 'success' | 'error';
  executed_tool?: string;
  message?: string;
  created_at?: string;
}

export interface RunRequest {
  agentId?: string;
  systemPrompt?: string;
  userMessage: string;
  modelEngine?: string;
  temperature?: number;
  maxTokens?: number;
  toolsConfig?: Record<string, boolean>;
}

export interface RunResponse {
  response: string;
  tokensUsed: number;
  latencyMs: number;
  status: 'success' | 'error';
}
