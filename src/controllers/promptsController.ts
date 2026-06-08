import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { PromptTemplate } from '../types/index.js';

// GET /api/prompts
export async function getPrompts(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_built_in.eq.true`)
      .order('is_built_in', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ prompts: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/prompts
export async function createPrompt(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { name, category, content, tags } = req.body;

    if (!name || !category || !content) {
      res.status(400).json({ error: 'Name, category, and content are required' });
      return;
    }

    const { data, error } = await supabase
      .from('prompt_templates')
      .insert({
        user_id: userId,
        name,
        category,
        content,
        tags: tags || [],
        is_built_in: false,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({ prompt: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/prompts/:id
export async function deletePrompt(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_built_in', false);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
