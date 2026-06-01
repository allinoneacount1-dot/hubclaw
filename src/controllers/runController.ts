import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { runOpenRouter } from '../services/openrouterService.js';
import { config } from '../config/environment.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { RunRequest, RunResponse } from '../types/index.js';

// POST /api/run - Execute agent with OpenRouter
export async function runAgent(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const startTime = Date.now();

  try {
    const userId = req.userId;
    const {
      agentId,
      systemPrompt,
      userMessage,
      modelEngine = config.defaultFreeModel,
      temperature = 0.7,
      maxTokens = 2048,
      toolsConfig = {},
    }: RunRequest = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    // Get OpenRouter API key: user profile → env fallback
    let openRouterApiKey = config.openRouterApiKey;

    const { data: profile } = await supabase
      .from('profiles')
      .select('openrouter_api_key, encrypted_gemini_api_key')
      .eq('id', userId)
      .single();

    const userApiKey = profile?.openrouter_api_key || profile?.encrypted_gemini_api_key;
    if (userApiKey) {
      openRouterApiKey = userApiKey;
    }

    // If agentId provided, fetch agent config
    let agentConfig: Record<string, unknown> = {};
    if (agentId) {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      if (agent) {
        agentConfig = agent;
      }
    }

    const finalSystemPrompt = systemPrompt || (agentConfig.system_prompt as string) || '';
    const finalModel = modelEngine || (agentConfig.model_engine as string) || config.defaultFreeModel;
    const finalTemp = temperature ?? (agentConfig.temperature as number) ?? 0.7;
    const finalMaxTokens = maxTokens ?? (agentConfig.max_tokens as number) ?? 2048;

    // Execute via OpenRouter
    const result = await runOpenRouter({
      apiKey: openRouterApiKey || '',
      prompt: userMessage,
      systemPrompt: finalSystemPrompt,
      model: finalModel,
      temperature: finalTemp,
      maxTokens: finalMaxTokens,
    });

    const latencyMs = Date.now() - startTime;

    // Log telemetry (fire and forget)
    try {
      await supabase
        .from('telemetry_logs')
        .insert({
          agent_id: agentId || null,
          user_id: userId,
          tokens_used: result.tokensUsed,
          latency_ms: latencyMs,
          status: 'success',
          executed_tool: Object.entries(toolsConfig)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ') || null,
          message: `[SUCCESS] ${result.model} — ${latencyMs}ms`,
        });
    } catch { /* telemetry failed, ignore */ }

    const response: RunResponse = {
      response: result.text,
      tokensUsed: result.tokensUsed,
      latencyMs,
      status: 'success',
    };

    res.json(response);
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;

    // Log error telemetry (fire and forget)
    try {
      await supabase
        .from('telemetry_logs')
        .insert({
          agent_id: req.body.agentId || null,
          user_id: req.userId,
          tokens_used: 0,
          latency_ms: latencyMs,
          status: 'error',
          message: `[ERROR] ${err.message}`,
        });
    } catch { /* telemetry failed, ignore */ }

    res.status(500).json({
      error: err.message || 'Internal server error',
      status: 'error',
      latencyMs,
    });
  }
}

// GET /api/models — list available OpenRouter free models
export async function getModels(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { getFreeModels } = await import('../services/openrouterService.js');
    const models = await getFreeModels(config.openRouterApiKey);
    res.json({ models });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
