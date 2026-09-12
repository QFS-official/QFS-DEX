/**
 * Deterministic mock price series generator for the swap chart.
 *
 * Uses a seeded random walk with mean reversion so the chart looks realistic
 * and stable across re-renders for the same pair key. The last point always
 * matches the user-provided "current price" so the chart's right edge lines
 * up with the live ratio shown in the swap card.
 */

export interface PricePoint {
  /** Unix timestamp (ms) */
  t: number;
  /** Price (e.g. ratio of from/to token) */
  p: number;
  /** 24h-style volume bucket (mock) */
  v: number;
}

export type RangeId = "1h" | "24h" | "7d" | "30d";

interface RangeConfig {
  id: RangeId;
  label: string;
  /** Number of buckets */
  points: number;
  /** Bucket size in ms */
  bucketMs: number;
}

export const PRICE_RANGES: RangeConfig[] = [
  { id: "1h", label: "1H", points: 60, bucketMs: 60_000 },
  { id: "24h", label: "24H", points: 96, bucketMs: 15 * 60_000 },
  { id: "7d", label: "7D", points: 168, bucketMs: 60 * 60_000 },
  { id: "30d", label: "30D", points: 120, bucketMs: 6 * 60 * 60_000 },
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SeriesOptions {
  /** Pair key (e.g. "ETH-USDC-eth") used to seed the RNG so the curve is stable */
  pairKey: string;
  /** Range config */
  range: RangeConfig;
  /** Current price (last point) — the chart's right edge */
  currentPrice: number;
  /** Volatility as fraction of price (e.g. 0.02 = 2%) */
  volatility?: number;
}

export function generatePriceSeries({
  pairKey,
  range,
  currentPrice,
  volatility = 0.015,
}: SeriesOptions): PricePoint[] {
  if (!currentPrice || currentPrice <= 0) {
    return [];
  }
  const rand = mulberry32(hashString(pairKey));
  const now = Date.now();
  const total: PricePoint[] = [];

  // Build from the past forward, with mean reversion toward currentPrice
  // so the series converges to the right edge.
  let price = currentPrice * (1 - volatility * 3);
  for (let i = range.points; i > 0; i--) {
    // Mean reversion: pull price back toward the target
    const drift = (currentPrice - price) * 0.05;
    // Noise scaled by price and volatility
    const noise = (rand() - 0.5) * 2 * volatility * price;
    price = Math.max(price + drift + noise, currentPrice * 0.5);
    const volume = 0.5 + rand() * 2.5; // mock volume bucket 0.5–3 units
    total.push({
      t: now - i * range.bucketMs,
      p: price,
      v: volume,
    });
  }
  // Pin the last point to currentPrice
  total.push({ t: now, p: currentPrice, v: 1 + rand() * 2 });
  return total;
}

/**
 * Helper to format the X axis timestamp depending on the range.
 */
export function formatAxisTime(t: number, range: RangeId): string {
  const d = new Date(t);
  if (range === "1h") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "24h") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  // 7d / 30d — short date
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Helper to format the tooltip timestamp with a fuller representation.
 */
export function formatTooltipTime(t: number, range: RangeId): string {
  const d = new Date(t);
  if (range === "1h" || range === "24h") {
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
