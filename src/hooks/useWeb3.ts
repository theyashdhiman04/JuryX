"use client";

import { useWeb3Store } from "@/hooks/useStore";
import { BrowserProvider } from "ethers";
import { useCallback } from "react";

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

export function useWeb3() {
  const {
    address,
    isConnected,
    chainId,
    provider,
    signer,
    setAddress,
    setIsConnected,
    setChainId,
    setProvider,
    setSigner,
    reset,
  } = useWeb3Store();

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not detected");
    }

    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    setProvider(provider);
    setSigner(signer);
    setAddress(address);
    setIsConnected(true);
    setChainId(Number(network.chainId));

    return { address, provider, signer };
  }, [setAddress, setIsConnected, setChainId, setProvider, setSigner]);

  const disconnect = useCallback(() => {
    reset();
  }, [reset]);

  const signMessage = useCallback(
    async (message: string) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }
      return await signer.signMessage(message);
    },
    [signer]
  );

  const sendTransaction = useCallback(
    async (tx: {
      to: string;
      value?: bigint;
      data?: string;
    }) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }
      return await signer.sendTransaction(tx);
    },
    [signer]
  );

  const switchNetwork = useCallback(
    async (chainId: number) => {
      if (!window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error: unknown) {
        // If chain doesn't exist, try to add it
        if (error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 4902) {
          throw new Error("Network not found. Please add it manually.");
        }
        throw error;
      }
    },
    []
  );

  return {
    address,
    isConnected,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    switchNetwork,
  };
}

