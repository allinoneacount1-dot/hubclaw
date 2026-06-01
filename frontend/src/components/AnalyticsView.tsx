import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { AnalyticsData } from '../services/api';
import { ArrowLeft, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

interface AnalyticsViewProps {
  onBack: () => void;
}

export default function AnalyticsView({ onBack }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const result = await api.getAnalytics();
      setData(result);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Mock data for demo
      setData({
        tokenTrends: [
          { date: '2026-05-20', tokens: 1200 },
          { date: '2026-05-22', tokens: 3400 },
          { date: '2026-05-24', tokens: 2100 },
          { date: '2026-05-26', tokens: 4800 },
          { date: '2026-05-28', tokens: 3200 },
          { date: '2026-05-30', tokens: 5600 },
          { date: '2026-06-01', tokens: 4200 },
        ],
        latencyMatrix: [
          { label: '9:00', latency: 1200 },
          { label: '12:00', latency: 890 },
          { label: '15:00', latency: 1450 },
          { label: '18:00', latency: 980 },
          { label: '21:00', latency: 1100 },
        ],
        recentLogs: [
          { message: '[SUCCESS] Web Search executed - 1200ms', status: 'success', timestamp: new Date().toISOString() },
          { message: '[SUCCESS] Python Sandbox run - 890ms', status: 'success', timestamp: new Date().toISOString() },
          { message: '[ERROR] GitHub API timeout - 5000ms', status: 'error', timestamp: new Date().toISOString() },
          { message: '[SUCCESS] Discord Webhook sent - 340ms', status: 'success', timestamp: new Date().toISOString() },
          { message: '[SUCCESS] Data analysis complete - 2100ms', status: 'success', timestamp: new Date().toISOString() },
        ],
        totalExecutions: 47,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen bg-slate-950"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back to Dashboard</span>
          </button>
          <h2 className="text-sm font-medium text-slate-300">Global Analytics</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-600 text-sm font-mono">
            Loading analytics...
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono text-slate-500">Total Executions</span>
                </div>
                <motion.span
                  key={data.totalExecutions}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-light text-slate-200"
                >
                  {data.totalExecutions}
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono text-slate-500">Avg Latency</span>
                </div>
                <span className="text-2xl font-light text-slate-200">
                  {data.latencyMatrix.length > 0
                    ? Math.round(
                        data.latencyMatrix.reduce((a, b) => a + b.latency, 0) /
                          data.latencyMatrix.length
                      )
                    : 0}
                  <span className="text-sm text-slate-500 ml-1">ms</span>
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono text-slate-500">Total Tokens</span>
                </div>
                <span className="text-2xl font-light text-slate-200">
                  {data.tokenTrends.reduce((a, b) => a + b.tokens, 0).toLocaleString()}
                </span>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
              >
                <h3 className="text-sm font-medium text-slate-300 mb-4">Token Trends</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.tokenTrends}>
                      <defs>
                        <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid rgba(100,116,139,0.3)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tokens"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fill="url(#tokenGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Latency Matrix */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
              >
                <h3 className="text-sm font-medium text-slate-300 mb-4">Neural Latency Matrix</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.latencyMatrix}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid rgba(100,116,139,0.3)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="latency"
                        fill="#22d3ee"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Live Success Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5"
            >
              <h3 className="text-sm font-medium text-slate-300 mb-4">Live Execution Logs</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                {data.recentLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-2 py-1.5 border-b border-slate-800/20 last:border-0"
                  >
                    {log.status === 'success' ? (
                      <CheckCircle size={12} className="text-emerald-400/70 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-red-400/70 shrink-0" />
                    )}
                    <span
                      className={
                        log.status === 'success'
                          ? 'text-slate-400'
                          : 'text-red-400/70'
                      }
                    >
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
