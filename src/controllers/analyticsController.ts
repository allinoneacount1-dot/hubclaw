import { Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// GET /api/analytics/:agentId - Get telemetry data for charts
export async function getAnalytics(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { agentId } = req.params;
    const userId = req.userId;

    // Build query
    let query = supabase
      .from('telemetry_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (agentId && agentId !== 'all') {
      query = query.eq('agent_id', agentId);
    }

    const { data: logs, error } = await query.limit(100);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Aggregate data for charts
    const tokenTrends = aggregateTokenTrends(logs || []);
    const latencyMatrix = aggregateLatency(logs || []);
    const recentLogs = (logs || [])
      .slice(0, 10)
      .map((log) => ({
        message: log.message || `[${log.status?.toUpperCase()}] ${log.executed_tool || 'Execution'} - ${log.latency_ms}ms`,
        status: log.status,
        timestamp: log.created_at,
      }));

    res.json({
      tokenTrends,
      latencyMatrix,
      recentLogs,
      totalExecutions: logs?.length || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/analytics - Global analytics (all agents)
export async function getGlobalAnalytics(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;

    const { data: logs, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const tokenTrends = aggregateTokenTrends(logs || []);
    const latencyMatrix = aggregateLatency(logs || []);
    const recentLogs = (logs || [])
      .slice(0, 10)
      .map((log) => ({
        message: log.message || `[${log.status?.toUpperCase()}] ${log.executed_tool || 'Execution'} - ${log.latency_ms}ms`,
        status: log.status,
        timestamp: log.created_at,
      }));

    res.json({
      tokenTrends,
      latencyMatrix,
      recentLogs,
      totalExecutions: logs?.length || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Helper: Aggregate daily token consumption
function aggregateTokenTrends(logs: any[]): { date: string; tokens: number }[] {
  const dailyMap: Record<string, number> = {};

  logs.forEach((log) => {
    if (log.created_at) {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + (log.tokens_used || 0);
    }
  });

  return Object.entries(dailyMap)
    .map(([date, tokens]) => ({ date, tokens }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // Last 14 days
}

// Helper: Aggregate latency data
function aggregateLatency(logs: any[]): { label: string; latency: number }[] {
  const buckets: Record<string, number[]> = {};

  logs.forEach((log) => {
    if (log.created_at && log.latency_ms) {
      const hour = new Date(log.created_at).getHours();
      const label = `${hour}:00`;
      if (!buckets[label]) buckets[label] = [];
      buckets[label].push(log.latency_ms);
    }
  });

  return Object.entries(buckets)
    .map(([label, values]) => ({
      label,
      latency: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
}
