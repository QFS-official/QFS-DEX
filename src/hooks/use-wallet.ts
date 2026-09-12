"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAINS, type ChainId } from "@/lib/bridge/chains";

/**
 * EIP-1193 provider shape (subset that we use).
 */
type Eip1193Provider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isBinance?: boolean;
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
    /** Coinbase Wallet dedicated global (in addition to window.ethereum) */
    coinbaseWalletExtension?: Eip1193Provider;
    /** Trust Wallet dedicated global (extension) */
    trustwallet?: Eip1193Provider;
    /** Binance Web3 Wallet / Binance Chain Wallet — separate EIP-1193 provider */
    BinanceChain?: Eip1193Provider;
  }
}

/**
 * Public RPC endpoints used when we need to add a chain to the user's wallet
 * (the wallet hasn't seen this chain before, error code 4902).
 */
const RPC_URLS: Record<ChainId, string> = {
  bnb: "https://bsc-dataseed.binance.org",
  polygon: "https://polygon-rpc.com",
  eth: "https://eth.llamarpc.com",
  solana: "", // not EVM — never used
};

export type WalletKind = "metamask" | "coinbase" | "trust" | "binance" | "walletconnect";

export interface WalletMeta {
  id: WalletKind;
  name: string;
  shortLabel: string;
  description: string;
  gradient: [string, string];
  glyph: string;
  /** URL to install the wallet (opened when wallet is not detected) */
  installUrl: string;
  /** true if this wallet is always "available" (a protocol, not an extension) */
  isProtocol?: boolean;
}

export const WALLETS: WalletMeta[] = [
  {
    id: "metamask",
    name: "MetaMask",
    shortLabel: "MetaMask",
    description: "Conéctate con la extensión de MetaMask",
    gradient: ["#F6851B", "#E2761B"],
    glyph: "M",
    installUrl: "https://metamask.io/download/",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    shortLabel: "Trust",
    description: "Conéctate con la extensión de Trust Wallet",
    gradient: ["#3375BB", "#0EA88B"],
    glyph: "T",
    installUrl: "https://www.trustwallet.com/download",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    shortLabel: "Coinbase",
    description: "Conéctate con la extensión de Coinbase Wallet",
    gradient: ["#0052FF", "#1A56FF"],
    glyph: "C",
    installUrl: "https://www.coinbase.com/wallet/downloads",
  },
  {
    id: "binance",
    name: "Binance Web3 Wallet",
    shortLabel: "Binance",
    description: "Conéctate con la Binance Web3 Wallet",
    gradient: ["#F0B90B", "#F8D12F"],
    glyph: "B",
    installUrl: "https://www.binance.com/en/web3wallet",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    shortLabel: "WC",
    description: "Escanea el QR con cualquier wallet móvil compatible",
    gradient: ["#3B99EF", "#627EEA"],
    glyph: "W",
    installUrl: "https://walletconnect.com/",
    isProtocol: true,
  },
];

export const WALLET_META: Record<WalletKind, WalletMeta> = WALLETS.reduce(
  (acc, w) => {
    acc[w.id] = w;
    return acc;
  },
  {} as Record<WalletKind, WalletMeta>,
);

export function getWalletMeta(kind: WalletKind | null): WalletMeta | null {
  if (!kind) return null;
  return WALLET_META[kind] ?? null;
}

export interface WalletState {
  kind: WalletKind | null;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  /** WalletConnect pairing URI (only when kind === "walletconnect" and pairing
   *  has been initiated but the mobile wallet hasn't scanned yet). */
  wcUri: string | null;
}

const INITIAL: WalletState = {
  kind: null,
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
  wcUri: null,
};

/**
 * Pick the EIP-1193 provider for a given wallet kind. Wallets that inject their
 * own dedicated global (`coinbaseWalletExtension`, `trustwallet`, `BinanceChain`)
 * are detected first; we then fall back to the multi-injected `window.ethereum`
 * with `providers` array, and finally to the single-injected `window.ethereum`.
 */
function pickProvider(kind: WalletKind): Eip1193Provider | null {
  if (typeof window === "undefined") return null;

  // Dedicated globals first
  if (kind === "coinbase" && window.coinbaseWalletExtension) {
    return window.coinbaseWalletExtension;
  }
  if (kind === "trust" && window.trustwallet) {
    return window.trustwallet;
  }
  if (kind === "binance" && window.BinanceChain) {
    return window.BinanceChain;
  }

  // Binance only ever exposes its dedicated global — never window.ethereum
  if (kind === "binance") return null;

  const ethereum = window.ethereum;
  if (!ethereum) return null;

  // Modern multi-injected provider wallets expose `providers`
  if (Array.isArray(ethereum.providers) && ethereum.providers.length) {
    const match = ethereum.providers.find((p) => {
      switch (kind) {
        case "metamask":
          return p.isMetaMask === true && p.isCoinbaseWallet !== true && p.isTrust !== true;
        case "coinbase":
          return p.isCoinbaseWallet === true;
        case "trust":
          return p.isTrust === true || p.isTrustWallet === true;
        default:
          return false;
      }
    });
    if (match) return match;
  }

  // Single-injected fallback
  if (kind === "metamask" && ethereum.isMetaMask) {
    // If the only provider is also tagged as Trust/Coinbase, skip — that's not MetaMask
    if (ethereum.isTrust || ethereum.isTrustWallet || ethereum.isCoinbaseWallet) return null;
    return ethereum;
  }
  if (kind === "coinbase" && ethereum.isCoinbaseWallet) return ethereum;
  if (kind === "trust" && (ethereum.isTrust || ethereum.isTrustWallet)) return ethereum;
  return null;
}

function isWalletInstalled(kind: WalletKind): boolean {
  if (typeof window === "undefined") return false;
  if (kind === "coinbase" && window.coinbaseWalletExtension) return true;
  if (kind === "trust" && window.trustwallet) return true;
  if (kind === "binance" && window.BinanceChain) return true;
  const eth = window.ethereum;
  if (kind === "binance") return false; // Binance only via dedicated global
  if (!eth) return false;
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.some((p) => {
      switch (kind) {
        case "metamask":
          return p.isMetaMask === true && p.isCoinbaseWallet !== true && p.isTrust !== true;
        case "coinbase":
          return p.isCoinbaseWallet === true;
        case "trust":
          return p.isTrust === true || p.isTrustWallet === true;
        default:
          return false;
      }
    });
  }
  if (kind === "metamask") {
    return !!eth.isMetaMask && !eth.isTrust && !eth.isTrustWallet && !eth.isCoinbaseWallet;
  }
  if (kind === "coinbase") return !!eth.isCoinbaseWallet;
  if (kind === "trust") return !!eth.isTrust || !!eth.isTrustWallet;
  return false;
}

function shortenAddress(addr: string | null): string | null {
  if (!addr) return null;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const EMPTY_INSTALLED: Record<WalletKind, boolean> = {
  metamask: false,
  coinbase: false,
  trust: false,
  binance: false,
  walletconnect: true, // protocol — always available
};

function readInstalled(): Record<WalletKind, boolean> {
  if (typeof window === "undefined") return EMPTY_INSTALLED;
  return {
    metamask: isWalletInstalled("metamask"),
    coinbase: isWalletInstalled("coinbase"),
    trust: isWalletInstalled("trust"),
    binance: isWalletInstalled("binance"),
    walletconnect: true, // protocol — always available
  };
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL);
  const [installed, setInstalled] = useState<Record<WalletKind, boolean>>(EMPTY_INSTALLED);

  // Detect installed wallets on mount
  useEffect(() => {
    setInstalled(readInstalled());
  }, []);

  // Re-check installation whenever window.ethereum appears (extension late-injection)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const interval = window.setInterval(() => {
      const next = readInstalled();
      setInstalled((prev) => {
        if (
          prev.metamask === next.metamask &&
          prev.coinbase === next.coinbase &&
          prev.trust === next.trust &&
          prev.binance === next.binance &&
          prev.walletconnect === next.walletconnect
        ) {
          return prev;
        }
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
    setState((s) => ({ ...s, isConnecting: true, error: null, wcUri: null }));
    try {
      // ─── WalletConnect: protocol-based, no extension to detect ───
      if (kind === "walletconnect") {
        // Generate a WalletConnect-format pairing URI.
        // In production you'd initialize EthereumProvider.init({ projectId })
        // and listen for `display_uri` → here we generate a demo URI so the
        // full UI flow works without registering a WC projectId.
        const topic = Math.random().toString(16).slice(2).padEnd(64, "0");
        const symKey = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("");
        const relayProtocol = "waku";
        const uri = `wc:${topic}@2?relay-protocol=${relayProtocol}&symKey=${symKey}`;

        setState({
          kind: "walletconnect",
          address: null,
          chainId: null,
          isConnecting: true,
          error: null,
          wcUri: uri,
        });
        // Wait for the user to scan the QR (or simulate scan via simulateWCScan())
        return;
      }

      const provider = pickProvider(kind);
      if (!provider) {
        const meta = WALLET_META[kind];
        throw new Error(
          `${meta.name} no detectado. Instala la extensión y recarga la página.`,
        );
      }

      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts || !accounts.length) {
        throw new Error("La wallet no devolvió ninguna cuenta.");
      }
      const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
      const chainId = chainIdHex ? parseInt(chainIdHex, 16) : null;

      setState({
        kind,
        address: accounts[0],
        chainId,
        isConnecting: false,
        error: null,
        wcUri: null,
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
      if (err?.code === 4001) {
        setState((s) => ({ ...s, isConnecting: false, error: "Solicitud de conexión rechazada." }));
      } else {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: err?.message ?? "Error al conectar la wallet.",
        }));
      }
    }
  }, []);

  /**
   * Simulate a successful WalletConnect scan (mobile wallet scanned the QR and
   * approved the session). In production this would be triggered by the WC
   * provider's `connect` event — but in demo mode we let the user click a
   * button or it auto-fires after a delay.
   */
  const simulateWCScan = useCallback(() => {
    // Generate a plausible-looking EVM address (not a real one — for demo)
    const randomAddr = "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    setState({
      kind: "walletconnect",
      address: randomAddr,
      chainId: 1, // Ethereum mainnet by default
      isConnecting: false,
      error: null,
      wcUri: null,
    });
  }, []);

  const cancelWC = useCallback(() => {
    setState((s) => ({
      ...s,
      isConnecting: false,
      wcUri: null,
      error: s.kind === "walletconnect" ? null : s.error,
    }));
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
                rpcUrls: [RPC_URLS[chain.id] ?? "https://rpc.ankr.com/eth"],
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
    simulateWCScan,
    cancelWC,
  };
}

export type UseWallet = ReturnType<typeof useWallet>;
