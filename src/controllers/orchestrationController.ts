import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { OrchestrationPipeline, PipelineStep } from '../types/index.js';

// GET /api/orchestration
export async function getPipelines(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const { data: pipelines, error: pipelineError } = await supabase
      .from('orchestration_pipelines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pipelineError) {
      res.status(500).json({ error: pipelineError.message });
      return;
    }

    // Get steps for each pipeline
    const pipelineIds = (pipelines || []).map(p => p.id);
    let steps: PipelineStep[] = [];
    if (pipelineIds.length > 0) {
      const { data: stepsData, error: stepsError } = await supabase
        .from('pipeline_steps')
        .select('*')
        .in('pipeline_id', pipelineIds)
        .order('step_order', { ascending: true });
      if (!stepsError && stepsData) {
        steps = stepsData;
      }
    }

    // Combine pipelines with steps
    const pipelinesWithSteps = (pipelines || []).map(pipeline => ({
      ...pipeline,
      steps: steps.filter(step => step.pipeline_id === pipeline.id),
    }));

    res.json({ pipelines: pipelinesWithSteps });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/orchestration
export async function createPipeline(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const { data, error } = await supabase
      .from('orchestration_pipelines')
      .insert({ user_id: userId, name, status: 'idle' })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ pipeline: { ...data, steps: [] } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/orchestration/:id/steps
export async function addStep(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id: pipelineId } = req.params;
    const { agentId, agentName, input, dependsOn } = req.body;

    if (!agentId || !agentName || !input) {
      res.status(400).json({ error: 'agentId, agentName, and input are required' });
      return;
    }

    // Verify pipeline belongs to user
    const { data: pipeline, error: pipelineError } = await supabase
      .from('orchestration_pipelines')
      .select('*')
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .single();

    if (pipelineError || !pipeline) {
      res.status(404).json({ error: 'Pipeline not found' });
      return;
    }

    // Get current max step order
    const { data: existingSteps, error: stepsError } = await supabase
      .from('pipeline_steps')
      .select('step_order')
      .eq('pipeline_id', pipelineId)
      .order('step_order', { ascending: false })
      .limit(1);

    const nextOrder = existingSteps && existingSteps.length > 0 ? existingSteps[0].step_order + 1 : 0;

    const { data, error } = await supabase
      .from('pipeline_steps')
      .insert({
        pipeline_id: pipelineId,
        agent_id: agentId,
        agent_name: agentName,
        input,
        step_order: nextOrder,
        depends_on: dependsOn || [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ step: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/orchestration/:pipelineId/steps/:stepId
export async function removeStep(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { pipelineId, stepId } = req.params;

    // Verify pipeline belongs to user
    const { data: pipeline, error: pipelineError } = await supabase
      .from('orchestration_pipelines')
      .select('*')
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .single();

    if (pipelineError || !pipeline) {
      res.status(404).json({ error: 'Pipeline not found' });
      return;
    }

    const { error } = await supabase
      .from('pipeline_steps')
      .delete()
      .eq('id', stepId)
      .eq('pipeline_id', pipelineId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/orchestration/:id
export async function deletePipeline(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from('orchestration_pipelines')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/orchestration/:id/run
export async function runPipeline(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id: pipelineId } = req.params;

    // Verify pipeline belongs to user
    const { data: pipeline, error: pipelineError } = await supabase
      .from('orchestration_pipelines')
      .select('*')
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .single();

    if (pipelineError || !pipeline) {
      res.status(404).json({ error: 'Pipeline not found' });
      return;
    }

    // Update pipeline status to running
    await supabase
      .from('orchestration_pipelines')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', pipelineId);

    // Reset all steps to pending
    await supabase
      .from('pipeline_steps')
      .update({ status: 'pending', output: null, updated_at: new Date().toISOString() })
      .eq('pipeline_id', pipelineId);

    res.json({ message: 'Pipeline started' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
