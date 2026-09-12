"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownUp,
  Clock,
  Cog,
  Coins,
  Info,
  Loader2,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CHAINS,
  type ChainId,
  type BridgeToken,
  NATIVE_BY_CHAIN,
  tokensForChain,
} from "@/lib/bridge/chains";
import { useWallet } from "@/hooks/use-wallet";
import { NetworkSelector } from "./network-selector";
import { TokenSelector } from "./token-selector";
import {
  ConnectionBadge,
  WalletConnectModal,
} from "./wallet-connect-modal";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface BridgePanelState {
  chain: ChainId;
  token: BridgeToken | null;
  amount: string;
}

const INIT_FROM: BridgePanelState = {
  chain: "bnb",
  token: NATIVE_BY_CHAIN.bnb,
  amount: "",
};

const INIT_TO: BridgePanelState = {
  chain: "polygon",
  token: NATIVE_BY_CHAIN.polygon,
  amount: "",
};

const BRIDGE_FEE_BPS = 15; // 0.15%
const ESTIMATED_GAS_USD = 1.4;

export function BridgeCard({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const [from, setFrom] = useState<BridgePanelState>(INIT_FROM);
  const [to, setTo] = useState<BridgePanelState>(INIT_TO);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [bridgedTx, setBridgedTx] = useState<string | null>(null);
  const { toast } = useToast();

  const fromOptions = useMemo(() => tokensForChain(from.chain), [from.chain]);
  const toOptions = useMemo(() => tokensForChain(to.chain), [to.chain]);

  // Subscribe to the floating "Connect wallet" pill click in the page header
  useEffect(() => {
    function opener() {
      setModalOpen(true);
    }
    document.addEventListener("portal:open-wallet", opener);
    return () => document.removeEventListener("portal:open-wallet", opener);
  }, []);

  const amount = parseFloat(from.amount || "0") || 0;
  const usdValue = useMemo(() => {
    if (!from.token) return 0;
    return amount * from.token.usdPrice;
  }, [amount, from.token]);

  const bridgeFee = amount * (BRIDGE_FEE_BPS / 10000);
  const destinationAmount = Math.max(amount - bridgeFee, 0);
  const sameChain = from.chain === to.chain;
  const sameToken = from.token?.symbol === to.token?.symbol;
  const invalidPair = sameChain && sameToken;
  const sourceEvm = CHAINS[from.chain].isEvm;
  const destEvm = CHAINS[to.chain].isEvm;
  const isSolanaSide = !sourceEvm || !destEvm;

  function handleFromChain(next: ChainId) {
    const opts = tokensForChain(next);
    const stillValid = opts.find((t) => t.symbol === from.token?.symbol);
    setFrom({ ...from, chain: next, token: stillValid ?? NATIVE_BY_CHAIN[next] });
  }

  function handleToChain(next: ChainId) {
    const opts = tokensForChain(next);
    const stillValid = opts.find((t) => t.symbol === to.token?.symbol);
    setTo({ ...to, chain: next, token: stillValid ?? NATIVE_BY_CHAIN[next] });
  }

  function handleFromToken(token: BridgeToken) {
    setFrom({ ...from, token });
    // Auto-update destination to the same symbol if it exists on the destination chain
    const destMatch = tokensForChain(to.chain).find((t) => t.symbol === token.symbol);
    if (destMatch) setTo({ ...to, token: destMatch });
  }

  function handleToToken(token: BridgeToken) {
    setTo({ ...to, token });
  }

  function swapPanels() {
    setFrom(to);
    setTo(from);
  }

  function setMax() {
    if (!from.token) return;
    // Demo balance — in a real app we'd fetch on-chain balance via the wallet
    const demoBalance =
      from.token.symbol === "BNB" ? "1.25"
      : from.token.symbol === "POL" ? "540"
      : from.token.symbol === "ETH" ? "0.42"
      : from.token.symbol === "SOL" ? "3.2"
      : "100";
    setFrom({ ...from, amount: demoBalance });
  }

  const connected = !!wallet.address;
  const walletChainMatchesSource =
    connected &&
    CHAINS[from.chain].evmChainId === wallet.chainId;

  const cta = (() => {
    if (invalidPair) return { label: "Select different chain or token", disabled: true };
    if (!connected) return { label: "Connect source wallet", disabled: false };
    if (!sourceEvm) return { label: "Connect a Solana wallet to bridge from Solana", disabled: true };
    if (!amount || amount <= 0) return { label: "Enter an amount", disabled: true };
    if (connected && !walletChainMatchesSource && sourceEvm) {
      return { label: `Switch wallet to ${CHAINS[from.chain].name}`, disabled: false };
    }
    return { label: "Bridge", disabled: false };
  })();

  async function handleBridge() {
    if (cta.disabled) {
      if (invalidPair) {
        toast({
          title: "Invalid route",
          description: "Source and destination must differ by chain or token.",
          variant: "destructive",
        });
        return;
      }
      if (!sourceEvm) {
        toast({
          title: "Solana source not supported",
          description: "MetaMask and Coinbase Wallet cannot sign Solana transactions. Use Phantom for Solana.",
          variant: "destructive",
        });
        return;
      }
      return;
    }

    if (!connected) {
      setModalOpen(true);
      return;
    }

    if (connected && sourceEvm && !walletChainMatchesSource) {
      const ok = await wallet.switchChain(from.chain);
      if (!ok) {
        toast({
          title: "Could not switch network",
          description: `Please switch your wallet to ${CHAINS[from.chain].name} manually.`,
          variant: "destructive",
          action: <ToastAction altText="Retry" onClick={() => wallet.switchChain(from.chain)}>Retry</ToastAction>,
        });
        return;
      }
      return;
    }

    setBridging(true);
    setBridgedTx(null);

    // Simulate the bridging flow — in a real app this would call the Wormhole SDK
    await new Promise((r) => setTimeout(r, 2200));
    const fakeTx = "0x" + Math.random().toString(16).slice(2).padEnd(64, "a");
    setBridgedTx(fakeTx);
    setBridging(false);

    toast({
      title: "Bridge transaction submitted",
      description: `Bridging ${amount} ${from.token?.symbol} from ${CHAINS[from.chain].name} to ${CHAINS[to.chain].name}.`,
    });

    // Reset amount after a successful bridge
    setTimeout(() => {
      setFrom((f) => ({ ...f, amount: "" }));
      setBridgedTx(null);
    }, 6000);
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Glow */}
      <div
        className="absolute -inset-3 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139, 124, 246, 0.35), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="portal-card relative overflow-hidden rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #9d8df9 0%, #7c6cf0 100%)",
                  boxShadow: "0 4px 12px rgba(139, 124, 246, 0.5)",
                }}
              />
              <Sparkles className="absolute inset-0 m-auto h-3.5 w-3.5 text-foreground" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Swap</h1>
          </div>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mx-5 mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                <div className="mb-2 flex items-center gap-1.5 text-foreground">
                  <Cog className="h-3.5 w-3.5" /> Slippage tolerance
                </div>
                <div className="flex gap-1.5">
                  {["0.5%", "1%", "2%", "3%"].map((s, i) => (
                    <button
                      key={s}
                      className={
                        "rounded-md px-2 py-1 ring-1 ring-white/8 " +
                        (i === 1
                          ? "bg-[#8b7cf6]/15 text-[#b8a8ff] ring-[#8b7cf6]/40"
                          : "bg-white/5 text-foreground/70 hover:bg-white/10")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FROM panel */}
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">From</span>
            <ConnectionBadge wallet={wallet} source />
          </div>

          <div className="rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
            <div className="flex items-center gap-2">
              <NetworkSelector
                value={from.chain}
                onChange={handleFromChain}
                exclude={[to.chain]}
                label="Source network"
              />
              <div className="ml-auto">
                <TokenSelector
                  value={from.token}
                  options={fromOptions}
                  onChange={handleFromToken}
                />
              </div>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <input
                inputMode="decimal"
                type="text"
                placeholder="0"
                value={from.amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  setFrom({ ...from, amount: v });
                }}
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-foreground placeholder:text-foreground/25 focus:outline-none"
              />
              <button
                onClick={setMax}
                disabled={!from.token}
                className="rounded-md bg-[#8b7cf6]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#b8a8ff] ring-1 ring-[#8b7cf6]/30 transition-colors hover:bg-[#8b7cf6]/25 disabled:opacity-40"
              >
                Max
              </button>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ≈ ${usdValue.toFixed(2)} ·{" "}
              <span className="text-foreground/60">
                Bal:{" "}
                {from.token?.symbol === "BNB"
                  ? "1.25"
                  : from.token?.symbol === "POL"
                    ? "540"
                    : from.token?.symbol === "ETH"
                      ? "0.42"
                      : from.token?.symbol === "SOL"
                        ? "3.2"
                        : "100"}{" "}
                {from.token?.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Swap-direction button */}
        <div className="relative -mt-2 flex justify-center">
          <button
            onClick={swapPanels}
            className="portal-swap-button relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            aria-label="Swap source and destination"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-white/5" />
        </div>

        {/* TO panel */}
        <div className="px-5 pb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">To</span>
            <ConnectionBadge wallet={wallet} source={false} />
          </div>

          <div className="rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
            <div className="flex items-center gap-2">
              <NetworkSelector
                value={to.chain}
                onChange={handleToChain}
                exclude={[from.chain]}
                label="Destination network"
              />
              <div className="ml-auto">
                <TokenSelector
                  value={to.token}
                  options={toOptions}
                  onChange={handleToToken}
                />
              </div>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <input
                type="text"
                placeholder="0"
                value={from.amount && to.token ? destinationAmount.toFixed(6).replace(/\.?0+$/, "") : ""}
                readOnly
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-foreground/80 placeholder:text-foreground/25 focus:outline-none"
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ≈ ${((destinationAmount || 0) * (to.token?.usdPrice ?? 0)).toFixed(2)} ·{" "}
              <span className="text-foreground/60">auto-routed</span>
            </div>
          </div>
        </div>

        {/* Route info */}
        <div className="px-5 pb-4">
          <RouteInfo
            from={from}
            to={to}
            fee={bridgeFee}
            usdValue={usdValue}
            isSolanaSide={isSolanaSide}
          />
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={handleBridge}
            disabled={cta.disabled || bridging}
            className="portal-cta flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-[#0b0a1f]"
          >
            {bridging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Bridging…
              </>
            ) : (
              cta.label
            )}
          </button>

          {bridgedTx && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between rounded-lg border border-[#8b7cf6]/30 bg-[#8b7cf6]/10 px-3 py-2 text-xs text-[#b8a8ff]"
            >
              <span>Transaction submitted</span>
              <a
                href={`${CHAINS[from.chain].explorer}/tx/${bridgedTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] underline underline-offset-2"
              >
                {bridgedTx.slice(0, 10)}…{bridgedTx.slice(-6)}
              </a>
            </motion.div>
          )}

          {isSolanaSide && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <p>
                Solana is not reachable through MetaMask or Coinbase Wallet. To bridge
                the Solana side of this route, install{" "}
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Phantom Wallet
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <WalletConnectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        wallet={wallet}
      />
    </div>
  );
}

function RouteInfo({
  from,
  to,
  fee,
  usdValue,
  isSolanaSide,
}: {
  from: BridgePanelState;
  to: BridgePanelState;
  fee: number;
  usdValue: number;
  isSolanaSide: boolean;
}) {
  const source = CHAINS[from.chain];
  const dest = CHAINS[to.chain];

  return (
    <div className="space-y-2 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
      <RouteRow
        icon={<Zap className="h-3 w-3 text-[#8b7cf6]" />}
        label="Bridge route"
        value={
          <span className="flex items-center gap-1">
            <span className="font-medium">{source.shortName}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{dest.shortName}</span>
          </span>
        }
      />
      <RouteRow
        icon={<Clock className="h-3 w-3 text-[#8b7cf6]" />}
        label="Estimated time"
        value={
          isSolanaSide ? "≈ 5–10 min (Solana route)" : `${dest.bridgeTime} · 1 confirmation`
        }
      />
      <RouteRow
        icon={<Coins className="h-3 w-3 text-[#8b7cf6]" />}
        label="Bridge fee"
        value={
          <span>
            {fee > 0 ? fee.toFixed(6) : "0.00"} {from.token?.symbol ?? ""}
            <span className="ml-1 text-muted-foreground">
              +≈ ${ESTIMATED_GAS_USD.toFixed(2)} gas
            </span>
          </span>
        }
      />
      <RouteRow
        icon={<Info className="h-3 w-3 text-[#8b7cf6]" />}
        label="Rate"
        value={
          <span>
            1 {from.token?.symbol ?? ""} ≈ ${(from.token?.usdPrice ?? 0).toFixed(2)} ·{" "}
            <span className="text-muted-foreground">${usdValue.toFixed(2)} total</span>
          </span>
        }
      />
    </div>
  );
}

function RouteRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right text-foreground/85">{value}</span>
    </div>
  );
}
