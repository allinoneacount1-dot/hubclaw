import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import type { TokenBudget } from '../types/index.js';

// GET /api/budget
export async function getBudget(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    // First, reset daily tokens if needed
    await supabase.rpc('reset_daily_tokens');

    const { data, error } = await supabase
      .from('profiles')
      .select('daily_token_limit, daily_tokens_used')
      .eq('id', userId)
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const budget: TokenBudget = {
      dailyLimit: data?.daily_token_limit || 100000,
      used: data?.daily_tokens_used || 0,
    };

    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/budget
export async function setBudget(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { dailyLimit } = req.body;

    if (!dailyLimit || dailyLimit < 0) {
      res.status(400).json({ error: 'dailyLimit must be a positive number' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ daily_token_limit: dailyLimit })
      .eq('id', userId)
      .select('daily_token_limit, daily_tokens_used')
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const budget: TokenBudget = {
      dailyLimit: data?.daily_token_limit || 100000,
      used: data?.daily_tokens_used || 0,
    };

    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
