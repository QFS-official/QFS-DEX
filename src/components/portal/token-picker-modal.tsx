"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  ClipboardPaste,
  LayoutGrid,
  List,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CHAINS,
  CHAIN_LIST,
  type BridgeToken,
  type ChainId,
} from "@/lib/bridge/chains";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tokens available for the current chain */
  tokens: BridgeToken[];
  /** Current chain id (controls the network filter's selected tab) */
  currentChain: ChainId;
  /** Side this picker is selecting for — affects the title ("pagar" vs "recibir") */
  side: "de" | "a";
  /** Currently-selected symbol (highlighted in the list) */
  currentSymbol: string | null;
  onSelect: (token: BridgeToken) => void;
  /** Optional: callback when the user picks a network tab (lets the parent
   *  re-derive the token list for that chain) */
  onChainChange?: (chain: ChainId) => void;
}

type FilterId = "favorites" | "all" | "grid" | ChainId | "more";

const FILTER_CHAIN_ORDER: ChainId[] = ["eth", "bnb", "polygon", "solana"];

export function TokenPickerModal({
  open,
  onClose,
  tokens,
  currentChain,
  side,
  currentSymbol,
  onSelect,
  onChainChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const { toast } = useToast();

  // Reset query + filter whenever the modal opens
  useEffect(() => {
    if (open) {
      const t1 = window.setTimeout(() => {
        setQuery("");
        setFilter("all");
      }, 0);
      return () => window.clearTimeout(t1);
    }
  }, [open]);

  // Filter tokens by query (name or symbol or address substring)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        // Match against any of the per-chain contract addresses
        Object.values(t.addressByChain).some((addr) =>
          typeof addr === "string" && addr !== "native"
            ? addr.toLowerCase().includes(q)
            : false,
        )
      );
    });
  }, [tokens, query]);

  // Sort: tokens with verified badge first, then by USD price desc (Populares)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (!!a.verified !== !!b.verified) return a.verified ? -1 : 1;
      return (b.usdPrice || 0) - (a.usdPrice || 0);
    });
  }, [filtered]);

  function handlePasteCA() {
    navigator.clipboard?.readText().then((text) => {
      const addr = text.trim();
      if (!addr) {
        toast({
          title: "Portapapeles vacío",
          description: "Copia una dirección de contrato primero.",
          variant: "destructive",
        });
        return;
      }
      setQuery(addr);
      toast({
        title: "Dirección pegada",
        description: `${addr.slice(0, 10)}…${addr.slice(-6)}`,
      });
    }).catch(() => {
      toast({
        title: "No se pudo leer el portapapeles",
        description: "Permite el acceso o pega la dirección manualmente.",
        variant: "destructive",
      });
    });
  }

  function handleSelect(token: BridgeToken) {
    onSelect(token);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="portal-card max-h-[90vh] overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <div className="relative flex shrink-0 items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Selecciona el token para {side === "de" ? "pagar" : "recibir"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {filtered.length} tokens disponibles
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="portal-scroll-hidden flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
            {/* Search bar with Paste CA button */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o dirección…"
                  className="w-full rounded-lg bg-white/[0.04] py-2 pl-8 pr-3 text-xs text-white placeholder:text-muted-foreground/60 ring-1 ring-white/8 transition-colors focus:bg-white/[0.06] focus:outline-none focus:ring-[#8b7cf6]/40"
                  aria-label="Buscar token"
                  autoFocus
                />
              </div>
              <button
                onClick={handlePasteCA}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-2 text-[11px] font-medium text-white/80 ring-1 ring-white/8 transition-colors hover:bg-white/[0.07] hover:text-white"
                title="Pegar dirección del contrato"
              >
                <ClipboardPaste className="h-3 w-3" />
                Pega la CA
              </button>
            </div>

            {/* Network selector row */}
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                Selecciona la red:{" "}
                <span className="text-white/80">{CHAINS[currentChain].name}</span>
              </div>
              <div className="portal-scroll-hidden -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
                <FilterButton
                  active={filter === "favorites"}
                  onClick={() => setFilter("favorites")}
                  title="Favoritos"
                >
                  <Star className={"h-3 w-3 " + (filter === "favorites" ? "fill-[#8b7cf6] text-[#8b7cf6]" : "")} />
                </FilterButton>
                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  title="Todas"
                >
                  All
                </FilterButton>
                <FilterButton
                  active={view === "grid"}
                  onClick={() => setView("grid")}
                  title="Vista en cuadrícula"
                >
                  <LayoutGrid className="h-3 w-3" />
                </FilterButton>
                <FilterButton
                  active={view === "list"}
                  onClick={() => setView("list")}
                  title="Vista en lista"
                >
                  <List className="h-3 w-3" />
                </FilterButton>
                <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
                {FILTER_CHAIN_ORDER.map((c) => {
                  const cfg = CHAINS[c];
                  const active = filter === c || (filter === "all" && c === currentChain);
                  return (
                    <FilterButton
                      key={c}
                      active={active}
                      onClick={() => {
                        setFilter(c);
                        onChainChange?.(c);
                      }}
                      title={cfg.name}
                    >
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
                        }}
                      >
                        {cfg.glyph}
                      </span>
                      {cfg.shortName}
                    </FilterButton>
                  );
                })}
                <FilterButton
                  active={false}
                  onClick={() => toast({ title: "Más redes", description: "Próximamente: Avalanche, Arbitrum, Base, Optimism, etc." })}
                  title="Más redes"
                >
                  38+
                </FilterButton>
              </div>
            </div>

            {/* List header */}
            <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Populares</span>
              <span>Precio</span>
            </div>

            {/* Token list */}
            <div className="flex flex-col gap-1">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/8 bg-white/[0.02] px-4 py-8 text-center">
                  <Search className="h-5 w-5 text-muted-foreground/40" />
                  <div className="text-xs text-muted-foreground">
                    No se encontraron tokens para &quot;{query}&quot;
                  </div>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="mt-1 rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/80 ring-1 ring-white/8 transition-colors hover:bg-white/10"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : view === "list" ? (
                sorted.map((t) => (
                  <TokenRow
                    key={t.symbol}
                    token={t}
                    isCurrent={t.symbol === currentSymbol}
                    onClick={() => handleSelect(t)}
                  />
                ))
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sorted.map((t) => (
                    <TokenTile
                      key={t.symbol}
                      token={t}
                      isCurrent={t.symbol === currentSymbol}
                      onClick={() => handleSelect(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={
        "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all " +
        (active
          ? "bg-white/10 text-white ring-1 ring-[#8b7cf6]/50 shadow-[0_0_12px_rgba(139,124,246,0.2)]"
          : "bg-white/[0.03] text-muted-foreground ring-1 ring-white/8 hover:text-white hover:bg-white/[0.06]")
      }
    >
      {children}
    </button>
  );
}

function TokenGlyph({ token, size = "md" }: { token: BridgeToken; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-9 w-9 text-xs" : size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[10px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${dim}`}
      style={{
        background: `linear-gradient(135deg, ${token.gradient[0]}, ${token.gradient[1]})`,
      }}
    >
      {token.symbol.slice(0, 3)}
    </div>
  );
}

function TokenRow({
  token,
  isCurrent,
  onClick,
}: {
  token: BridgeToken;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const change = token.change24h ?? 0;
  const isUp = change >= 0;
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={
        "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all " +
        (isCurrent
          ? "bg-[#8b7cf6]/10 ring-1 ring-[#8b7cf6]/40"
          : "hover:bg-white/[0.05] ring-1 ring-transparent hover:ring-white/8")
      }
    >
      <TokenGlyph token={token} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white">{token.symbol}</span>
          {token.verified && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help">
                    <BadgeCheck className="h-3 w-3 text-[#3B99EF]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Contrato verificado
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{token.name}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div className="text-sm font-semibold text-white">
          ${formatPrice(token.usdPrice)}
        </div>
        {token.change24h !== undefined && (
          <div
            className={
              "text-[11px] font-medium " +
              (isUp ? "text-[#14F195]" : "text-[#ef4444]")
            }
          >
            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        )}
      </div>
    </motion.button>
  );
}

function TokenTile({
  token,
  isCurrent,
  onClick,
}: {
  token: BridgeToken;
  isCurrent: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all " +
        (isCurrent
          ? "bg-[#8b7cf6]/10 ring-1 ring-[#8b7cf6]/40"
          : "bg-white/[0.03] ring-1 ring-white/8 hover:bg-white/[0.06]")
      }
      title={token.name}
    >
      <TokenGlyph token={token} size="lg" />
      <span className="text-[11px] font-semibold text-white">{token.symbol}</span>
      <span className="text-[9px] text-muted-foreground">${formatPrice(token.usdPrice)}</span>
    </button>
  );
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(6);
}
