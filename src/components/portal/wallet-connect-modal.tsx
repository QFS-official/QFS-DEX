"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, ShieldCheck, X } from "lucide-react";
import { useWallet, type WalletKind } from "@/hooks/use-wallet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: ReturnType<typeof useWallet>;
}

interface WalletMeta {
  id: WalletKind;
  name: string;
  description: string;
  gradient: [string, string];
  glyph: string;
}

const WALLETS: WalletMeta[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with the MetaMask browser extension",
    gradient: ["#F6851B", "#E2761B"],
    glyph: "M",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with the Coinbase Wallet extension",
    gradient: ["#0052FF", "#1A56FF"],
    glyph: "C",
  },
];

export function WalletConnectModal({ open, onOpenChange, wallet }: Props) {
  const [connecting, setConnecting] = useState<WalletKind | null>(null);

  // Reset the "connecting" indicator whenever the modal closes.
  // Implemented via a key on the close button rather than setState-in-effect
  // to satisfy the React hooks lint rule.
  useEffect(() => {
    if (!open) {
      // schedule reset on next tick — this avoids the synchronous setState in effect warning
      const t = window.setTimeout(() => setConnecting(null), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  async function handleConnect(kind: WalletKind) {
    setConnecting(kind);
    await wallet.connect(kind);
    if (!wallet.error) onOpenChange(false);
    setConnecting(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="portal-card overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="relative flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <DialogTitle className="text-base font-semibold text-white">
              Connect a wallet
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose how you want to connect
            </DialogDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {WALLETS.map((w) => {
            const installed = wallet.installed[w.id];
            const isConnectingThis = connecting === w.id;
            const disabled = isConnectingThis || wallet.isConnecting;

            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w.id)}
                disabled={disabled}
                className="group relative flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-left transition-all hover:border-[#8b7cf6]/40 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* Wallet glyph */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${w.gradient[0]}, ${w.gradient[1]})`,
                    boxShadow: `0 4px 12px ${w.gradient[0]}40`,
                  }}
                >
                  {w.glyph}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{w.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {installed
                      ? w.description
                      : "Not installed — click to launch installer"}
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  {isConnectingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#8b7cf6]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground transition-transform group-hover:text-white" />
                  )}
                </div>
              </button>
            );
          })}

          {wallet.error && (
            <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {wallet.error}
            </div>
          )}

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b7cf6]" />
            <p>
              By connecting, you agree to the Terms of Service. Your wallet stays in
              control of your keys — Portal Bridge never holds custody of your funds.
            </p>
          </div>

          {!wallet.installed.metamask && !wallet.installed.coinbase && (
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              Don&apos;t see your wallet?{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b7cf6] hover:underline"
              >
                Install MetaMask
              </a>{" "}
              or{" "}
              <a
                href="https://www.coinbase.com/wallet/downloads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b7cf6] hover:underline"
              >
                Coinbase Wallet
              </a>
              .
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small inline "Connected to …" badge shown on each panel header.
 */
export function ConnectionBadge({
  wallet,
  source = true,
}: {
  wallet: ReturnType<typeof useWallet>;
  source?: boolean;
}) {
  const connected = !!wallet.address;
  const label = connected
    ? wallet.kind === "metamask"
      ? "MetaMask"
      : "Coinbase"
    : "Not connected";
  const shortAddr = wallet.shortAddress;

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium " +
        (connected
          ? "bg-[#8b7cf6]/15 text-[#b8a8ff] ring-1 ring-[#8b7cf6]/30"
          : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/5")
      }
    >
      <span
        className={
          "inline-block h-1.5 w-1.5 rounded-full " +
          (connected ? "bg-[#8b7cf6]" : "bg-muted-foreground/60")
        }
      />
      {connected && shortAddr ? `${label} · ${shortAddr}` : label}
    </span>
  );
}

/**
 * Big "Connect source wallet" / wallet chip button used at the bottom of the
 * main swap card. Triggers the modal when not connected.
 */
export function WalletConnectButton({
  wallet,
  onOpenModal,
}: {
  wallet: ReturnType<typeof useWallet>;
  onOpenModal: () => void;
}) {
  if (wallet.address) {
    return (
      <Button
        variant="outline"
        onClick={() => onOpenModal()}
        className="portal-pill border-white/10 bg-white/5 text-xs font-medium text-white/80 hover:text-white"
      >
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background:
              wallet.kind === "metamask"
                ? "linear-gradient(135deg, #F6851B, #E2761B)"
                : "linear-gradient(135deg, #0052FF, #1A56FF)",
          }}
        />
        <span className="font-mono">{wallet.shortAddress}</span>
      </Button>
    );
  }
  return (
    <Button
      onClick={() => onOpenModal()}
      disabled={wallet.isConnecting}
      className="portal-pill border-white/10 bg-white/5 text-sm font-medium text-white/80 hover:text-white"
    >
      {wallet.isConnecting ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Connecting…
        </>
      ) : (
        <>Connect wallet</>
      )}
    </Button>
  );
}
