import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAppStore } from '../store';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  error: {
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    icon: 'text-amber-400',
  },
  info: {
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
  },
};

export default function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          const colors = colorMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border ${colors.bg} ${colors.border} backdrop-blur-md shadow-lg`}
            >
              <Icon size={18} className={`shrink-0 ${colors.icon}`} />
              <p className={`text-sm font-medium text-slate-200 max-w-xs`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
