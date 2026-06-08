import React from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const CustomWalletButton = () => {
  const { publicKey, disconnect, wallets, select } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-sm border rounded-full transition-all duration-300 flex items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)]"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      }}
    >
      <Wallet size={16} />
      {publicKey ? (
        <span className="font-mono">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>
  );
};

export function WalletButton() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = React.useState<number>(0);

  React.useEffect(() => {
    if (publicKey) {
      const getBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Failed to get balance:', err);
        }
      };
      getBalance();
    }
  }, [publicKey, connection]);

  return (
    <div className="flex items-center gap-3">
      {publicKey && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-mono px-3 py-1.5 rounded-full border flex items-center gap-1"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
          }}
        >
          <span className="text-[var(--accent)]">◎</span>
          {balance.toFixed(2)}
        </motion.div>
      )}
      <CustomWalletButton />
    </div>
  );
}
