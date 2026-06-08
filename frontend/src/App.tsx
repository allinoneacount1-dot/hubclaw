import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Agent } from './services/api';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import AnalyticsView from './components/AnalyticsView';
import PromptLibrary from './components/PromptLibrary';
import OrchestrationPage from './components/OrchestrationPage';
import ThemeToggle, { applyTheme } from './components/ThemeToggle';
import Toast from './components/Toast';
import BootScreen from './components/BootScreen';
import LandingPage from './components/LandingPage';
import { useAppStore } from './store';

type View = 'dashboard' | 'command' | 'analytics' | 'prompts' | 'orchestration';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  
  const { theme, setTheme, agents, pipelines, createPipeline, deletePipeline, runPipeline, addStep, removeStep, addToast } = useAppStore();

  const goToLanding = () => {
    setShowLanding(true);
    setView('dashboard');
    setSelectedAgent(null);
  };

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

  const handleAddStep = (pipelineId: string, agentId: string, input: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      addStep(pipelineId, agentId, agent.name, input);
      addToast('success', 'Step added!');
    } else {
      addToast('error', 'Could not find selected agent, step not added');
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {isBooting ? (
          <BootScreen key="boot" onComplete={() => setIsBooting(false)} />
        ) : showLanding ? (
          <LandingPage key="landing" onEnter={() => setShowLanding(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            key="main-app"
            className="min-h-screen"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            {/* Global Theme Toggle - Fixed Position */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle theme={theme} onThemeChange={setTheme} />
            </div>

            <Toast />

            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <Dashboard
                  key="dashboard"
                  onAgentClick={handleAgentClick}
                  onAnalyticsClick={() => setView('analytics')}
                  onPromptsClick={() => setView('prompts')}
                  onOrchestrationClick={() => setView('orchestration')}
                  onGoToLanding={goToLanding}
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
                  agents={agents}
                  pipelines={pipelines}
                  onCreatePipeline={createPipeline}
                  onDeletePipeline={deletePipeline}
                  onRunPipeline={runPipeline}
                  onAddStep={handleAddStep}
                  onRemoveStep={removeStep}
                  onBack={handleBack}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
