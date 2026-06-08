import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { TaskQueueItem } from '../types/index.js';

// GET /api/tasks
export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const agentId = req.params.agentId;

    let query = supabase
      .from('task_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (agentId && agentId !== 'all') {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ tasks: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/tasks
export async function createTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { agentId, prompt, systemPrompt, modelEngine, priority } = req.body;

    if (!agentId || !prompt) {
      res.status(400).json({ error: 'agentId and prompt are required' });
      return;
    }

    const { data, error } = await supabase
      .from('task_queue')
      .insert({
        user_id: userId,
        agent_id: agentId,
        prompt,
        system_prompt: systemPrompt,
        model_engine: modelEngine,
        priority: priority || 'normal',
        status: 'queued',
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ task: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
