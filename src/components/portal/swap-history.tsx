"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ExternalLink, Trash2, XCircle } from "lucide-react";
import { useSwapHistory, type SwapRecord } from "@/lib/swap/history";
import { CHAINS } from "@/lib/bridge/chains";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  /** Optional limit on how many records to display */
  limit?: number;
}

export function SwapHistory({ limit = 8 }: Props) {
  const { history, clear } = useSwapHistory();
  const records = history.slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="portal-card flex flex-col overflow-hidden rounded-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#8b7cf6]" />
          <h3 className="text-sm font-semibold text-white">Swaps recientes</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            {history.length} {history.length === 1 ? "registro" : "registros"}
          </span>
          {history.length > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (confirm("¿Borrar todo el historial de swaps?")) clear();
                    }}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-300"
                    aria-label="Borrar historial"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  Borrar historial
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto portal-scroll-hidden">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
            <Clock className="h-6 w-6 text-muted-foreground/40" />
            <div className="text-sm text-muted-foreground">
              Aún no has hecho swaps.
            </div>
            <div className="text-[11px] text-muted-foreground/70">
              Tu historial aparecerá aquí.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {records.map((r, i) => (
              <HistoryRow key={r.id} record={r} index={i} />
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

function HistoryRow({ record, index }: { record: SwapRecord; index: number }) {
  const explorer = CHAINS[record.chain]?.explorer ?? "#";
  const timeAgoText = formatRelativeTime(record.timestamp);

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
    >
      {/* Status icon */}
      <StatusIcon status={record.status} />

      {/* Pair + amount */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-white">
          <span>{record.fromSymbol}</span>
          <span className="text-muted-foreground">→</span>
          <span>{record.toSymbol}</span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {trimNum(record.fromAmount)} {record.fromSymbol} ·{" "}
          <span className="text-white/60">{trimNum(record.toAmount)} {record.toSymbol}</span>
        </div>
      </div>

      {/* Right side: USD value, chain, time, link */}
      <div className="flex flex-col items-end gap-1 text-right">
        <div className="text-xs font-semibold text-white">
          ${record.usdValue.toFixed(2)}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{record.chainName}</span>
          <span>·</span>
          <span title={new Date(record.timestamp).toLocaleString()}>{timeAgoText}</span>
        </div>
        <a
          href={`${explorer}/tx/${record.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] text-[#8b7cf6] transition-colors hover:text-white"
          title="Ver en el explorador"
        >
          {record.txHash.slice(0, 6)}…{record.txHash.slice(-4)}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </motion.li>
  );
}

function StatusIcon({ status }: { status: SwapRecord["status"] }) {
  if (status === "completed") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14F195]/10 ring-1 ring-[#14F195]/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#14F195]" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Completado</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (status === "pending") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Pendiente</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
            <XCircle className="h-3.5 w-3.5 text-red-300" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">Fallido</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function trimNum(n: number): string {
  if (n >= 1000) return n.toFixed(0);
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "hace segundos";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  const mo = Math.floor(d / 30);
  return `hace ${mo} m`;
}
