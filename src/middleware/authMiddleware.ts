import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow unauthenticated requests in dev mode with a mock user
      if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ANON === 'true') {
        req.userId = '00000000-0000-0000-0000-000000000000';
        return next();
      }
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    next(err);
  }
}

// Optional auth - attaches user if token present, but doesn't require it
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        req.userId = data.user.id;
      }
    }

    next();
  } catch {
    next();
  }
}
