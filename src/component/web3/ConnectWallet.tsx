"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";
import { useWeb3Store } from "@/hooks/useStore";
import { motion } from "framer-motion";
import { Wallet, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: (accounts: string[]) => void) => void;
      chainId?: string;
    };
  }
}

export function ConnectWallet() {
  const {
    address,
    isConnected,
    chainId,
    setAddress,
    setIsConnected,
    setChainId,
    setProvider,
    setSigner,
    reset,
  } = useWeb3Store();
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
      setChainId(Number(network.chainId));
    } catch (err: unknown) {
      console.error("Error connecting wallet:", err);
      if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
        setError("Connection rejected by user");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    reset();
    setError(null);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getExplorerUrl = () => {
    if (!address) return "";
    // Default to Etherscan, can be customized based on chainId
    if (chainId === 1) {
      return `https://etherscan.io/address/${address}`;
    } else if (chainId === 137) {
      return `https://polygonscan.com/address/${address}`;
    } else if (chainId === 11155111) {
      return `https://sepolia.etherscan.io/address/${address}`;
    }
    return `https://etherscan.io/address/${address}`;
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="group relative inline-flex items-center justify-center px-5 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wide transition-all hover:bg-indigo-500/20 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-2" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5 mr-2" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-zinc-300">
          {formatAddress(address!)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={copyAddress}
          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-all"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded transition-all"
          title="View on explorer"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={disconnectWallet}
          className="px-2 py-1 text-[10px] text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all uppercase font-bold"
          title="Disconnect"
        >
          Disconnect
        </button>
      </div>
    </motion.div>
  );
}

