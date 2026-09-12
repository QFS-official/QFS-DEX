"use client";

import { useSyncExternalStore } from "react";
import type { ChainId } from "@/lib/bridge/chains";

export interface FavoritePair {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  chain: ChainId;
  /** ISO timestamp when the pair was favorited */
  addedAt: number;
}

const STORAGE_KEY = "portal:swap-favorites-v2";

const DEFAULT_FAVORITES: FavoritePair[] = [
  { id: "fav-eth-qfs", fromSymbol: "ETH", toSymbol: "QFS", chain: "eth", addedAt: Date.now() - 7 * 86_400_000 },
  { id: "fav-eth-usdc", fromSymbol: "ETH", toSymbol: "USDC", chain: "eth", addedAt: Date.now() - 6 * 86_400_000 },
  { id: "fav-bnb-usdt", fromSymbol: "BNB", toSymbol: "USDT", chain: "bnb", addedAt: Date.now() - 5 * 86_400_000 },
  { id: "fav-pol-usdc", fromSymbol: "POL", toSymbol: "USDC", chain: "polygon", addedAt: Date.now() - 3 * 86_400_000 },
  { id: "fav-sol-usdc", fromSymbol: "SOL", toSymbol: "USDC", chain: "solana", addedAt: Date.now() - 1 * 86_400_000 },
];

const EMPTY_FAVORITES: FavoritePair[] = [];

// Snapshot cache — useSyncExternalStore requires referentially stable snapshots.
// We cache the parsed list keyed on the raw string so unchanged state returns
// the same array reference (otherwise React re-renders infinitely).
// `cacheInitialized` distinguishes "first read ever" from "raw is null".
let cachedFavoritesRaw: string | null = null;
let cachedFavorites: FavoritePair[] = EMPTY_FAVORITES;
let cacheInitialized = false;

function safeParse(raw: string): FavoritePair[] {
  try {
    return JSON.parse(raw) as FavoritePair[];
  } catch {
    return DEFAULT_FAVORITES;
  }
}

function readStorage(): FavoritePair[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cacheInitialized && raw === cachedFavoritesRaw) return cachedFavorites;
  cacheInitialized = true;
  cachedFavoritesRaw = raw;
  if (raw == null) {
    // First visit — seed defaults so the UI isn't empty
    cachedFavorites = DEFAULT_FAVORITES;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITES));
    } catch {
      /* ignore quota */
    }
  } else {
    cachedFavorites = safeParse(raw);
  }
  return cachedFavorites;
}

function writeStorage(list: FavoritePair[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("portal:favorites-updated"));
  } catch {
    /* quota exceeded — silent fail */
  }
}

/** Returns true if the given pair is in favorites. */
function isFavorited(list: FavoritePair[], from: string, to: string, chain: ChainId): boolean {
  return list.some(
    (f) => f.fromSymbol === from && f.toSymbol === to && f.chain === chain,
  );
}

/** Toggle a pair in/out of favorites. Returns the new list. */
export function toggleFavorite(
  from: string,
  to: string,
  chain: ChainId,
): FavoritePair[] {
  const list = readStorage();
  const existing = list.findIndex(
    (f) => f.fromSymbol === from && f.toSymbol === to && f.chain === chain,
  );
  if (existing >= 0) {
    const next = list.filter((_, i) => i !== existing);
    writeStorage(next);
    return next;
  }
  const next = [
    { id: `fav-${from}-${to}-${chain}`, fromSymbol: from, toSymbol: to, chain, addedAt: Date.now() },
    ...list,
  ];
  writeStorage(next);
  return next;
}

function subscribeToFavorites(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("portal:favorites-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("portal:favorites-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getFavoritesSnapshot(): FavoritePair[] {
  return readStorage();
}

function getFavoritesServerSnapshot(): FavoritePair[] {
  return EMPTY_FAVORITES;
}

/**
 * Subscribe to favorites list. Re-renders when favorites change anywhere in
 * the app (uses a custom event so all instances stay in sync).
 */
export function useFavorites(): {
  favorites: FavoritePair[];
  isFavorite: (from: string, to: string, chain: ChainId) => boolean;
  toggle: (from: string, to: string, chain: ChainId) => void;
} {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot,
  );

  return {
    favorites,
    isFavorite: (from, to, chain) => isFavorited(favorites, from, to, chain),
    toggle: (from, to, chain) => {
      const next = toggleFavorite(from, to, chain);
      // The event dispatched by writeStorage triggers the snapshot re-read
      // via useSyncExternalStore. No local setState needed.
      void next;
    },
  };
}
