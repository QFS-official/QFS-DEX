"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAINS, type ChainId } from "@/lib/bridge/chains";

/**
 * EIP-1193 provider shape (subset that we use).
 */
type Eip1193Provider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type EthereumProvider = Eip1193Provider & {
  providers?: Eip1193Provider[];
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    coinbaseWalletExtension?: Eip1193Provider;
  }
}

export type WalletKind = "metamask" | "coinbase";

export interface WalletState {
  kind: WalletKind | null;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

const INITIAL: WalletState = {
  kind: null,
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
};

function pickProvider(kind: WalletKind): Eip1193Provider | null {
  if (typeof window === "undefined") return null;

  // Coinbase injects its own dedicated global in addition to window.ethereum
  if (kind === "coinbase" && window.coinbaseWalletExtension) {
    return window.coinbaseWalletExtension;
  }

  const ethereum = window.ethereum;
  if (!ethereum) return null;

  // Modern multi-injected provider wallets expose `providers`
  if (Array.isArray(ethereum.providers) && ethereum.providers.length) {
    const match = ethereum.providers.find((p) =>
      kind === "metamask" ? p.isMetaMask === true : p.isCoinbaseWallet === true,
    );
    if (match) return match;
  }

  // Single-injected fallback
  if (kind === "metamask" && ethereum.isMetaMask) return ethereum;
  if (kind === "coinbase" && ethereum.isCoinbaseWallet) return ethereum;
  return null;
}

function isWalletInstalled(kind: WalletKind): boolean {
  if (typeof window === "undefined") return false;
  if (kind === "coinbase" && window.coinbaseWalletExtension) return true;
  const eth = window.ethereum;
  if (!eth) return false;
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.some((p) =>
      kind === "metamask" ? p.isMetaMask === true : p.isCoinbaseWallet === true,
    );
  }
  return kind === "metamask" ? !!eth.isMetaMask : !!eth.isCoinbaseWallet;
}

function shortenAddress(addr: string | null): string | null {
  if (!addr) return null;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL);
  const [installed, setInstalled] = useState<Record<WalletKind, boolean>>({
    metamask: false,
    coinbase: false,
  });

  // Detect installed wallets on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setInstalled({
      metamask: isWalletInstalled("metamask"),
      coinbase: isWalletInstalled("coinbase"),
    });
  }, []);

  // Re-check installation whenever window.ethereum appears (extension late-injection)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const interval = window.setInterval(() => {
      const next = {
        metamask: isWalletInstalled("metamask"),
        coinbase: isWalletInstalled("coinbase"),
      };
      setInstalled((prev) => {
        if (prev.metamask === next.metamask && prev.coinbase === next.coinbase) return prev;
        return next;
      });
      if (cancelled) window.clearInterval(interval);
    }, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const connect = useCallback(async (kind: WalletKind) => {
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const provider = pickProvider(kind);
      if (!provider) {
        const which = kind === "metamask" ? "MetaMask" : "Coinbase Wallet";
        throw new Error(`${which} not detected. Please install the extension and refresh.`);
      }

      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts || !accounts.length) {
        throw new Error("No account returned by wallet.");
      }
      const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
      const chainId = chainIdHex ? parseInt(chainIdHex, 16) : null;

      setState({
        kind,
        address: accounts[0],
        chainId,
        isConnecting: false,
        error: null,
      });

      // Subscribe to account & chain changes
      provider.on?.("accountsChanged", (accounts: unknown) => {
        const next = (accounts as string[])?.[0] ?? null;
        setState((s) => ({ ...s, address: next }));
      });
      provider.on?.("chainChanged", (chainIdHex: unknown) => {
        const next = typeof chainIdHex === "string" ? parseInt(chainIdHex, 16) : null;
        setState((s) => ({ ...s, chainId: next }));
      });
    } catch (e) {
      const err = e as { code?: number; message?: string };
      // 4001 = user rejected request
      if (err?.code === 4001) {
        setState((s) => ({ ...s, isConnecting: false, error: "Connection request rejected." }));
      } else {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: err?.message ?? "Failed to connect wallet.",
        }));
      }
    }
  }, []);

  const disconnect = useCallback(() => setState(INITIAL), []);

  const switchChain = useCallback(async (chainId: ChainId) => {
    const chain = CHAINS[chainId];
    if (!chain || !chain.isEvm || !chain.evmChainIdHex) {
      // Solana cannot be switched via EIP-1193 — caller should handle this in UI
      return false;
    }
    const provider = state.kind ? pickProvider(state.kind) : null;
    if (!provider) return false;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.evmChainIdHex }],
      });
      return true;
    } catch (e) {
      const err = e as { code?: number };
      // 4902 — chain not added to wallet
      if (err?.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain.evmChainIdHex,
                chainName: chain.name,
                nativeCurrency: {
                  name: chain.nativeName,
                  symbol: chain.nativeSymbol,
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed.binance.org"],
                blockExplorerUrls: [chain.explorer],
              },
            ],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, [state.kind]);

  return {
    ...state,
    installed,
    shortAddress: shortenAddress(state.address),
    connect,
    disconnect,
    switchChain,
  };
}

export type UseWallet = ReturnType<typeof useWallet>;
