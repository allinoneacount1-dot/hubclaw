import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Agent } from './services/api';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import AnalyticsView from './components/AnalyticsView';
import PromptLibrary from './components/PromptLibrary';
import OrchestrationPage from './components/OrchestrationPage';
import Documentation from './components/Documentation';
import ThemeToggle, { applyTheme } from './components/ThemeToggle';
import Toast from './components/Toast';
import BootScreen from './components/BootScreen';
import LandingPage from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { useAppStore } from './store';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';
import { api } from './services/api';

type View = 'dashboard' | 'command' | 'analytics' | 'prompts' | 'orchestration' | 'documentation';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { 
    theme, 
    setTheme, 
    agents, 
    setAgents, 
    pipelines, 
    createPipeline, 
    deletePipeline, 
    runPipeline, 
    addStep, 
    removeStep, 
    addToast,
    user
  } = useAppStore();

  const goToLanding = () => {
    setShowLanding(true);
    setView('dashboard');
    setSelectedAgent(null);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Load agents from API if user is logged in
    if (user) {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      if (data.agents.length > 0) {
        setAgents(data.agents);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

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
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AnimatePresence>
        {isBooting ? (
          <BootScreen key="boot" onComplete={() => setIsBooting(false)} />
        ) : showLanding ? (
          <LandingPage key="landing" onEnter={() => setShowLanding(false)} />
        ) : (
          <SolanaWalletProvider>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              key="main-app"
              className="min-h-screen"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                <ThemeToggle theme={theme} onThemeChange={setTheme} />
                {user ? (
                  <button
                    onClick={() => useAppStore.getState().signOut()}
                    className="px-3 py-1.5 text-xs rounded-lg border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-3 py-1.5 text-xs rounded-lg border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Sign In
                  </button>
                )}
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
                    onDocumentationClick={() => setView('documentation')}
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
                {view === 'documentation' && (
                  <Documentation
                    key="documentation"
                    onBack={handleBack}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </SolanaWalletProvider>
        )}
      </AnimatePresence>
    </div>
  );
}
