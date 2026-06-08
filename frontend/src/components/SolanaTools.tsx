import React from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { Wallet, Coins, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { ed25519 } from '@noble/curves/ed25519';
import { utf8 } from '@noble/curves/abstract/utils';

export function SolanaTools() {
  const { publicKey, signMessage, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { solanaWallet, setSolanaWallet, verifySolanaWallet, addToast } = useAppStore();
  const [balance, setBalance] = React.useState<number>(0);
  const [recipient, setRecipient] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  React.useEffect(() => {
    if (publicKey) {
      const getBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
          setSolanaWallet({ ...solanaWallet, publicKey: publicKey.toBase58() });
        } catch (err) {
          console.error('Failed to get balance:', err);
        }
      };
      getBalance();
    } else {
      setSolanaWallet({ publicKey: null, verified: false, signature: null });
    }
  }, [publicKey, connection, setSolanaWallet, solanaWallet]);

  const handleVerify = async () => {
    if (!publicKey || !signMessage) return;
    setIsVerifying(true);
    try {
      const message = `Verify wallet ownership for HubClaw at ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      
      // Verify signature client-side first
      const isValid = ed25519.verify(signature, encodedMessage, publicKey.toBytes());
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      await verifySolanaWallet(publicKey, signature, message);
    } catch (err) {
      console.error('Failed to verify:', err);
      addToast('error', 'Failed to verify wallet');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSend = async () => {
    if (!publicKey || !signTransaction) return;
    if (!recipient || !amount) return;

    setIsSending(true);
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');
      addToast('success', `Transaction sent! TXID: ${txid}`);
    } catch (err) {
      console.error('Failed to send:', err);
      addToast('error', 'Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border space-y-4"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Wallet size={16} />
        Solana Tools
      </h3>
      <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
        <Coins size={14} />
        {connected ? `${balance.toFixed(4)} SOL` : 'Not connected'}
      </div>
      {connected && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {solanaWallet.verified ? (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle2 size={14} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <AlertCircle size={14} /> Not verified
              </span>
            )}
          </div>
          {!solanaWallet.verified && (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full px-4 py-2 text-xs border rounded flex items-center justify-center gap-1 transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify Wallet'}
            </button>
          )}
          <div className="h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 text-xs border rounded"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Amount (SOL)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border rounded"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-4 py-2 text-xs border rounded flex items-center gap-1 transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              {isSending ? 'Sending...' : <><ArrowRight size={12} /> Send</>}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
