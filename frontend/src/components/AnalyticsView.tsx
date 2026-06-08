import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { AnalyticsData } from '../services/api';
import { 
  ArrowLeft, TrendingUp, Clock, CheckCircle, XCircle, BarChart3, 
  Zap, Activity, PieChart, Target, Award
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import Breadcrumb from './Breadcrumb';

interface AnalyticsViewProps {
  onBack: () => void;
}

const COLORS = ['#22d3ee', '#8b5cf6', '#f59e0b', '#10b981'];

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

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

  const successCount = data?.recentLogs.filter(l => l.status === 'success').length || 0;
  const errorCount = data?.recentLogs.filter(l => l.status === 'error').length || 0;
  const pieData = [
    { name: 'Success', value: successCount, color: '#10b981' },
    { name: 'Error', value: errorCount, color: '#ef4444' }
  ];
  const totalTokens = data?.tokenTrends.reduce((a, b) => a + b.tokens, 0) || 0;
  const avgLatency = data?.latencyMatrix.length > 0
    ? Math.round(data.latencyMatrix.reduce((a, b) => a + b.latency, 0) / data.latencyMatrix.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', mass: 0.5, damping: 18 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Top Bar */}
      <div 
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
          borderBottomColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm transition-colors hover:text-cyan-400"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} />
            <span className="font-mono text-xs">Back to Dashboard</span>
          </button>
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Global Analytics</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Dashboard', onClick: onBack }, { label: 'Global Analytics' }]} />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            Loading analytics...
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Activity,
                  label: 'Total Executions',
                  value: data.totalExecutions,
                  suffix: '',
                  gradient: 'from-cyan-500 to-blue-600'
                },
                {
                  icon: Zap,
                  label: 'Avg Latency',
                  value: avgLatency,
                  suffix: 'ms',
                  gradient: 'from-purple-500 to-pink-600'
                },
                {
                  icon: TrendingUp,
                  label: 'Total Tokens',
                  value: totalTokens,
                  suffix: '',
                  gradient: 'from-green-500 to-emerald-600'
                },
                {
                  icon: Award,
                  label: 'Success Rate',
                  value: Math.round((successCount / (successCount + errorCount || 1)) * 100),
                  suffix: '%',
                  gradient: 'from-orange-500 to-yellow-600'
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className="relative overflow-hidden rounded-xl border p-6"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  {/* Background Glow */}
                  <div 
                    className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${stat.gradient}`}
                  />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                        <stat.icon size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        className="text-4xl font-light"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <AnimatedCounter value={stat.value} />
                      </motion.span>
                      {stat.suffix && (
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Token Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 rounded-xl border p-6"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Token Consumption</h3>
                  <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.tokenTrends}>
                      <defs>
                        <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tokens"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        fill="url(#tokenGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Success Rate Pie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border p-6"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Success Rate</h3>
                  <Target size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 -mt-8">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Latency Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl border p-6"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Latency Performance</h3>
                <Clock size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.latencyMatrix}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Bar
                      dataKey="latency"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    >
                      {data.latencyMatrix.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Live Success Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-xl border p-6"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
                <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="space-y-3">
                {data.recentLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {log.status === 'success' ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <span 
                      className="flex-1 font-mono text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {log.message}
                    </span>
                    <span 
                      className="text-[10px] font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString()}
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
