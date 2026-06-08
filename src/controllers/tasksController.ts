import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sseManager } from '../services/sseManager.js';
import { runOpenRouter } from '../services/openrouterService.js';
import { config } from '../config/environment.js';
import type { TaskQueueItem } from '../types/index.js';

// Asynchronous function to process a task
async function processTask(task: TaskQueueItem) {
  try {
    // Mark as running
    const { data: updatedTask } = await supabase
      .from('task_queue')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', task.id)
      .select()
      .single();
    
    if (updatedTask) {
      sseManager.broadcastToUser(task.user_id, 'task_update', updatedTask);
    }

    // Get agent configuration
    let systemPrompt = task.system_prompt;
    let modelEngine = task.model_engine;
    
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', task.agent_id)
      .single();
    
    if (agent) {
      systemPrompt = systemPrompt || agent.system_prompt;
      modelEngine = modelEngine || agent.model_engine;
    }

    // Run the task via OpenRouter
    const result = await runOpenRouter({
      apiKey: config.openRouterApiKey || '',
      prompt: task.prompt,
      systemPrompt,
      model: modelEngine,
    });

    // Mark as completed
    const { data: completedTask } = await supabase
      .from('task_queue')
      .update({
        status: 'completed',
        result: result.text,
        tokens_used: result.tokensUsed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (completedTask) {
      sseManager.broadcastToUser(task.user_id, 'task_update', completedTask);
    }

  } catch (err: any) {
    console.error('Task processing failed:', err);
    // Mark as failed
    const { data: failedTask } = await supabase
      .from('task_queue')
      .update({
        status: 'failed',
        error: err.message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (failedTask) {
      sseManager.broadcastToUser(task.user_id, 'task_update', failedTask);
    }
  }
}

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

    // Broadcast task created
    sseManager.broadcastToUser(userId, 'task_update', data);

    // Process task asynchronously
    processTask(data as TaskQueueItem);

    res.status(201).json({ task: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
