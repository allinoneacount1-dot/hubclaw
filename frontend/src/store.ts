import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Agent, OrchestrationPipeline } from './services/api';

interface PipelineStep {
  id: string;
  agentId: string;
  agentName: string;
  input: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface AppState {
  // Theme
  theme: 'dark' | 'light' | 'auto';
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;

  // Agents (mock + real)
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  forkAgent: (agentId: string) => void;

  // Pipelines (Orchestration)
  pipelines: OrchestrationPipeline[];
  setPipelines: (pipelines: OrchestrationPipeline[]) => void;
  createPipeline: (name: string) => void;
  deletePipeline: (id: string) => void;
  runPipeline: (id: string) => void;
  addStep: (pipelineId: string, agentId: string, agentName: string, input: string) => void;
  removeStep: (pipelineId: string, stepId: string) => void;

  // Toast Notifications
  toasts: { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Agents
      agents: [],
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
      forkAgent: (agentId) => {
        const agent = get().agents.find((a) => a.id === agentId);
        if (!agent) return;
        const newAgent: Agent = {
          ...agent,
          id: `agent-${Date.now()}`,
          name: `${agent.name} (Fork)`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ agents: [...state.agents, newAgent] }));
        get().addToast('success', `Agent "${agent.name}" forked successfully!`);
      },

      // Pipelines
      pipelines: [],
      setPipelines: (pipelines) => set({ pipelines }),
      createPipeline: (name) => {
        const newPipeline: OrchestrationPipeline = {
          id: `pipe-${Date.now()}`,
          name,
          steps: [],
          status: 'idle',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ pipelines: [...state.pipelines, newPipeline] }));
        get().addToast('success', `Pipeline "${name}" created!`);
      },
      deletePipeline: (id) => {
        const name = get().pipelines.find((p) => p.id === id)?.name;
        set((state) => ({ pipelines: state.pipelines.filter((p) => p.id !== id) }));
        if (name) get().addToast('info', `Pipeline "${name}" deleted`);
      },
      runPipeline: (id) => {
        set((state) => ({
          pipelines: state.pipelines.map((p) =>
            p.id === id ? { ...p, status: 'running' } : p
          ),
        }));
        // Simulate pipeline execution
        setTimeout(() => {
          set((state) => ({
            pipelines: state.pipelines.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: 'completed',
                    steps: p.steps.map((s: PipelineStep) => ({ ...s, status: 'completed' })),
                  }
                : p
            ),
          }));
          get().addToast('success', 'Pipeline completed!');
        }, 3000);
      },
      addStep: (pipelineId, agentId, agentName, input) => {
        set((state) => ({
          pipelines: state.pipelines.map((p) =>
            p.id === pipelineId
              ? {
                  ...p,
                  steps: [
                    ...p.steps,
                    {
                      id: `step-${Date.now()}`,
                      agentId,
                      agentName,
                      input,
                      status: 'pending' as const,
                    },
                  ],
                }
              : p
          ),
        }));
      },
      removeStep: (pipelineId, stepId) => {
        set((state) => ({
          pipelines: state.pipelines.map((p) =>
            p.id === pipelineId
              ? { ...p, steps: p.steps.filter((s: PipelineStep) => s.id !== stepId) }
              : p
          ),
        }));
      },

      // Toasts
      toasts: [],
      addToast: (type, message) => {
        const id = `toast-${Date.now()}`;
        set((state) => ({
          toasts: [...state.toasts, { id, type, message }],
        }));
        // Auto remove after 4 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: 'hubclaw-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        agents: state.agents,
        pipelines: state.pipelines,
      }),
    }
  )
);
