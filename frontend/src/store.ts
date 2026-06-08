import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Agent, OrchestrationPipeline, TaskQueueItem } from './services/api';
import { supabase } from './config/supabase';
import { startSSE, api } from './services/api';
import type { User } from '@supabase/supabase-js';
import { PublicKey } from '@solana/web3.js';

interface AppState {
  // Auth
  user: User | null;
  session: any;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  signOut: () => Promise<void>;

  // Solana Wallet
  solanaWallet: {
    publicKey: string | null;
    verified: boolean;
    signature: string | null;
  };
  setSolanaWallet: (wallet: { publicKey: string | null; verified: boolean; signature: string | null }) => void;
  verifySolanaWallet: (publicKey: PublicKey, signature: Uint8Array) => Promise<void>;

  // Theme
  theme: 'dark' | 'light' | 'auto';
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;

  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  forkAgent: (agentId: string) => void;
  fetchAgents: () => Promise<void>;

  // Pipelines (Orchestration)
  pipelines: OrchestrationPipeline[];
  setPipelines: (pipelines: OrchestrationPipeline[]) => void;
  createPipeline: (name: string) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  runPipeline: (id: string) => Promise<void>;
  addStep: (pipelineId: string, agentId: string, agentName: string, input: string) => Promise<void>;
  removeStep: (pipelineId: string, stepId: string) => Promise<void>;
  fetchPipelines: () => Promise<void>;

  // Task Queue
  tasks: TaskQueueItem[];
  setTasks: (tasks: TaskQueueItem[]) => void;
  updateTask: (task: TaskQueueItem) => void;

  // Toast Notifications
  toasts: { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      let sseCleanup: (() => void) | null = null;

      return {
        // Auth
        user: null,
        session: null,
        setUser: (user) => {
          set({ user });
        },
        setSession: (session) => {
          set({ session });
          
          if (session?.access_token && !sseCleanup) {
            sseCleanup = startSSE(session.access_token, (event, data) => {
              if (event === 'task_update') {
                get().updateTask(data as TaskQueueItem);
              }
            });
          } else if (!session && sseCleanup) {
            sseCleanup();
            sseCleanup = null;
          }
        },
        signOut: async () => {
          await supabase.auth.signOut();
          if (sseCleanup) {
            sseCleanup();
            sseCleanup = null;
          }
          set({ user: null, session: null, solanaWallet: { publicKey: null, verified: false, signature: null } });
        },

        // Solana Wallet
        solanaWallet: {
          publicKey: null,
          verified: false,
          signature: null,
        },
        setSolanaWallet: (wallet) => set({ solanaWallet: wallet }),
        verifySolanaWallet: async (publicKey, signature) => {
          try {
            const user = get().user;
            if (!user) {
              get().addToast('error', 'Please sign in first');
              return;
            }
            const signatureStr = Buffer.from(signature).toString('base64');
            const { error } = await supabase
              .from('profiles')
              .update({
                solana_wallet_address: publicKey.toBase58(),
                solana_wallet_verified: true,
                solana_wallet_signature: signatureStr,
                solana_wallet_verified_at: new Date().toISOString(),
              })
              .eq('id', user.id);
            if (error) throw error;
            set({
              solanaWallet: {
                publicKey: publicKey.toBase58(),
                verified: true,
                signature: signatureStr,
              },
            });
            get().addToast('success', 'Solana wallet verified!');
          } catch (err) {
            console.error('Failed to verify wallet:', err);
            get().addToast('error', 'Failed to verify wallet');
          }
        },

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
        fetchAgents: async () => {
          try {
            const data = await api.getAgents();
            set({ agents: data.agents });
          } catch (err) {
            console.error('Failed to fetch agents:', err);
          }
        },

        // Pipelines
        pipelines: [],
        setPipelines: (pipelines) => set({ pipelines }),
        createPipeline: async (name) => {
          try {
            const data = await api.createPipeline(name);
            set((state) => ({ pipelines: [...state.pipelines, data.pipeline] }));
            get().addToast('success', `Pipeline "${name}" created!`);
          } catch (err) {
            console.error('Failed to create pipeline:', err);
            get().addToast('error', 'Failed to create pipeline');
          }
        },
        deletePipeline: async (id) => {
          try {
            const name = get().pipelines.find((p) => p.id === id)?.name;
            await api.deletePipeline(id);
            set((state) => ({ pipelines: state.pipelines.filter((p) => p.id !== id) }));
            if (name) get().addToast('info', `Pipeline "${name}" deleted`);
          } catch (err) {
            console.error('Failed to delete pipeline:', err);
            get().addToast('error', 'Failed to delete pipeline');
          }
        },
        runPipeline: async (id) => {
          try {
            set((state) => ({
              pipelines: state.pipelines.map((p) =>
                p.id === id ? { ...p, status: 'running' } : p
              ),
            }));
            await api.runPipeline(id);
            get().addToast('info', 'Pipeline started!');
            
            // Poll for updates
            let polling = true;
            let maxPolls = 60;
            let pollCount = 0;
            const pollInterval = setInterval(async () => {
              if (pollCount >= maxPolls || !polling) {
                clearInterval(pollInterval);
                return;
              }
              pollCount++;
              try {
                const data = await api.getPipelines();
                set({ pipelines: data.pipelines });
                const pipeline = data.pipelines.find(p => p.id === id);
                if (pipeline && (pipeline.status === 'completed' || pipeline.status === 'failed')) {
                  clearInterval(pollInterval);
                  get().addToast(pipeline.status === 'completed' ? 'success' : 'error', 
                    `Pipeline ${pipeline.status === 'completed' ? 'completed' : 'failed'}!`);
                }
              } catch (err) {
                console.error('Polling failed:', err);
              }
            }, 2000);
          } catch (err) {
            console.error('Failed to run pipeline:', err);
            get().addToast('error', 'Failed to run pipeline');
          }
        },
        addStep: async (pipelineId, agentId, agentName, input) => {
          try {
            const data = await api.addStep(pipelineId, { agentId, agentName, input });
            set((state) => ({
              pipelines: state.pipelines.map((p) =>
                p.id === pipelineId
                  ? {
                      ...p,
                      steps: [...p.steps, data.step],
                    }
                  : p
              ),
            }));
          } catch (err) {
            console.error('Failed to add step:', err);
            get().addToast('error', 'Failed to add step');
          }
        },
        removeStep: async (pipelineId, stepId) => {
          try {
            await api.removeStep(pipelineId, stepId);
            set((state) => ({
              pipelines: state.pipelines.map((p) =>
                p.id === pipelineId
                  ? { ...p, steps: p.steps.filter((s) => s.id !== stepId) }
                  : p
              ),
            }));
          } catch (err) {
            console.error('Failed to remove step:', err);
            get().addToast('error', 'Failed to remove step');
          }
        },
        fetchPipelines: async () => {
          try {
            const data = await api.getPipelines();
            set({ pipelines: data.pipelines });
          } catch (err) {
            console.error('Failed to fetch pipelines:', err);
          }
        },

        // Task Queue
        tasks: [],
        setTasks: (tasks) => set({ tasks }),
        updateTask: (task) => {
          set((state) => {
            const exists = state.tasks.find((t) => t.id === task.id);
            if (exists) {
              return {
                tasks: state.tasks.map((t) =>
                  t.id === task.id ? task : t
                ),
              };
            } else {
              return {
                tasks: [task, ...state.tasks],
              };
            }
          });
        },

        // Toasts
        toasts: [],
        addToast: (type, message) => {
          const id = `toast-${Date.now()}`;
          set((state) => ({
            toasts: [...state.toasts, { id, type, message }],
          }));
          setTimeout(() => {
            get().removeToast(id);
          }, 4000);
        },
        removeToast: (id) => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        },
      };
    },
    {
      name: 'hubclaw-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
