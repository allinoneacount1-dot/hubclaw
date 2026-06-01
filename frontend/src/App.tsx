import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Agent, OrchestrationPipeline } from './services/api';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import AnalyticsView from './components/AnalyticsView';
import PromptLibrary from './components/PromptLibrary';
import OrchestrationPage from './components/OrchestrationPage';
import ThemeToggle, { applyTheme } from './components/ThemeToggle';
import type { ThemeMode } from './services/api';

type View = 'dashboard' | 'command' | 'analytics' | 'prompts' | 'orchestration';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [pipelines, setPipelines] = useState<OrchestrationPipeline[]>([]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setView('command');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedAgent(null);
  };

  const handleCreatePipeline = (name: string) => {
    const pipeline: OrchestrationPipeline = {
      id: `pipe-${Date.now()}`,
      name,
      steps: [],
      status: 'idle',
      createdAt: new Date().toISOString(),
    };
    setPipelines(prev => [...prev, pipeline]);
  };

  const handleDeletePipeline = (id: string) => {
    setPipelines(prev => prev.filter(p => p.id !== id));
  };

  const handleRunPipeline = (id: string) => {
    setPipelines(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'running' as const } : p
    ));
    // Simulate pipeline execution
    setTimeout(() => {
      setPipelines(prev => prev.map(p =>
        p.id === id ? { ...p, status: 'completed' as const, steps: p.steps.map(s => ({ ...s, status: 'completed' as const })) } : p
      ));
    }, 3000);
  };

  const handleAddStep = (pipelineId: string, agentId: string, input: string) => {
    // In real app, would fetch agent name from API
    const agentName = `Agent ${agentId}`;
    setPipelines(prev => prev.map(p =>
      p.id === pipelineId
        ? {
            ...p,
            steps: [...p.steps, {
              id: `step-${Date.now()}`,
              agentId,
              agentName,
              input,
              status: 'pending' as const,
            }]
          }
        : p
    ));
  };

  const handleRemoveStep = (pipelineId: string, stepId: string) => {
    setPipelines(prev => prev.map(p =>
      p.id === pipelineId
        ? { ...p, steps: p.steps.filter(s => s.id !== stepId) }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Global Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>

      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            onAgentClick={handleAgentClick}
            onAnalyticsClick={() => setView('analytics')}
            onPromptsClick={() => setView('prompts')}
            onOrchestrationClick={() => setView('orchestration')}
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
        {view === 'prompts' && (
          <PromptLibrary
            key="prompts"
            onBack={handleBack}
          />
        )}
        {view === 'orchestration' && (
          <OrchestrationPage
            key="orchestration"
            agents={[]}
            pipelines={pipelines}
            onCreatePipeline={handleCreatePipeline}
            onDeletePipeline={handleDeletePipeline}
            onRunPipeline={handleRunPipeline}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
