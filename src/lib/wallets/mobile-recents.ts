"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Catalog of mobile wallets shown in the WalletConnect QR modal.
 * Each entry has a brand gradient, glyph, official site (download page) and
 * per-platform App Store / Play Store URLs + a WC universal link base used
 * to deep-link into the mobile wallet app with the pairing URI.
 */
export interface MobileWallet {
  id: string;
  name: string;
  gradient: [string, string];
  glyph: string;
  /** Site / download page (desktop fallback) */
  url: string;
  /** App Store URL (iOS) */
  iosUrl: string;
  /** Play Store URL (Android) */
  androidUrl: string;
  /**
   * WC universal link base, e.g. `https://link.trustwallet.com/wc?uri=`.
   * On mobile, when the user clicks the tile we append the encoded WC URI
   * to this base, which opens the wallet app directly with the pairing
   * request. If the app isn't installed, the universal link falls back to
   * the App Store / Play Store entry for that wallet.
   */
  universalLink: string;
}

export const MOBILE_WALLETS: MobileWallet[] = [
  {
    id: "trust-mobile",
    name: "Trust Wallet",
    gradient: ["#3375BB", "#0EA88B"],
    glyph: "T",
    url: "https://www.trustwallet.com/download",
    iosUrl: "https://apps.apple.com/app/trust-wallet/id1288339409",
    androidUrl: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp",
    universalLink: "https://link.trustwallet.com/wc?uri=",
  },
  {
    id: "metamask-mobile",
    name: "MetaMask",
    gradient: ["#F6851B", "#E2761B"],
    glyph: "M",
    url: "https://metamask.io/download/",
    iosUrl: "https://apps.apple.com/us/app/metamask/id1438143602",
    androidUrl: "https://play.google.com/store/apps/details?id=io.metamask",
    universalLink: "https://metamask.app.link/wc?uri=",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    gradient: ["#0017FF", "#7B61FF"],
    glyph: "R",
    url: "https://rainbow.me/download",
    iosUrl: "https://apps.apple.com/us/app/rainbow-ethereum-wallet/id1457119021",
    androidUrl: "https://play.google.com/store/apps/details?id=me.rainbow",
    universalLink: "https://rainbow.me/wc?uri=",
  },
  {
    id: "coinbase-mobile",
    name: "Coinbase Wallet",
    gradient: ["#0052FF", "#1A56FF"],
    glyph: "C",
    url: "https://www.coinbase.com/wallet/downloads",
    iosUrl: "https://apps.apple.com/us/app/coinbase-wallet/id1278383455",
    androidUrl: "https://play.google.com/store/apps/details?id=org.coinbase.wallet",
    universalLink: "https://go.cbwallet.com/meWC?uri=",
  },
  {
    id: "binance-mobile",
    name: "Binance Web3",
    gradient: ["#F0B90B", "#F8D12F"],
    glyph: "B",
    url: "https://www.binance.com/en/web3wallet",
    iosUrl: "https://apps.apple.com/us/app/binance-buy-bitcoin-crypto/id1436400302",
    androidUrl: "https://play.google.com/store/apps/details?id=com.binance.dev",
    universalLink: "https://www.binance.com/en/web3wallet/wc?uri=",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    gradient: ["#2A2A2A", "#000000"],
    glyph: "O",
    url: "https://www.okx.com/web3/wallet",
    iosUrl: "https://apps.apple.com/us/app/okx-buy-bitcoin-crypto/id1327265475",
    androidUrl: "https://play.google.com/store/apps/details?id=com.okinc.okwallet",
    universalLink: "https://www.okx.com/walletconnect?uri=",
  },
  {
    id: "safepal",
    name: "SafePal",
    gradient: ["#3182FF", "#1E5BC6"],
    glyph: "S",
    url: "https://www.safepal.com/download",
    iosUrl: "https://apps.apple.com/us/app/safepal/id1548361220",
    androidUrl: "https://play.google.com/store/apps/details?id=com.safepal.wallet",
    universalLink: "https://link.safepal.com/wc?uri=",
  },
  {
    id: "exodus",
    name: "Exodus",
    gradient: ["#FF5E2C", "#D43A12"],
    glyph: "E",
    url: "https://www.exodus.com/download",
    iosUrl: "https://apps.apple.com/us/app/exodus-crypto-wallet/id1440046789",
    androidUrl: "https://play.google.com/store/apps/details?id=exodusmovement.exodus",
    universalLink: "https://www.exodus.com/wc?uri=",
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

// ─── Device detection ─────────────────────────────────────────────────────

export type DeviceKind = "ios" | "android" | "desktop";

function detectDevice(): DeviceKind {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  // iPad on iOS 13+ reports as Mac Safari, so check for touch + Mac
  const isIpad =
    ua.includes("macintosh") &&
    typeof document !== "undefined" &&
    "ontouchend" in document;
  if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod") ||
    isIpad
  ) {
    return "ios";
  }
  if (ua.includes("android")) return "android";
  return "desktop";
}

/**
 * Compute the right href for a mobile wallet tile based on the user's device
 * and whether we have a live WC pairing URI:
 *
 * - iOS / Android + has URI → universal link with the encoded URI appended
 *   (this opens the wallet app directly, or its App Store / Play Store page
 *   if not installed)
 * - iOS without URI → App Store page
 * - Android without URI → Play Store page
 * - Desktop → wallet.url (general download page)
 */
export function getWalletHref(
  wallet: MobileWallet,
  device: DeviceKind,
  uri: string | null,
): string {
  if (device === "desktop") return wallet.url;
  if (uri && uri.length > 0) {
    return wallet.universalLink + encodeURIComponent(uri);
  }
  if (device === "ios") return wallet.iosUrl;
  return wallet.androidUrl;
}

/**
 * Stable lazy hook for device detection. Returns "desktop" on the server and
 * during hydration, then re-renders with the real device after mount.
 * (setState is scheduled via setTimeout to satisfy react-hooks/set-state-in-effect.)
 */
export function useDevice(): DeviceKind {
  const [device, setDevice] = useState<DeviceKind>("desktop");
  useEffect(() => {
    const detected = detectDevice();
    if (detected === "desktop") return;
    const t = window.setTimeout(() => setDevice(detected), 0);
    return () => window.clearTimeout(t);
  }, []);
  return device;
}
