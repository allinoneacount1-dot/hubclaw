import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { OrchestrationPipeline, PipelineStep } from '../types/index.js';
import { runOpenRouter } from '../services/openrouterService.js';
import config from '../config/environment.js';

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

// Helper to interpolate step outputs in input
function interpolateStepInputs(input: string, steps: any[]) {
  let result = input;
  steps.forEach(step => {
    const placeholder = new RegExp(`\\{\\{step_${step.step_order}_output\\}\\}`, 'g');
    if (step.output) {
      result = result.replace(placeholder, step.output);
    }
  });
  return result;
}

// POST /api/orchestration/:id/run
export async function runPipeline(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id: pipelineId } = req.params;

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

    await supabase
      .from('orchestration_pipelines')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', pipelineId);

    const { data: steps, error: stepsError } = await supabase
      .from('pipeline_steps')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('step_order', { ascending: true });

    if (stepsError || !steps || steps.length === 0) {
      await supabase
        .from('orchestration_pipelines')
        .update({ status: 'idle', updated_at: new Date().toISOString() })
        .eq('id', pipelineId);
      res.status(400).json({ error: 'Pipeline has no steps' });
      return;
    }

    await Promise.all(steps.map(step =>
      supabase.from('pipeline_steps').update({ status: 'pending', output: null, updated_at: new Date().toISOString() }).eq('id', step.id)
    ));

    res.json({ message: 'Pipeline started' });

    (async () => {
      const executedSteps: any[] = [];
      let pipelineFailed = false;

      for (const step of steps) {
        if (pipelineFailed) break;

        try {
          await supabase.from('pipeline_steps').update({ status: 'running', updated_at: new Date().toISOString() }).eq('id', step.id);

          const { data: agent } = await supabase.from('agents').select('*').eq('id', step.agent_id).single();

          const processedInput = interpolateStepInputs(step.input, executedSteps);

          let openRouterApiKey = config.openRouterApiKey;
          const { data: profile } = await supabase.from('profiles').select('openrouter_api_key, encrypted_gemini_api_key').eq('id', userId).single();
          if (profile?.openrouter_api_key) openRouterApiKey = profile.openrouter_api_key;
          else if (profile?.encrypted_gemini_api_key) openRouterApiKey = profile.encrypted_gemini_api_key;

          const result = await runOpenRouter({
            apiKey: openRouterApiKey,
            prompt: processedInput,
            systemPrompt: agent?.system_prompt || '',
            model: agent?.model_engine || config.defaultFreeModel,
            temperature: agent?.temperature || 0.7,
            maxTokens: agent?.max_tokens || 2048,
          });

          const stepWithOutput = { ...step, output: result.text };
          executedSteps.push(stepWithOutput);

          await supabase.from('pipeline_steps').update({ status: 'completed', output: result.text, updated_at: new Date().toISOString() }).eq('id', step.id);
        } catch (err) {
          pipelineFailed = true;
          await supabase.from('pipeline_steps').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', step.id);
          console.error('Step execution failed:', err);
        }
      }

      await supabase
        .from('orchestration_pipelines')
        .update({ status: pipelineFailed ? 'failed' : 'completed', updated_at: new Date().toISOString() })
        .eq('id', pipelineId);
    })();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
