import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_STEPS = [
  "BIOS Initialization...",
  "Loading Kernel...",
  "Mounting File Systems...",
  "Initializing Network...",
  "Starting HubClaw OS...",
  "Ready!"
];

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stepIndex < BOOT_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setStepIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [stepIndex]);

  useEffect(() => {
    const target = (stepIndex + 1) * (100 / BOOT_STEPS.length);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= target) {
          clearInterval(interval);
          if (stepIndex === BOOT_STEPS.length - 1) {
            setTimeout(onComplete, 1000);
          }
          return target;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [stepIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Centered Content */}
      <div className="flex flex-col items-center gap-12 max-w-md w-full px-6">
        {/* Logo Animation */}
        <div className="relative">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -360, y: -50 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
            className="relative"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)",
                  "0 0 40px rgba(139, 92, 246, 0.7), 0 0 80px rgba(34, 211, 238, 0.4)",
                  "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="p-6 rounded-3xl"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <img
                src="/logo-hubclaw.svg"
                alt="HubClaw Logo"
                className="w-48 h-auto"
                style={{ filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.6))' }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Boot Text */}
        <div className="w-full space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <span className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                {BOOT_STEPS[stepIndex]}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden border"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <motion.div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #22d3ee, #8b5cf6)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Progress Text */}
          <motion.div
            className="text-center font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {Math.round(progress)}% Complete
          </motion.div>
        </div>

        {/* OS-like Footer */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              HubClaw OS v1.0
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              •
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              System Ready
            </span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)', opacity: 0.5 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
