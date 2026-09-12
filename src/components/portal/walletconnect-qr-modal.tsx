"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
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
import type { useWallet } from "@/hooks/use-wallet";

interface Props {
  open: boolean;
  uri: string | null;
  onClose: () => void;
  onSimulateScan: () => void;
  wallet: ReturnType<typeof useWallet>;
}

const MOBILE_WALLETS = [
  { name: "Trust Wallet", url: "https://apps.apple.com/app/id1288339409" },
  { name: "MetaMask", url: "https://metamask.io/download/" },
  { name: "Rainbow", url: "https://rainbow.me/" },
  { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet/downloads" },
];

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
        className="portal-card overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/5 px-5 py-4">
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

        {/* QR area */}
        <div className="flex flex-col items-center gap-4 px-5 py-6">
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

          {/* Mobile wallet suggestions */}
          <div className="w-full">
            <div className="mb-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              No tienes wallet? Descarga una
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_WALLETS.map((w) => (
                <a
                  key={w.name}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] text-white/80 transition-colors hover:border-[#8b7cf6]/40 hover:bg-white/[0.05]"
                >
                  <span>{w.name}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                </a>
              ))}
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
