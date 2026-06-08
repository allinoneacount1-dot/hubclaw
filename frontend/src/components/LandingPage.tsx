// Landing Page - HubClaw
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, GitBranch } from 'lucide-react';
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
              {/* GitHub SVG Logo */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                <path d="M9 18c-4.51 2-5-2-7-2"></path>
              </svg>
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
              {/* X (Twitter) SVG Logo */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
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
