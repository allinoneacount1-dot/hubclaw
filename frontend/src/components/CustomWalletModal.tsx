import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Wallet } from 'lucide-react';

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
  const { wallets, select } = useWallet();

  const handleSelect = (walletName: string) => {
    select(walletName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Connect Wallet
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Wallet List */}
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleSelect(wallet.adapter.name)}
                  disabled={!wallet.readyState || wallet.readyState !== 'Installed'}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all hover:border-[var(--accent)] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    {wallet.adapter.icon ? (
                      <img
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        className="w-6 h-6"
                      />
                    ) : (
                      <Wallet size={20} style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {wallet.adapter.name}
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {wallet.readyState === 'Installed' ? 'Ready' : 'Not installed'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
