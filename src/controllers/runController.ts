import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { runOpenRouter } from '../services/openrouterService.js';
import {
  searchWeb,
  sendDiscordWebhook,
  fetchGitHubRepo,
  fetchGitHubIssues,
  runPythonCode,
} from '../services/toolsService.js';
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
      githubOwner,
      githubRepo,
      githubToken,
      pythonCode,
      discordWebhookUrl,
    }: RunRequest & any = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    await supabase.rpc('reset_daily_tokens');

    let openRouterApiKey = config.openRouterApiKey;

    const { data: profile } = await supabase
      .from('profiles')
      .select('openrouter_api_key, encrypted_gemini_api_key, daily_token_limit, daily_tokens_used')
      .eq('id', userId)
      .single();

    if (profile) {
      const { daily_token_limit, daily_tokens_used } = profile;
      if (daily_tokens_used && daily_token_limit && daily_tokens_used >= daily_token_limit) {
        res.status(429).json({ error: 'Daily token limit exceeded' });
        return;
      }
    }

    const userApiKey = profile?.openrouter_api_key || profile?.encrypted_gemini_api_key;
    if (userApiKey) {
      openRouterApiKey = userApiKey;
    }

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

    let additionalContext = '';

    if (toolsConfig['Web Search'] || (agentConfig.tools_config && agentConfig.tools_config['Web Search'])) {
      const searchResults = await searchWeb(userMessage);
      if (searchResults.length > 0) {
        additionalContext += '\n\nWeb Search Results:\n';
        searchResults.forEach((result, index) => {
          additionalContext += `${index + 1}. ${result.title} - ${result.url}\n   ${result.snippet}\n`;
        });
      }
    }

    if (toolsConfig['GitHub API'] || (agentConfig.tools_config && agentConfig.tools_config['GitHub API'])) {
      if (githubOwner && githubRepo) {
        const repoData = await fetchGitHubRepo(githubOwner, githubRepo, githubToken);
        const issuesData = await fetchGitHubIssues(githubOwner, githubRepo, githubToken);
        if (repoData) {
          additionalContext += `\n\nGitHub Repo:\n${JSON.stringify(repoData, null, 2)}\n`;
        }
        if (issuesData && issuesData.length > 0) {
          additionalContext += `\nGitHub Issues (latest ${issuesData.length}):\n`;
          issuesData.slice(0, 5).forEach((issue: any) => {
            additionalContext += `- ${issue.title} (#${issue.number})\n`;
          });
        }
      }
    }

    if (toolsConfig['Python Sandbox'] || (agentConfig.tools_config && agentConfig.tools_config['Python Sandbox'])) {
      if (pythonCode) {
        const pythonResult = await runPythonCode(pythonCode);
        additionalContext += `\n\nPython Execution Result:\nStdout: ${pythonResult.stdout}\nStderr: ${pythonResult.stderr}\nExit Code: ${pythonResult.exitCode}\n`;
      }
    }

    if (toolsConfig['Discord Webhook'] || (agentConfig.tools_config && agentConfig.tools_config['Discord Webhook'])) {
      if (discordWebhookUrl && userMessage) {
        await sendDiscordWebhook(discordWebhookUrl, userMessage);
        additionalContext += `\n\nDiscord message sent successfully.\n`;
      }
    }

    const finalSystemPrompt = systemPrompt || (agentConfig.system_prompt as string) || '';
    const finalModel = modelEngine || (agentConfig.model_engine as string) || config.defaultFreeModel;
    const finalTemp = temperature ?? (agentConfig.temperature as number) ?? 0.7;
    const finalMaxTokens = maxTokens ?? (agentConfig.max_tokens as number) ?? 2048;
    const finalPrompt = `${userMessage}${additionalContext}`;

    const result = await runOpenRouter({
      apiKey: openRouterApiKey || '',
      prompt: finalPrompt,
      systemPrompt: finalSystemPrompt,
      model: finalModel,
      temperature: finalTemp,
      maxTokens: finalMaxTokens,
    });

    const latencyMs = Date.now() - startTime;

    try {
      await supabase
        .from('profiles')
        .update({
          daily_tokens_used: (profile?.daily_tokens_used || 0) + result.tokensUsed,
        })
        .eq('id', userId);
    } catch { /* ignore */ }

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
    } catch { /* ignore */ }

    const response: RunResponse = {
      response: result.text,
      tokensUsed: result.tokensUsed,
      latencyMs,
      status: 'success',
    };

    res.json(response);
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;

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
    } catch { /* ignore */ }

    res.status(500).json({
      error: err.message || 'Internal server error',
      status: 'error',
      latencyMs,
    });
  }
}

export async function executePython(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'code is required' });
      return;
    }
    const result = await runPythonCode(code);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function fetchGitHub(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { owner, repo, token } = req.body;
    if (!owner || !repo) {
      res.status(400).json({ error: 'owner and repo are required' });
      return;
    }
    const repoData = await fetchGitHubRepo(owner, repo, token);
    const issues = await fetchGitHubIssues(owner, repo, token);
    res.json({ repo: repoData, issues });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function sendDiscord(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { webhookUrl, content } = req.body;
    if (!webhookUrl || !content) {
      res.status(400).json({ error: 'webhookUrl and content are required' });
      return;
    }
    const result = await sendDiscordWebhook(webhookUrl, content);
    res.json({ success: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

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
