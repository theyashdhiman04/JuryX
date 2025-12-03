"use client";

import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { useWeb3Store } from "@/hooks/useStore";

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

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const {
    setAddress,
    setIsConnected,
    setChainId,
    setProvider,
    setSigner,
    reset,
  } = useWeb3Store();
  const [, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        setIsInitialized(true);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();

          setProvider(provider);
          setSigner(signer);
          setAddress(address);
          setIsConnected(true);
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error("Error initializing Web3:", error);
        reset();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeWeb3();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          reset();
        } else {
          initializeWeb3();
        }
      };

      const handleChainChanged = () => {
        initializeWeb3();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [setAddress, setIsConnected, setChainId, setProvider, setSigner, reset]);

  return <>{children}</>;
}

