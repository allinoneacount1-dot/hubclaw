import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Agent } from './services/api';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import AnalyticsView from './components/AnalyticsView';

type View = 'dashboard' | 'command' | 'analytics';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setView('command');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedAgent(null);
  };

  const handleAnalyticsClick = () => {
    setView('analytics');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            onAgentClick={handleAgentClick}
            onAnalyticsClick={handleAnalyticsClick}
          />
        )}
        {view === 'command' && selectedAgent && (
          <CommandCenter
            key="command"
            agent={selectedAgent}
            onBack={handleBack}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsView
            key="analytics"
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
