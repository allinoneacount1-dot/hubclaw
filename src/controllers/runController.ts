import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { runGemini } from '../services/geminiService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { RunRequest, RunResponse } from '../types/index.js';

// POST /api/run - Execute agent with BYOK Gemini
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
      modelEngine = 'gemini-1.5-flash',
      temperature = 0.7,
      maxTokens = 2048,
      toolsConfig = {},
    }: RunRequest = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    // Fetch user's Gemini API key from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('encrypted_gemini_api_key')
      .eq('id', userId)
      .single();

    // If no profile or no key, use mock mode
    const userApiKey = profile?.encrypted_gemini_api_key;

    // If agentId provided, fetch agent config
    let agentConfig: any = {};
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

    const finalSystemPrompt = systemPrompt || agentConfig.system_prompt || '';
    const finalModel = modelEngine || agentConfig.model_engine || 'gemini-1.5-flash';
    const finalTemp = temperature ?? agentConfig.temperature ?? 0.7;
    const finalMaxTokens = maxTokens ?? agentConfig.max_tokens ?? 2048;

    // Execute Gemini
    const result = await runGemini({
      apiKey: userApiKey || 'mock-key',
      prompt: userMessage,
      systemPrompt: finalSystemPrompt,
      model: finalModel,
      temperature: finalTemp,
      maxTokens: finalMaxTokens,
    });

    const latencyMs = Date.now() - startTime;

    // Log telemetry (async, don't block response)
    supabase
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
        message: `[SUCCESS] Agent executed in ${latencyMs}ms`,
      })
      .then()
      .catch(() => {});

    const response: RunResponse = {
      response: result.text,
      tokensUsed: result.tokensUsed,
      latencyMs,
      status: 'success',
    };

    res.json(response);
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;

    // Log error telemetry
    supabase
      .from('telemetry_logs')
      .insert({
        agent_id: req.body.agentId || null,
        user_id: req.userId,
        tokens_used: 0,
        latency_ms: latencyMs,
        status: 'error',
        message: `[ERROR] ${err.message}`,
      })
      .then()
      .catch(() => {});

    res.status(500).json({
      error: err.message || 'Internal server error',
      status: 'error',
      latencyMs,
    });
  }
}
