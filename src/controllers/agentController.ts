import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { runGemini } from '../services/geminiService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { Agent, RunRequest, RunResponse, TelemetryLog } from '../types/index.js';

// GET /api/agents - Fetch all agents (public + user's own)
export async function getAgents(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ agents: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/agents/:id - Fetch single agent
export async function getAgentById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json({ agent: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/agents - Create new agent
export async function createAgent(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const {
      name,
      description,
      system_prompt,
      model_engine,
      temperature,
      max_tokens,
      tools_config,
      github_sync_url,
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Agent name is required' });
      return;
    }

    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        system_prompt: system_prompt || '',
        model_engine: model_engine || 'gemini-1.5-flash',
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
        tools_config: tools_config || {},
        github_sync_url: github_sync_url || null,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ agent: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/agents/:id/fork - Fork an existing agent
export async function forkAgent(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Get original agent
    const { data: original, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Create fork
    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: `${original.name} (Fork)`,
        description: original.description,
        system_prompt: original.system_prompt,
        model_engine: original.model_engine,
        temperature: original.temperature,
        max_tokens: original.max_tokens,
        tools_config: original.tools_config,
        github_sync_url: original.github_sync_url,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ agent: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
