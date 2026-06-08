export interface Profile {
  id: string;
  encrypted_gemini_api_key?: string;
  openrouter_api_key?: string;
  daily_token_limit?: number;
  daily_tokens_used?: number;
  last_token_reset_date?: string;
  created_at?: string;
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

export interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  content: string;
  tags: string[];
  is_built_in: boolean;
  created_at?: string;
}

export interface OrchestrationPipeline {
  id: string;
  user_id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
  steps?: PipelineStep[];
}

export interface PipelineStep {
  id: string;
  pipeline_id: string;
  agent_id: string;
  agent_name: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  step_order: number;
  depends_on: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TaskQueueItem {
  id: string;
  user_id: string;
  agent_id: string;
  prompt: string;
  system_prompt?: string;
  model_engine?: string;
  priority: 'urgent' | 'normal' | 'low';
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  created_at?: string;
  completed_at?: string;
}

export interface TokenBudget {
  dailyLimit: number;
  used: number;
  agentId?: string;
}
