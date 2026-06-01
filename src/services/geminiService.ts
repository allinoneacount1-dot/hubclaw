import { GoogleGenAI } from '@google/genai';
import { config } from '../config/environment.js';

export interface GeminiRunOptions {
  apiKey: string;
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiRunResult {
  text: string;
  tokensUsed: number;
}

export async function runGemini(
  options: GeminiRunOptions
): Promise<GeminiRunResult> {
  const {
    apiKey,
    prompt,
    systemPrompt = '',
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  // Mock mode for $0 development
  if (config.mockAi) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      text: `[Mock Response] Processed "${prompt.slice(0, 60)}..." using ${model}. Configuration: temp=${temperature}, max_tokens=${maxTokens}. This is a simulated response for development.`,
      tokensUsed: Math.floor(Math.random() * 500) + 100,
    };
  }

  const genai = new GoogleGenAI({ apiKey });

  const fullPrompt = systemPrompt
    ? `SYSTEM: ${systemPrompt}\n\n---\n\nUSER: ${prompt}`
    : prompt;

  const response = await genai.models.generateContent({
    model,
    contents: fullPrompt,
    config: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const text = response.text || '';
  const tokensUsed = (response.usageMetadata?.totalTokenCount as number) || 0;

  return { text, tokensUsed };
}
