import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus } from 'lucide-react';
import type { Agent } from '../services/api';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (agent: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'stars'>) => void;
  initialData?: Partial<Agent>;
}

const MODEL_OPTIONS = [
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'nvidia/nemotron-4-340b-instruct:free', label: 'Nemotron 4 340B (Free)' },
];

const DEFAULT_TOOLS = [
  'Web Search',
  'Python Sandbox',
  'GitHub Repo Manager',
  'Discord Webhook',
];

export default function CreateAgentModal({ isOpen, onClose, onCreate, initialData }: CreateAgentModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    system_prompt: initialData?.system_prompt || '',
    model_engine: initialData?.model_engine || 'gemini-1.5-flash',
    temperature: initialData?.temperature || 0.7,
    max_tokens: initialData?.max_tokens || 2048,
    tools_config: initialData?.tools_config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreate(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
              zIndex: 9998
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              zIndex: 9999
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {initialData ? 'Edit Agent' : 'Buat Agent Baru'}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Konfigurasi AI agent sesuai kebutuhanmu
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Nama Agent
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Data Analyst Pro"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      outlineColor: 'var(--accent)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi singkat tentang agent ini..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      outlineColor: 'var(--accent)',
                    }}
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  System Prompt
                </label>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="Peran dan instruksi utama untuk agent ini... e.g., Kamu adalah seorang data analyst yang ahli dalam menganalisis dataset dan memberikan insight yang actionable."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-sm"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    outlineColor: 'var(--accent)',
                  }}
                />
              </div>

              {/* Model & Params */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Model
                  </label>
                  <select
                    value={formData.model_engine}
                    onChange={(e) => setFormData({ ...formData, model_engine: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      outlineColor: 'var(--accent)',
                    }}
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Temperature: {formData.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor: 'var(--accent)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 2048 })}
                    min="256"
                    max="8192"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      outlineColor: 'var(--accent)',
                    }}
                  />
                </div>
              </div>

              {/* Tools */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Tools yang Tersedia
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {DEFAULT_TOOLS.map((tool) => (
                    <label key={tool} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer border"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.tools_config?.[tool] || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          tools_config: {
                            ...formData.tools_config,
                            [tool]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 rounded border"
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{tool}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Plus size={16} />
                  {initialData ? 'Simpan Perubahan' : 'Buat Agent'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
