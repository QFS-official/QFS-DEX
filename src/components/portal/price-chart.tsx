"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  PRICE_RANGES,
  formatAxisTime,
  formatTooltipTime,
  generatePriceSeries,
  type PricePoint,
  type RangeId,
} from "@/lib/swap/price-data";
import { motion } from "framer-motion";

interface Props {
  /** From token symbol, e.g. "ETH" */
  fromSymbol: string;
  /** To token symbol, e.g. "USDC" */
  toSymbol: string;
  /** Current price (ratio): 1 from = X to */
  currentPrice: number;
  /** Chain id (used to seed the series so each chain looks distinct) */
  chainKey: string;
}

export function PriceChart({ fromSymbol, toSymbol, currentPrice, chainKey }: Props) {
  const [rangeId, setRangeId] = useState<RangeId>("1h");
  const range = PRICE_RANGES.find((r) => r.id === rangeId) ?? PRICE_RANGES[0];

  const pairKey = `${fromSymbol}-${toSymbol}-${chainKey}`;
  const data: PricePoint[] = useMemo(
    () =>
      generatePriceSeries({
        pairKey,
        range,
        currentPrice,
        // Volatility tuned per range — longer ranges look more dramatic
        volatility: rangeId === "1h" ? 0.008 : rangeId === "24h" ? 0.012 : rangeId === "7d" ? 0.04 : 0.08,
      }),
    [pairKey, range, rangeId, currentPrice],
  );

  const first = data[0]?.p ?? currentPrice;
  const last = data[data.length - 1]?.p ?? currentPrice;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = changePct >= 0;
  const lineColor = isUp ? "#14F195" : "#ef4444";
  const lineColorSoft = isUp ? "rgba(20, 241, 149, 0.35)" : "rgba(239, 68, 68, 0.35)";

  const min = Math.min(...data.map((d) => d.p));
  const max = Math.max(...data.map((d) => d.p));
  const yPad = (max - min) * 0.1 || currentPrice * 0.01;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="portal-card rounded-3xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white">
              {fromSymbol}/{toSymbol}
            </span>
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
              QFS
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {last > 0 ? formatPrice(last) : "—"}
            </span>
            <span
              className={
                "inline-flex items-center gap-1 text-xs font-semibold " +
                (isUp ? "text-[#14F195]" : "text-[#ef4444]")
              }
            >
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isUp ? "+" : ""}
              {changePct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-white/[0.04] p-0.5 ring-1 ring-white/8">
          {PRICE_RANGES.map((r) => {
            const active = r.id === rangeId;
            return (
              <button
                key={r.id}
                onClick={() => setRangeId(r.id)}
                className={
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors " +
                  (active
                    ? "bg-white/10 text-white ring-1 ring-white/10"
                    : "text-muted-foreground hover:text-white")
                }
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[200px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`priceFill-${pairKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="t"
                tickFormatter={(t: number) => formatAxisTime(t, rangeId)}
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={[min - yPad, max + yPad]}
                tickFormatter={(v: number) => formatPrice(v)}
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={56}
                orientation="right"
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
                content={<ChartTooltip fromSymbol={fromSymbol} toSymbol={toSymbol} rangeId={rangeId} />}
              />
              <Area
                type="monotone"
                dataKey="p"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#priceFill-${pairKey})`}
                isAnimationActive={false}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: lineColor,
                  stroke: "#0b0a1f",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Selecciona un par para ver el gráfico
          </div>
        )}
      </div>

      {/* Footer mini-stats */}
      <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-muted-foreground">
        <Stat label="Mín 24h" value={formatPrice(min)} color="text-white/80" />
        <Stat label="Máx 24h" value={formatPrice(max)} color="text-white/80" />
        <Stat
          label="Volatilidad"
          value={`${(Math.abs(changePct) * 0.6).toFixed(2)}%`}
          color="text-white/80"
        />
      </div>

      {/* Subtle gradient line below header — matches chart color */}
      <div className="mt-3 h-px w-full" style={{ background: lineColorSoft }} />
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2 py-1.5 ring-1 ring-white/4">
      <span>{label}</span>
      <span className={"font-medium " + (color ?? "text-white/80")}>{value}</span>
    </div>
  );
}

interface TooltipPayload {
  payload?: PricePoint;
}
interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  fromSymbol: string;
  toSymbol: string;
  rangeId: RangeId;
}

function ChartTooltip({ active, payload, fromSymbol, toSymbol, rangeId }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0a1f]/95 px-3 py-2 shadow-lg backdrop-blur-md">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {formatTooltipTime(point.t, rangeId)}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-white">
        {formatPrice(point.p)} <span className="text-muted-foreground">{toSymbol}</span>
        <span className="ml-1 text-[10px] text-muted-foreground">por 1 {fromSymbol}</span>
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">
        Vol: {point.v.toFixed(2)}
      </div>
    </div>
  );
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(4);
  if (p >= 0.0001) return p.toFixed(6);
  return p.toExponential(2);
}
