import express from 'express';
import { sseManager } from '../services/sseManager.js';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

// GET /api/sse/events - SSE endpoint for real-time updates
router.get('/events', async (req, res) => {
  try {
    // Get token from either Authorization header or query param
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    sseManager.addClient(user.id, res);
  } catch (err: any) {
    console.error('SSE auth failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
