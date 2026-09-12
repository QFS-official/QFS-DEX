"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { useWallet } from "@/hooks/use-wallet";
import {
  MOBILE_WALLETS,
  useMobileWalletRecents,
  type MobileWallet,
} from "@/lib/wallets/mobile-recents";

interface Props {
  open: boolean;
  uri: string | null;
  onClose: () => void;
  onSimulateScan: () => void;
  wallet: ReturnType<typeof useWallet>;
}

export function WalletConnectQRModal({
  open,
  uri,
  onClose,
  onSimulateScan,
  wallet,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Auto-simulate scan after 15 seconds (gives the user time to scan or click)
  useEffect(() => {
    if (!open || !uri) {
      const t = window.setTimeout(() => setAutoCountdown(null), 0);
      return () => window.clearTimeout(t);
    }
    // Schedule both state updates on next tick to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const startTimer = window.setTimeout(() => {
      setAutoCountdown(15);
      let left = 15;
      const tick = window.setInterval(() => {
        left -= 1;
        setAutoCountdown(left);
        if (left <= 0) {
          window.clearInterval(tick);
          onSimulateScan();
        }
      }, 1000);
      // store cleanup on the timer id so the outer return can clear it
      cleanupRef.current = () => {
        window.clearInterval(tick);
      };
    }, 0);
    return () => {
      window.clearTimeout(startTimer);
      cleanupRef.current?.();
    };
  }, [open, uri, onSimulateScan]);

  function copyUri() {
    if (!uri) return;
    navigator.clipboard?.writeText(uri).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
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
          <div className="flex items-center gap-2.5">
            {/* WC logo */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3B99EF 0%, #627EEA 100%)",
                boxShadow: "0 4px 12px rgba(59, 153, 239, 0.4)",
              }}
            >
              W
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Escanear con WalletConnect
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Abre la app de tu wallet y escanea el QR
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR area — scrollable when content exceeds viewport */}
        <div className="portal-scroll-hidden flex flex-1 flex-col items-center gap-4 overflow-y-auto px-5 py-5">
          {uri ? (
            <div className="relative rounded-2xl bg-white p-4 ring-1 ring-white/10">
              <QRCodeSVG
                value={uri}
                size={232}
                level="M"
                bgColor="#ffffff"
                fgColor="#0b0a1f"
                marginSize={0}
              />
              {/* WC logo overlay in the center of the QR */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-white ring-4 ring-white"
                  style={{
                    background: "linear-gradient(135deg, #3B99EF 0%, #627EEA 100%)",
                  }}
                >
                  W
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[264px] w-[232px] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
              <Loader2 className="h-6 w-6 animate-spin text-[#8b7cf6]" />
            </div>
          )}

          {/* Auto-scan countdown */}
          <AnimatePresence>
            {autoCountdown !== null && autoCountdown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground ring-1 ring-white/8"
              >
                <Loader2 className="h-3 w-3 animate-spin text-[#8b7cf6]" />
                Simulando escaneo en {autoCountdown}s…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copy URI */}
          {uri && (
            <div className="flex w-full items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-muted-foreground ring-1 ring-white/8">
                {uri.length > 56 ? uri.slice(0, 32) + "…" + uri.slice(-20) : uri}
              </code>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyUri}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Copiar URI"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#14F195]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {copied ? "URI copiada" : "Copiar URI"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Simulate scan button (demo) */}
          <button
            onClick={onSimulateScan}
            disabled={!uri}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0b0a1f] transition-all hover:bg-white/90 disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Simular escaneo exitoso
          </button>

          {/* Demo disclaimer */}
          <div className="flex items-start gap-2 rounded-lg bg-[#8b7cf6]/10 px-3 py-2 text-[11px] text-[#b8a8ff] ring-1 ring-[#8b7cf6]/20">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <p>
              <strong>Modo demo:</strong> el QR se genera localmente y no
              conecta con el relay real. En producción, inicializa{" "}
              <code className="font-mono">@walletconnect/ethereum-provider</code>{" "}
              con un <code className="font-mono">projectId</code> real.
            </p>
          </div>

          {/* Mobile wallet suggestions with Populares / Recientes tabs */}
          <div className="w-full">
            <MobileWalletsTabs uri={uri} />
          </div>

          {/* Reload / refresh */}
          {wallet.error && (
            <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
              {wallet.error}
            </div>
          )}

          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
            Cancelar y elegir otra wallet
          </button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * "Populares / Recientes" tabbed grid of mobile wallets.
 * The Populares tab shows the full catalog (8 wallets).
 * The Recientes tab shows the user's recently-clicked wallets (max 6),
 * persisted to localStorage. Clicking a wallet link records it as recent.
 */
function MobileWalletsTabs({ uri }: { uri: string | null }) {
  const { recents, record, clear } = useMobileWalletWallets();
  const [tab, setTab] = useState<"populares" | "recientes">(
    recents.length > 0 ? "recientes" : "populares",
  );

  // If recents becomes empty while we're on the Recientes tab, switch back
  // to Populares (scheduled to satisfy the set-state-in-effect lint rule).
  useEffect(() => {
    if (tab === "recientes" && recents.length === 0) {
      const t = window.setTimeout(() => setTab("populares"), 0);
      return () => window.clearTimeout(t);
    }
  }, [recents.length, tab]);

  const recentWallets = useMemo(
    () =>
      recents
        .map((id) => MOBILE_WALLETS.find((w) => w.id === id))
        .filter((w): w is MobileWallet => w != null),
    [recents],
  );

  // On first mount, if recents has entries, switch to the Recientes tab
  // — we use a ref guard so this only runs once on mount, and schedule the
  // setState via setTimeout to satisfy the react-hooks/set-state-in-effect rule.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;
    if (recents.length > 0) {
      const t = window.setTimeout(() => setTab("recientes"), 0);
      return () => window.clearTimeout(t);
    }
  }, [recents.length]);

  function handleWalletClick(id: string) {
    record(id);
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "populares" | "recientes")}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          No tienes wallet? Descarga una
        </span>
        {recents.length > 0 && tab === "recientes" && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-300"
            title="Borrar recientes"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Limpiar
          </button>
        )}
      </div>

      <TabsList className="grid w-full grid-cols-2 rounded-lg bg-white/[0.04] p-0.5 ring-1 ring-white/8">
        <TabsTrigger
          value="populares"
          className="flex items-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground data-[state=active]:shadow-none"
        >
          <Star className="h-2.5 w-2.5" />
          Populares
          <span className="ml-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {MOBILE_WALLETS.length}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="recientes"
          className="flex items-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground data-[state=active]:shadow-none"
        >
          <Clock className="h-2.5 w-2.5" />
          Recientes
          {recents.length > 0 && (
            <span className="ml-1 rounded-full bg-[#8b7cf6]/15 px-1.5 py-0.5 text-[9px] text-[#b8a8ff] ring-1 ring-[#8b7cf6]/30">
              {recents.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="populares" className="mt-2">
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_WALLETS.map((w) => (
            <MobileWalletTile
              key={w.id}
              wallet={w}
              uri={uri}
              onClick={() => handleWalletClick(w.id)}
              isRecent={recents.includes(w.id)}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recientes" className="mt-2">
        {recentWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/8 bg-white/[0.02] px-4 py-6 text-center">
            <Clock className="h-5 w-5 text-muted-foreground/40" />
            <div className="text-xs text-muted-foreground">
              Aún no abriste ninguna wallet.
            </div>
            <div className="text-[10px] text-muted-foreground/70">
              Las wallets que abras se listarán aquí.
            </div>
            <button
              onClick={() => setTab("populares")}
              className="mt-1 rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/80 ring-1 ring-white/8 transition-colors hover:bg-white/10"
            >
              Ver populares
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {recentWallets.map((w) => (
              <MobileWalletTile
                key={w.id}
                wallet={w}
                uri={uri}
                onClick={() => handleWalletClick(w.id)}
                isRecent={true}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function MobileWalletTile({
  wallet,
  uri,
  onClick,
  isRecent = false,
}: {
  wallet: MobileWallet;
  uri: string | null;
  onClick: () => void;
  isRecent?: boolean;
}) {
  // In production with a real WC projectId, we'd deep-link to the wallet app
  // using `${wallet.wcDeepLink}${encodeURIComponent(uri)}`. Since this is a
  // demo, we just link to the wallet's download page.
  const href = wallet.url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2 text-[11px] text-white/80 transition-all hover:border-[#8b7cf6]/40 hover:bg-white/[0.05]"
      title={`Abrir ${wallet.name}`}
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${wallet.gradient[0]}, ${wallet.gradient[1]})`,
        }}
      >
        {wallet.glyph}
      </div>
      <span className="min-w-0 flex-1 truncate">{wallet.name}</span>
      {isRecent && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b7cf6]"
          title="Abierta recientemente"
        />
      )}
      <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-white" />
    </a>
  );
}

/**
 * Local wrapper to allow overriding the recents hook in tests — currently just
 * re-exports useMobileWalletRecents() so we get a single source of truth.
 */
function useMobileWalletWallets() {
  return useMobileWalletRecents();
}
