"use client";

import { useSyncExternalStore } from "react";

/**
 * Catalog of mobile wallets shown in the WalletConnect QR modal.
 * Each entry has a brand gradient, glyph, official site (download page) and
 * an optional `wcDeepLink` (universal link) used in production to open the
 * mobile wallet directly and pass the WC URI for instant pairing.
 */
export interface MobileWallet {
  id: string;
  name: string;
  gradient: [string, string];
  glyph: string;
  /** Site / download page */
  url: string;
  /** Universal link that opens the wallet on mobile (production) */
  wcDeepLink?: string;
}

export const MOBILE_WALLETS: MobileWallet[] = [
  {
    id: "trust-mobile",
    name: "Trust Wallet",
    gradient: ["#3375BB", "#0EA88B"],
    glyph: "T",
    url: "https://www.trustwallet.com/download",
    wcDeepLink: "https://link.trustwallet.com/wc?uri=",
  },
  {
    id: "metamask-mobile",
    name: "MetaMask",
    gradient: ["#F6851B", "#E2761B"],
    glyph: "M",
    url: "https://metamask.io/download/",
    wcDeepLink: "https://metamask.app.link/wc?uri=",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    gradient: ["#0017FF", "#7B61FF"],
    glyph: "R",
    url: "https://rainbow.me/download",
    wcDeepLink: "https://rainbow.me/wc?uri=",
  },
  {
    id: "coinbase-mobile",
    name: "Coinbase Wallet",
    gradient: ["#0052FF", "#1A56FF"],
    glyph: "C",
    url: "https://www.coinbase.com/wallet/downloads",
    wcDeepLink: "https://www.coinbase.com/walletlinks/wc?uri=",
  },
  {
    id: "binance-mobile",
    name: "Binance Web3",
    gradient: ["#F0B90B", "#F8D12F"],
    glyph: "B",
    url: "https://www.binance.com/en/web3wallet",
    wcDeepLink: "https://www.binance.com/en/web3wallet/wc?uri=",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    gradient: ["#2A2A2A", "#000000"],
    glyph: "O",
    url: "https://www.okx.com/web3/wallet",
    wcDeepLink: "https://www.okx.com/walletconnect?uri=",
  },
  {
    id: "safepal",
    name: "SafePal",
    gradient: ["#3182FF", "#1E5BC6"],
    glyph: "S",
    url: "https://www.safepal.com/download",
    wcDeepLink: "https://link.safepal.com/wc?uri=",
  },
  {
    id: "exodus",
    name: "Exodus",
    gradient: ["#FF5E2C", "#D43A12"],
    glyph: "E",
    url: "https://www.exodus.com/download",
    wcDeepLink: "https://www.exodus.com/wc?uri=",
  },
];

const STORAGE_KEY = "portal:mobile-wallet-recents";
const MAX_RECENTS = 6;
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;
let cacheInitialized = false;

function safeParse(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((v) => typeof v === "string").slice(0, MAX_RECENTS);
  } catch {
    return EMPTY;
  }
}

function readRaw(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cacheInitialized && raw === cachedRaw) return cachedList;
  cacheInitialized = true;
  cachedRaw = raw;
  cachedList = raw == null ? EMPTY : safeParse(raw);
  return cachedList;
}

function writeList(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const next = Array.from(new Set(ids)).slice(0, MAX_RECENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // bump the cache so useSyncExternalStore re-renders
    cachedRaw = window.localStorage.getItem(STORAGE_KEY);
    cachedList = next;
    window.dispatchEvent(new CustomEvent("portal:mobile-recents-updated"));
  } catch {
    /* quota exceeded */
  }
}

/**
 * Adds (or re-promotes to top) a mobile wallet id in the recents list.
 * Called when the user clicks on a wallet link in the QR modal.
 */
export function recordMobileWallet(id: string) {
  if (!id) return;
  const current = readRaw().filter((x) => x !== id);
  writeList([id, ...current]);
}

export function clearMobileRecents() {
  writeList([]);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("portal:mobile-recents-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("portal:mobile-recents-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string[] {
  return readRaw();
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

/**
 * Hook returning the list of recently-clicked mobile wallet IDs, sorted most-
 * recent-first. Persists to localStorage and stays in sync across tabs.
 */
export function useMobileWalletRecents(): {
  recents: string[];
  record: (id: string) => void;
  clear: () => void;
} {
  const recents = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    recents,
    record: recordMobileWallet,
    clear: clearMobileRecents,
  };
}
