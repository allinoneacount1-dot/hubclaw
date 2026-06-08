import { motion } from 'framer-motion';
import { ArrowRight, Code, Zap, BarChart3, GitBranch, X } from 'lucide-react';
import { pageTransition, containerVariants, itemVariants } from '../utils/transitions';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{
            background: 'linear-gradient(135deg, #a3e635 0%, #22d3ee 100%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-50 flex flex-col min-h-screen items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full text-center"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-40 h-40 flex items-center justify-center">
                <img 
                  src="/logo-hubclaw.svg" 
                  alt="HubClaw Logo" 
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 40px rgba(34, 211, 238, 0.3))' }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-light tracking-widest"
                    style={{ color: 'var(--text-primary)' }}
                >
                  HubClaw
                </h1>
                <p className="text-sm font-mono tracking-widest"
                   style={{ color: 'var(--text-muted)' }}
                >
                  AI AGENT ORCHESTRATION
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight mb-4"
                style={{ color: 'var(--text-primary)' }}>
              <span className="inline-block bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)'
                    }}>
                Multi-Agent
              </span>
              <br />
              Workflows, Simplified
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto"
               style={{ color: 'var(--text-secondary)' }}>
              Build, orchestrate, and deploy AI agent pipelines with an intuitive,
              developer-first interface.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Zap, title: 'Real-time AI', desc: 'Instant responses from multiple models' },
              { icon: BarChart3, title: 'Analytics', desc: 'Track performance & token usage' },
              { icon: GitBranch, title: 'Branching', desc: 'Explore multiple conversation paths' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
                className="p-6 rounded-xl border backdrop-blur-sm"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)'
                }}
              >
                <feature.icon size={28} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl text-lg font-medium flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
              }}
            >
              Enter Dashboard
              <ArrowRight size={20} />
            </motion.button>
            <a
              href="https://github.com/allinoneacount1-dot/hubclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl text-lg font-medium flex items-center gap-2 border transition-all hover:border-[var(--accent)]/50"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <Code size={20} />
              View on GitHub
            </a>
            <a
              href="https://x.com/HubclawHq"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl text-lg font-medium flex items-center gap-2 border transition-all hover:border-[var(--accent)]/50"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={20} />
              Follow on X
            </a>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-sm font-mono"
                      style={{ color: 'var(--text-muted)' }}>
            © 2026 HubClaw. All rights reserved.
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
