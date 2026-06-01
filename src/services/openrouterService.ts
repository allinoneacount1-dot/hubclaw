import { config } from '../config/environment.js';

export interface OpenRouterRunOptions {
  apiKey: string;
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  fallbackModels?: string[];
}

export interface OpenRouterRunResult {
  text: string;
  tokensUsed: number;
  model: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Map frontend model names to OpenRouter free tier models
const MODEL_MAP: Record<string, string> = {
  // Gemini
  'gemini-2.0-flash': 'google/gemini-2.0-flash-exp:free',
  'gemini-1.5-pro': 'google/gemini-2.0-flash-exp:free',
  'gemini-1.5-flash': 'google/gemini-2.0-flash-exp:free',
  // Claude
  'claude-sonnet-4': 'nvidia/nemotron-4-340b-instruct:free',
  'claude-haiku-4': 'mistralai/mistral-7b-instruct:free',
  'claude-opus-4': 'meta-llama/llama-3.1-70b-instruct:free',
  // OpenAI
  'gpt-4o': 'deepseek/deepseek-r1:free',
  'gpt-4o-mini': 'qwen/qwen-2-7b-instruct:free',
  'gpt-4-turbo': 'meta-llama/llama-3.1-70b-instruct:free',
  'o1': 'deepseek/deepseek-r1:free',
  'o3-mini': 'deepseek/deepseek-r1:free',
  // DeepSeek
  'deepseek-v3': 'deepseek/deepseek-r1:free',
  'deepseek-r1': 'deepseek/deepseek-r1:free',
  // xAI Grok
  'grok-3': 'meta-llama/llama-3.1-70b-instruct:free',
  'grok-3-mini': 'meta-llama/llama-3.1-8b-instruct:free',
  // Mistral
  'mistral-large': 'mistralai/mistral-7b-instruct:free',
  'mistral-small': 'mistralai/mistral-7b-instruct:free',
  // Ollama (local) — use free cloud equivalent
  'llama-3-70b': 'meta-llama/llama-3.1-70b-instruct:free',
  'llama-3-8b': 'meta-llama/llama-3.1-8b-instruct:free',
  'qwen-2.5-72b': 'qwen/qwen-2-7b-instruct:free',
  'codellama-34b': 'meta-llama/llama-3.1-8b-instruct:free',
  // HubClaw custom
  'owl-alpha': 'openrouter/owl-alpha:free',
  'nemotron': 'nvidia/nemotron-4-340b-instruct:free',
};

// Ordered fallback chain — all free tier
const FALLBACK_CHAIN: string[] = [
  'nvidia/nemotron-4-340b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
];

function resolveModel(model?: string): string {
  if (!model) return config.defaultFreeModel;
  const mapped = MODEL_MAP[model];
  if (mapped) return mapped;
  // If it's already a valid OpenRouter model string, use it
  return model.includes('/') ? model : config.defaultFreeModel;
}

async function callOpenRouter(
  apiKey: string,
  messages: OpenRouterMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<OpenRouterResponse> {
  const response = await fetch(`${config.openRouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://hubclaw.vercel.app',
      'X-Title': 'HubClaw',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<OpenRouterResponse>;
}

export async function runOpenRouter(
  options: OpenRouterRunOptions
): Promise<OpenRouterRunResult> {
  const {
    apiKey,
    prompt,
    systemPrompt = '',
    model,
    temperature = 0.7,
    maxTokens = 2048,
    fallbackModels,
  } = options;

  if (!apiKey && !config.mockAi) {
    throw new Error('OpenRouter API key not configured. Set OPENROUTER_API_KEY env var or use mock mode.');
  }

  // Mock mode for $0 development
  if (config.mockAi || !apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Simulate realistic response
    const mockResponses: Record<string, string> = {
      'data': '📊 **Analysis Complete**\n\nBased on the data provided, here are the key insights:\n\n• **Trend**: Upward trajectory with 23% growth\n• **Pattern**: Seasonal fluctuations detected\n• **Recommendation** Focus on high-performing segments\n\n[Mock response — configure OPENROUTER_API_KEY for real AI]',
      'code': '✅ **Code Review**\n\n```\nSecurity: ✓ No vulnerabilities detected\nQuality:   ⚠ 2 minor issues found\nPerf:      ✓ Optimized\n```\n\n**Suggestions:**\n1. Add input validation on line 42\n2. Consider caching for repeated queries\n\n[Mock response — configure OPENROUTER_API_KEY for real AI]',
      'default': `🤖 **HubClaw Agent Response**\n\nProcessed your request: "${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}"\n\n**Configuration:**\n• Model: ${model || config.defaultFreeModel}\n• Temperature: ${temperature}\n• Max Tokens: ${maxTokens}\n• System: ${systemPrompt ? 'Custom' : 'Default'}\n\n[Mock response — configure OPENROUTER_API_KEY for real AI]`,
    };
    
    const key = prompt.toLowerCase().includes('data') ? 'data' 
      : prompt.toLowerCase().includes('code') ? 'code' 
      : 'default';
    
    return {
      text: mockResponses[key],
      tokensUsed: Math.floor(Math.random() * 300) + 50,
      model: model || config.defaultFreeModel,
    };
  }

  // Build messages
  const messages: OpenRouterMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Resolve model
  const primaryModel = resolveModel(model);
  
  // Build attempt chain: primary → fallbacks
  const modelsToTry = [primaryModel, ...(fallbackModels || FALLBACK_CHAIN)].filter(
    (m, i, arr) => arr.indexOf(m) === i // dedupe
  );

  let lastError: Error | null = null;
  
  for (const attemptModel of modelsToTry) {
    try {
      const result = await callOpenRouter(apiKey, messages, attemptModel, temperature, maxTokens);
      
      const text = result.choices?.[0]?.message?.content || '';
      const tokensUsed = result.usage?.total_tokens || 
        (result.usage?.prompt_tokens || 0) + (result.usage?.completion_tokens || 0);
      
      return {
        text,
        tokensUsed,
        model: result.model || attemptModel,
      };
    } catch (err: any) {
      lastError = err;
      // If rate limited (429) or model not found (404), try next
      if (err.message?.includes('429') || err.message?.includes('404') || err.message?.includes('503')) {
        console.warn(`⚠️ Model ${attemptModel} failed (${err.message}), trying fallback...`);
        continue;
      }
      // For other errors, throw immediately
      throw err;
    }
  }

  // All models failed
  throw lastError || new Error('All OpenRouter models failed');
}

// Get available free models from OpenRouter
export async function getFreeModels(apiKey: string): Promise<Array<{ id: string; name: string; context_length: number }>> {
  if (!apiKey) {
    return config.freeModels.map(id => ({
      id,
      name: id.split('/').pop()?.replace(':free', '') || id,
      context_length: 8192,
    }));
  }

  try {
    const response = await fetch(`${config.openRouterBaseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://hubclaw.vercel.app',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch models');
    
    const data = await response.json();
    return (data.data || [])
      .filter((m: any) => m.pricing?.prompt === '0' || m.id.includes(':free'))
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id.split('/').pop(),
        context_length: m.context_length || 8192,
      }))
      .slice(0, 20);
  } catch {
    return config.freeModels.map(id => ({
      id,
      name: id.split('/').pop()?.replace(':free', '') || id,
      context_length: 8192,
    }));
  }
}

export default { runOpenRouter, getFreeModels, resolveModel, FALLBACK_CHAIN };
