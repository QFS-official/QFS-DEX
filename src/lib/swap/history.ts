"use client";

import { useSyncExternalStore } from "react";
import type { ChainId } from "@/lib/bridge/chains";
import { CHAINS } from "@/lib/bridge/chains";

export interface SwapRecord {
  id: string;
  timestamp: number;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  usdValue: number;
  chain: ChainId;
  chainName: string;
  txHash: string;
  status: "completed" | "pending" | "failed";
}

const STORAGE_KEY = "portal:swap-history";
const MAX_RECORDS = 30;

const EMPTY_HISTORY: SwapRecord[] = [];

// Snapshot cache — useSyncExternalStore requires referentially stable snapshots.
// `cacheInitialized` distinguishes "first read ever" from "raw is null".
let cachedHistoryRaw: string | null = null;
let cachedHistory: SwapRecord[] = EMPTY_HISTORY;
let cacheInitialized = false;

function safeParse(raw: string): SwapRecord[] {
  try {
    return JSON.parse(raw) as SwapRecord[];
  } catch {
    return DEMO_HISTORY;
  }
}

function readStorage(): SwapRecord[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cacheInitialized && raw === cachedHistoryRaw) return cachedHistory;
  cacheInitialized = true;
  cachedHistoryRaw = raw;
  if (raw == null) {
    // First visit — seed demo data so the panel isn't empty
    cachedHistory = DEMO_HISTORY;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_HISTORY));
    } catch {
      /* ignore quota */
    }
  } else {
    cachedHistory = safeParse(raw);
  }
  return cachedHistory;
}

/** Demo seed data shown on first visit (before any real swaps are recorded). */
const DEMO_HISTORY: SwapRecord[] = [
  {
    id: "demo-1",
    timestamp: Date.now() - 4 * 60_000,
    fromSymbol: "ETH",
    toSymbol: "USDC",
    fromAmount: 0.42,
    toAmount: 985.78,
    usdValue: 985.78,
    chain: "eth",
    chainName: "Ethereum",
    txHash: "0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8",
    status: "completed",
  },
  {
    id: "demo-2",
    timestamp: Date.now() - 38 * 60_000,
    fromSymbol: "BNB",
    toSymbol: "USDT",
    fromAmount: 1.25,
    toAmount: 724.5,
    usdValue: 724.5,
    chain: "bnb",
    chainName: "BNB Chain",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    status: "completed",
  },
  {
    id: "demo-3",
    timestamp: Date.now() - 3 * 3600_000,
    fromSymbol: "USDC",
    toSymbol: "ETH",
    fromAmount: 500,
    toAmount: 0.2127,
    usdValue: 500,
    chain: "eth",
    chainName: "Ethereum",
    txHash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    status: "completed",
  },
  {
    id: "demo-4",
    timestamp: Date.now() - 8 * 3600_000,
    fromSymbol: "POL",
    toSymbol: "USDC",
    fromAmount: 1200,
    toAmount: 504,
    usdValue: 504,
    chain: "polygon",
    chainName: "Polygon",
    txHash: "0xf1e2d3c4b5a6978e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
    status: "completed",
  },
  {
    id: "demo-5",
    timestamp: Date.now() - 26 * 3600_000,
    fromSymbol: "SOL",
    toSymbol: "USDC",
    fromAmount: 3.2,
    toAmount: 464,
    usdValue: 464,
    chain: "solana",
    chainName: "Solana",
    txHash: "0x5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4",
    status: "completed",
  },
];

function writeStorage(records: SwapRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
    window.dispatchEvent(new CustomEvent("portal:history-updated"));
  } catch {
    /* quota exceeded — silent fail */
  }
}

export interface NewSwapInput {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  usdValue: number;
  chain: ChainId;
  txHash: string;
  status?: SwapRecord["status"];
}

export function addSwapRecord(input: NewSwapInput): SwapRecord {
  const record: SwapRecord = {
    id: `swap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    fromSymbol: input.fromSymbol,
    toSymbol: input.toSymbol,
    fromAmount: input.fromAmount,
    toAmount: input.toAmount,
    usdValue: input.usdValue,
    chain: input.chain,
    chainName: CHAINS[input.chain]?.name ?? input.chain,
    txHash: input.txHash,
    status: input.status ?? "completed",
  };
  const next = [record, ...readStorage()].slice(0, MAX_RECORDS);
  writeStorage(next);
  return record;
}

export function clearHistory() {
  writeStorage([]);
}

function subscribeToHistory(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("portal:history-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("portal:history-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getHistorySnapshot(): SwapRecord[] {
  return readStorage();
}

function getHistoryServerSnapshot(): SwapRecord[] {
  return EMPTY_HISTORY;
}

/** Hook that subscribes to the swap history list. */
export function useSwapHistory(): {
  history: SwapRecord[];
  clear: () => void;
} {
  const history = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );
  return {
    history,
    clear: () => clearHistory(),
  };
}
