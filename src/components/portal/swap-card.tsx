"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ChevronDown,
  ClipboardPaste,
  Clock,
  Info,
  Loader2,
  PieChart,
  Settings2,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  CHAINS,
  type ChainId,
  type BridgeToken,
  NATIVE_BY_CHAIN,
  tokensForChain,
} from "@/lib/bridge/chains";
import { useWallet, WALLETS, type WalletKind } from "@/hooks/use-wallet";
import { NetworkSelector } from "./network-selector";
import { TokenSelector } from "./token-selector";
import { WalletConnectModal } from "./wallet-connect-modal";
import { TokenPickerModal } from "./token-picker-modal";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/lib/swap/favorites";
import { addSwapRecord } from "@/lib/swap/history";

/** Returns the brand gradient for a connected wallet (or a lavender fallback). */
function walletDotGradient(kind: WalletKind | null): string {
  if (!kind) return "linear-gradient(135deg, #8b7cf6, #7c6cf0)";
  const meta = WALLETS.find((w) => w.id === kind);
  return meta
    ? `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`
    : "linear-gradient(135deg, #8b7cf6, #7c6cf0)";
}

interface SwapPanelState {
  token: BridgeToken | null;
  amount: string;
}

const SLIPPAGE_OPTIONS = ["0.5%", "1%", "2%", "3%"];
const DEFAULT_SLIPPAGE = "1%";

export interface SwapCardProps {
  wallet: ReturnType<typeof useWallet>;
  /** Controlled trade state — owned by the page so it can be shared with
   *  PriceChart, FavoritePairs and SwapHistory. */
  chain: ChainId;
  deSymbol: string;
  aSymbol: string;
  deAmount: string;
  onChainChange: (next: ChainId) => void;
  onDeSymbolChange: (next: string) => void;
  onASymbolChange: (next: string) => void;
  onAmountChange: (next: string) => void;
}

/**
 * OKX-style same-chain swap card.
 *
 * Visual differences from the QFS Swap BridgeCard:
 *  - "De" / "A" labels (Spanish) instead of "From" / "To"
 *  - Single network selector at the top (applies to both sides — same-chain swap)
 *  - Large token logos (~44px) instead of compact 28px pills
 *  - Center swap-direction button
 *  - Utility icons in sub-header: paste contract address, settings, list/chart toggle
 *  - Star toggle in sub-header — adds/removes current pair from favorites
 *  - Stark white CTA button with black text
 */
export function SwapCard({
  wallet,
  chain,
  deSymbol,
  aSymbol,
  deAmount,
  onChainChange,
  onDeSymbolChange,
  onASymbolChange,
  onAmountChange,
}: SwapCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerSide, setPickerSide] = useState<"de" | "a" | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [swappedTx, setSwappedTx] = useState<string | null>(null);
  const { toast } = useToast();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const tokens = useMemo(() => tokensForChain(chain), [chain]);

  // Derive token objects directly from the chain's available tokens
  const deToken = useMemo<BridgeToken | null>(() => {
    return (
      tokens.find((t) => t.symbol === deSymbol) ??
      NATIVE_BY_CHAIN[chain] ??
      tokens[0] ??
      null
    );
  }, [tokens, deSymbol, chain]);

  const aToken = useMemo<BridgeToken | null>(() => {
    return (
      tokens.find((t) => t.symbol === aSymbol) ??
      tokens.find((t) => t.symbol === "USDC") ??
      tokens[1] ??
      null
    );
  }, [tokens, aSymbol]);

  // Subscribe to the floating "Connect wallet" pill click
  useEffect(() => {
    function opener() {
      setModalOpen(true);
    }
    document.addEventListener("portal:open-wallet", opener);
    return () => document.removeEventListener("portal:open-wallet", opener);
  }, []);

  const amount = parseFloat(deAmount || "0") || 0;
  const dePrice = deToken?.usdPrice ?? 0;
  const aPrice = aToken?.usdPrice ?? 0;

  // USD value of the "De" side
  const usdValue = amount * dePrice;

  // Price ratio: 1 DE token = X A tokens
  const ratio = dePrice > 0 && aPrice > 0 ? dePrice / aPrice : 0;
  const inverseRatio = aPrice > 0 && dePrice > 0 ? aPrice / dePrice : 0;

  // Estimated output amount (price * amount, minus 0.05% swap fee)
  const SWAP_FEE_BPS = 5; // 0.05%
  const grossOutput = dePrice > 0 && aPrice > 0 ? (amount * dePrice) / aPrice : 0;
  const outputAmount = Math.max(grossOutput * (1 - SWAP_FEE_BPS / 10000), 0);
  const outputUsd = outputAmount * aPrice;

  const sameToken = deToken?.symbol === aToken?.symbol;
  const invalidPair = !deToken || !aToken || sameToken;

  const chainEvm = CHAINS[chain].isEvm;
  const connected = !!wallet.address;
  const walletChainMatches =
    connected && CHAINS[chain].evmChainId === wallet.chainId;

  const pairFavorited = isFavorite(deSymbol, aSymbol, chain);

  const cta = (() => {
    if (invalidPair) return { label: "Selecciona un token diferente", disabled: true };
    if (!chainEvm) {
      return { label: "Solana requiere Phantom Wallet", disabled: true };
    }
    if (!connected) return { label: "Conectar billetera", disabled: false };
    if (!walletChainMatches) {
      return { label: `Cambiar a ${CHAINS[chain].name}`, disabled: false };
    }
    if (!amount || amount <= 0) return { label: "Ingresa un monto", disabled: true };
    return { label: "Swap", disabled: false };
  })();

  function setMax() {
    if (!deToken) return;
    // Demo balance depending on token
    const bal =
      deToken.symbol === "ETH" ? "0.42"
      : deToken.symbol === "BNB" ? "1.25"
      : deToken.symbol === "POL" ? "540"
      : deToken.symbol === "SOL" ? "3.2"
      : "100";
    onAmountChange(bal);
  }

  function swapSides() {
    onDeSymbolChange(aSymbol);
    onASymbolChange(deSymbol);
  }

  async function handleSwap() {
    if (cta.disabled) {
      if (invalidPair) {
        toast({
          title: "Par inválido",
          description: "Elige tokens diferentes para swap.",
          variant: "destructive",
        });
      } else if (!chainEvm) {
        toast({
          title: "Solana no soportada",
          description: "Para Solana, instala Phantom Wallet.",
          variant: "destructive",
        });
      }
      return;
    }

    if (!connected) {
      setModalOpen(true);
      return;
    }

    if (connected && chainEvm && !walletChainMatches) {
      const ok = await wallet.switchChain(chain);
      if (!ok) {
        toast({
          title: "No se pudo cambiar de red",
          description: `Cambia tu wallet a ${CHAINS[chain].name} manualmente.`,
          variant: "destructive",
        });
      }
      return;
    }

    setSwapping(true);
    setSwappedTx(null);
    await new Promise((r) => setTimeout(r, 2200));
    const fakeTx = "0x" + Math.random().toString(16).slice(2).padEnd(64, "a");
    setSwappedTx(fakeTx);
    setSwapping(false);

    // Persist to swap history (will be picked up by SwapHistory panel via event)
    addSwapRecord({
      fromSymbol: deToken?.symbol ?? "?",
      toSymbol: aToken?.symbol ?? "?",
      fromAmount: amount,
      toAmount: outputAmount,
      usdValue,
      chain,
      txHash: fakeTx,
    });

    toast({
      title: "Swap enviado",
      description: `Cambiando ${amount} ${deToken?.symbol} por ${outputAmount.toFixed(4)} ${aToken?.symbol} en ${CHAINS[chain].name}.`,
    });

    setTimeout(() => {
      onAmountChange("");
      setSwappedTx(null);
    }, 6000);
  }

  // Helper to render the De/A panels from the derived tokens + state
  const deState = { token: deToken, amount: deAmount };
  const aState = { token: aToken, amount: deAmount ? String(outputAmount) : "" };

  return (
    <div className="relative w-full max-w-md">
      <div
        className="absolute -inset-3 -z-10 rounded-[2rem] opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255, 255, 255, 0.18), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="portal-card relative overflow-hidden rounded-3xl"
      >
        {/* Sub-header: Swap title + utility icons */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">Swap</h2>
          </div>
          <div className="flex items-center gap-1">
            <UtilityButton
              title={pairFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
              onClick={() => toggleFavorite(deSymbol, aSymbol, chain)}
              active={pairFavorited}
            >
              <Star
                className={"h-4 w-4 " + (pairFavorited ? "fill-[#8b7cf6] text-[#8b7cf6]" : "")}
              />
            </UtilityButton>
            <UtilityButton title="Pegar dirección del contrato" onClick={() => toast({ title: "Pegar CA", description: "Pega la dirección del contrato del token." })}>
              <ClipboardPaste className="h-4 w-4" />
            </UtilityButton>
            <UtilityButton title="Configuración" onClick={() => setShowSettings((s) => !s)} active={showSettings}>
              <Settings2 className="h-4 w-4" />
            </UtilityButton>
            <UtilityButton title="Vista de lista / gráfico" onClick={() => toast({ title: "Vista", description: "Cambia entre vista de lista y gráfico." })}>
              <PieChart className="h-4 w-4" />
            </UtilityButton>
          </div>
        </div>

        {/* Network selector (single, same-chain swap) */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Red
            </span>
            <NetworkSelector
              value={chain}
              onChange={onChainChange}
              label="Selecciona una red"
            />
          </div>
        </div>

        {/* Settings panel (collapsible) */}
        <AnimatePresence initial={false}>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mx-5 mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-white">
                  <Settings2 className="h-3.5 w-3.5" /> Tolerancia de slippage
                </div>
                <div className="flex gap-1.5">
                  {SLIPPAGE_OPTIONS.map((s) => {
                    const active = s === slippage;
                    return (
                      <button
                        key={s}
                        onClick={() => setSlippage(s)}
                        className={
                          "rounded-md px-2.5 py-1 text-xs ring-1 ring-white/8 " +
                          (active
                            ? "bg-[#8b7cf6]/15 text-[#b8a8ff] ring-[#8b7cf6]/40"
                            : "bg-white/5 text-white/70 hover:bg-white/10")
                        }
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* De panel */}
        <div className="p-5 pb-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">De</span>
            <span className="text-[11px] text-muted-foreground">
              {connected ? (
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      background: walletDotGradient(wallet.kind),
                    }}
                  />
                  {wallet.shortAddress}
                </span>
              ) : (
                "No conectado"
              )}
            </span>
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <TokenSelectorLarge
                value={deToken}
                onOpenPicker={() => setPickerSide("de")}
              />
              <input
                inputMode="decimal"
                type="text"
                placeholder="0.0"
                value={deAmount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  onAmountChange(v);
                }}
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ ${usdValue.toFixed(2)}</span>
              <button
                onClick={setMax}
                disabled={!deToken}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/8 transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Center ratio circle (OKX style) */}
        <div className="relative -mt-2 flex justify-center">
          <div className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-white/4" />
          <button
            onClick={swapSides}
            className="portal-swap-button relative z-10 flex h-12 w-12 flex-col items-center justify-center rounded-full text-white"
            aria-label="Invertir De y A"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* A panel */}
        <div className="px-5 pt-2 pb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">A</span>
            <span className="text-[11px] text-muted-foreground">
              {ratio > 0 ? (
                <span className="inline-flex items-center gap-1 text-white/70">
                  <TrendingUp className="h-3 w-3 text-[#8b7cf6]" />
                  1 {deToken?.symbol} ≈ {ratio.toFixed(ratio < 1 ? 6 : 2)} {aToken?.symbol}
                </span>
              ) : (
                "—"
              )}
            </span>
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <TokenSelectorLarge
                value={aToken}
                onOpenPicker={() => setPickerSide("a")}
              />
              <input
                type="text"
                placeholder="0.0"
                value={
                  deAmount && aToken
                    ? outputAmount.toFixed(6).replace(/\.?0+$/, "")
                    : ""
                }
                readOnly
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-white/70 placeholder:text-white/25 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ ${outputUsd.toFixed(2)}</span>
              <span className="text-white/60">auto-ruta</span>
            </div>
          </div>
        </div>

        {/* Route summary */}
        <div className="px-5 pb-4">
          <SwapRouteInfo
            de={deState}
            a={aState}
            chain={chain}
            ratio={ratio}
            inverseRatio={inverseRatio}
            slippage={slippage}
            usdValue={usdValue}
            connected={connected}
          />
        </div>

        {/* CTA — OKX-style white button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSwap}
            disabled={cta.disabled || swapping}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#0b0a1f] transition-all hover:bg-white/90 hover:shadow-[0_12px_32px_rgba(255,255,255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {swapping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </>
            ) : (
              cta.label
            )}
          </button>

          {swappedTx && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between rounded-lg border border-[#8b7cf6]/30 bg-[#8b7cf6]/10 px-3 py-2 text-xs text-[#b8a8ff]"
            >
              <span>Swap enviado</span>
              <a
                href={`${CHAINS[chain].explorer}/tx/${swappedTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] underline underline-offset-2"
              >
                {swappedTx.slice(0, 10)}…{swappedTx.slice(-6)}
              </a>
            </motion.div>
          )}

          {!chainEvm && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <p>
                Solana no es accesible desde MetaMask o Coinbase Wallet. Instala{" "}
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Phantom Wallet
                </a>{" "}
                para swaps en Solana.
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

      <TokenPickerModal
        open={pickerSide !== null}
        onClose={() => setPickerSide(null)}
        tokens={tokens}
        currentChain={chain}
        side={pickerSide ?? "de"}
        currentSymbol={pickerSide === "de" ? deSymbol : pickerSide === "a" ? aSymbol : null}
        onSelect={(t) => {
          if (pickerSide === "de") onDeSymbolChange(t.symbol);
          else if (pickerSide === "a") onASymbolChange(t.symbol);
        }}
        onChainChange={(c) => {
          onChainChange(c);
        }}
      />
    </div>
  );
}

function UtilityButton({
  children,
  onClick,
  title,
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={
        "rounded-lg p-2 transition-colors " +
        (active
          ? "bg-white/10 text-white"
          : "text-muted-foreground hover:bg-white/5 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function TokenSelectorLarge({
  value,
  onOpenPicker,
}: {
  value: BridgeToken | null;
  onOpenPicker: () => void;
}) {
  return (
    <button
      onClick={onOpenPicker}
      className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-white/5"
      aria-label="Seleccionar token"
    >
      {value ? (
        <LargeTokenGlyph token={value} />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-sm text-muted-foreground">
          ?
        </div>
      )}
      <div className="min-w-0 text-left">
        <div className="text-base font-semibold leading-tight text-white">
          {value?.symbol ?? "Select"}
        </div>
      </div>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function LargeTokenGlyph({ token }: { token: BridgeToken }) {
  return (
    <div className="relative h-11 w-11 shrink-0">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${token.gradient[0]}, ${token.gradient[1]})`,
          boxShadow: `0 4px 12px ${token.gradient[0]}40`,
        }}
      >
        {token.symbol.slice(0, 3)}
      </div>
    </div>
  );
}

function SwapRouteInfo({
  de,
  a,
  chain,
  ratio,
  inverseRatio,
  slippage,
  usdValue,
  connected,
}: {
  de: SwapPanelState;
  a: SwapPanelState;
  chain: ChainId;
  ratio: number;
  inverseRatio: number;
  slippage: string;
  usdValue: number;
  connected: boolean;
}) {
  const currentChain = CHAINS[chain];
  return (
    <div className="space-y-2 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
      <RouteRow
        icon={<TrendingUp className="h-3 w-3 text-[#8b7cf6]" />}
        label="Ratio"
        value={
          ratio > 0 ? (
            <span>
              1 {de.token?.symbol} = {ratio.toFixed(ratio < 1 ? 6 : 2)} {a.token?.symbol}
              <span className="ml-1 text-muted-foreground">
                · 1 {a.token?.symbol} = {inverseRatio.toFixed(inverseRatio < 1 ? 6 : 2)} {de.token?.symbol}
              </span>
            </span>
          ) : (
            "—"
          )
        }
      />
      <RouteRow
        icon={<ShieldCheck className="h-3 w-3 text-[#8b7cf6]" />}
        label="Tolerancia slippage"
        value={slippage}
      />
      <RouteRow
        icon={<Info className="h-3 w-3 text-[#8b7cf6]" />}
        label="Fee de red"
        value={
          <span>
            <span className="font-medium">{currentChain.nativeSymbol}</span> gas
            <span className="ml-1 text-muted-foreground">+ 0.05% fee</span>
          </span>
        }
      />
      <RouteRow
        icon={<Clock className="h-3 w-3 text-[#8b7cf6]" />}
        label="Tiempo estimado"
        value={currentChain.bridgeTime}
      />
      <RouteRow
        icon={<PieChart className="h-3 w-3 text-[#8b7cf6]" />}
        label="Total"
        value={
          <span>
            ${usdValue.toFixed(2)}{" "}
            <span className="text-muted-foreground">USD</span>
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
      <span className="text-right text-white/85">{value}</span>
    </div>
  );
}
