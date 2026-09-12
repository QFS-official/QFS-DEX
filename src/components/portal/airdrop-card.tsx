"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardPaste,
  Coins,
  Droplets as GasIcon,
  Loader2,
  Settings2,
  Users,
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
import { WalletConnectModal } from "./wallet-connect-modal";
import { TokenPickerModal } from "./token-picker-modal";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { addSwapRecord } from "@/lib/swap/history";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AirdropCardProps {
  wallet: ReturnType<typeof useWallet>;
}

const EVM_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDR_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const MAX_RECIPIENTS = 500;

function isValidAddress(addr: string, chain: ChainId): boolean {
  if (CHAINS[chain].isEvm) return EVM_ADDR_RE.test(addr);
  return SOLANA_ADDR_RE.test(addr);
}

function parseRecipients(text: string, chain: ChainId): { valid: string[]; invalid: string[] } {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const tokens = text
    .split(/[\s,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const t of tokens) {
    if (seen.has(t)) continue; // dedupe
    seen.add(t);
    if (isValidAddress(t, chain)) {
      if (valid.length < MAX_RECIPIENTS) valid.push(t);
    } else {
      invalid.push(t);
    }
  }
  return { valid, invalid };
}

export function AirdropCard({ wallet }: AirdropCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  // ─── Trade state ────────────────────────────────────────────────────────
  const [chain, setChain] = useState<ChainId>("polygon");
  const [tokenSymbol, setTokenSymbol] = useState<string>("QFS");
  const [amountPerRecipient, setAmountPerRecipient] = useState<string>("");
  const [recipientsText, setRecipientsText] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTx, setSentTx] = useState<string | null>(null);

  // Subscribe to the floating "Connect wallet" pill click
  useEffect(() => {
    function opener() {
      setModalOpen(true);
    }
    document.addEventListener("portal:open-wallet", opener);
    return () => document.removeEventListener("portal:open-wallet", opener);
  }, []);

  const tokens = useMemo(() => tokensForChain(chain), [chain]);

  // Auto-pick a sensible token when chain changes (QFS if available, else native, else first)
  const token = useMemo<BridgeToken | null>(() => {
    const match = tokens.find((tk) => tk.symbol === tokenSymbol);
    if (match) return match;
    return tokens.find((tk) => tk.symbol === "QFS") ?? NATIVE_BY_CHAIN[chain] ?? tokens[0] ?? null;
  }, [tokens, tokenSymbol, chain]);

  // Parse + validate recipients
  const { valid: validRecipients, invalid: invalidRecipients } = useMemo(
    () => parseRecipients(recipientsText, chain),
    [recipientsText, chain],
  );

  const amount = parseFloat(amountPerRecipient || "0") || 0;
  const tokenPrice = token?.usdPrice ?? 0;
  const totalAmount = amount * validRecipients.length;
  const totalUsd = totalAmount * tokenPrice;
  const gasEstimatePerRecipient = CHAINS[chain].isEvm ? 0.0008 : 0.000012; // mock
  const totalGas = gasEstimatePerRecipient * Math.max(validRecipients.length, 1);
  const gasUsd = totalGas * (tokenPrice || 1) * 200; // mock USD conversion factor

  const chainEvm = CHAINS[chain].isEvm;
  const connected = !!wallet.address;
  const walletChainMatches = connected && CHAINS[chain].evmChainId === wallet.chainId;
  const pairFavorited = false; // placeholder — could wire favorites for token+chain

  const cta = (() => {
    if (!validRecipients.length) return { label: t("airdrop.cta.noRecipients"), disabled: true };
    if (!amount || amount <= 0) return { label: t("airdrop.cta.enterAmount"), disabled: true };
    if (!chainEvm) return { label: t("airdrop.cta.solana"), disabled: true };
    if (!connected) return { label: t("airdrop.cta.connect"), disabled: false };
    if (!walletChainMatches) {
      return { label: t("airdrop.cta.switchChain", { chain: CHAINS[chain].name }), disabled: false };
    }
    return { label: t("airdrop.cta.send"), disabled: false };
  })();

  async function handlePasteClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast({
          title: t("toast.clipboardEmpty.title"),
          description: t("toast.clipboardEmpty.desc"),
          variant: "destructive",
        });
        return;
      }
      setRecipientsText((prev) => (prev ? prev + "\n" + text : text));
      toast({
        title: t("toast.pasted.title"),
        description: text.length > 60 ? text.slice(0, 40) + "…" + text.slice(-20) : text,
      });
    } catch {
      toast({
        title: t("toast.clipboardFail.title"),
        description: t("toast.clipboardFail.desc"),
        variant: "destructive",
      });
    }
  }

  async function handleAirdrop() {
    if (cta.disabled) {
      if (!chainEvm) {
        toast({
          title: t("toast.solana.title"),
          description: t("toast.solana.desc"),
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
          title: t("toast.switchFail.title"),
          description: t("toast.switchFail.desc", { chain: CHAINS[chain].name }),
          variant: "destructive",
        });
      }
      return;
    }

    setSending(true);
    setSentTx(null);
    await new Promise((r) => setTimeout(r, 2500));
    const fakeTx = "0x" + Math.random().toString(16).slice(2).padEnd(64, "a").slice(0, 64);
    setSentTx(fakeTx);
    setSending(false);

    // Persist to swap history
    addSwapRecord({
      fromSymbol: token?.symbol ?? "?",
      toSymbol: t("airdrop.recipients"),
      fromAmount: totalAmount,
      toAmount: validRecipients.length,
      usdValue: totalUsd,
      chain,
      txHash: fakeTx,
    });

    toast({
      title: t("airdrop.sent", { count: validRecipients.length }),
      description: `${totalAmount.toFixed(4)} ${token?.symbol} · ${validRecipients.length} ${t("airdrop.distribution.recipients")} · ${CHAINS[chain].name}`,
    });

    setTimeout(() => {
      setSentTx(null);
    }, 8000);
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Glow */}
      <div
        className="absolute -inset-3 -z-10 rounded-[2rem] opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139, 124, 246, 0.35), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="portal-card relative overflow-hidden rounded-3xl"
      >
        {/* Sub-header: Airdrop title + utility icons */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("airdrop.title")}</h2>
          </div>
          <div className="flex items-center gap-1">
            <UtilityButton
              title={t("airdrop.pasteCA")}
              onClick={handlePasteClipboard}
            >
              <ClipboardPaste className="h-4 w-4" />
            </UtilityButton>
            <UtilityButton
              title={t("swap.settings.title")}
              onClick={() => setShowSettings((s) => !s)}
              active={showSettings}
            >
              <Settings2 className="h-4 w-4" />
            </UtilityButton>
          </div>
        </div>

        {/* Network selector row */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("airdrop.network")}
            </span>
            <NetworkSelector
              value={chain}
              onChange={setChain}
              label={t("picker.network")}
            />
          </div>
        </div>

        {/* Token + amount per recipient */}
        <div className="px-5 pt-4">
          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t("airdrop.amountPerRecipient")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Token selector */}
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-white/5"
                aria-label={t("picker.title.pay")}
              >
                {token ? (
                  <TokenGlyph token={token} />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-sm text-muted-foreground">?</div>
                )}
                <div className="min-w-0 text-left">
                  <div className="text-base font-semibold leading-tight text-foreground">
                    {token?.symbol ?? "Select"}
                  </div>
                </div>
              </button>
              {/* Amount input */}
              <input
                inputMode="decimal"
                type="text"
                placeholder="0.0"
                value={amountPerRecipient}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  setAmountPerRecipient(v);
                }}
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-foreground placeholder:text-foreground/25 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ ${(amount * tokenPrice).toFixed(2)} {t("airdrop.distribution.perRecipient")}</span>
              <span>{token?.name ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Recipients textarea */}
        <div className="px-5 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              {t("airdrop.recipients")}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {recipientsText && (
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-full bg-[#14F195]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#14F195] ring-1 ring-[#14F195]/30">
                    {t("airdrop.recipients.valid", { count: validRecipients.length })}
                  </span>
                  {invalidRecipients.length > 0 && (
                    <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
                      {t("airdrop.recipients.invalid", { count: invalidRecipients.length })}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
          <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
            <textarea
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder={t("airdrop.recipients.placeholder")}
              rows={5}
              className="portal-scroll-hidden w-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              aria-label={t("airdrop.recipients")}
            />
          </div>
          {recipientsText && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {t("airdrop.distribution")}: {amount || 0} {token?.symbol}{" "}
                {t("airdrop.distribution.perRecipient")} {t("airdrop.distribution.to")}{" "}
                <span className="font-semibold text-foreground">
                  {validRecipients.length}
                </span>{" "}
                {t("airdrop.distribution.recipients")}
              </span>
              <button
                onClick={() => setRecipientsText("")}
                className="rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-300"
                title={t("airdrop.clear")}
              >
                {t("airdrop.clear")}
              </button>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="px-5 pt-4">
          <div className="space-y-2 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
            <SummaryRow
              icon={<Users className="h-3 w-3 text-[#8b7cf6]" />}
              label={t("airdrop.total.recipients")}
              value={String(validRecipients.length)}
            />
            <SummaryRow
              icon={<Coins className="h-3 w-3 text-[#8b7cf6]" />}
              label={t("airdrop.total.amount")}
              value={
                <span>
                  {totalAmount > 0 ? totalAmount.toFixed(4) : "0.0000"}{" "}
                  <span className="text-muted-foreground">{token?.symbol}</span>
                  <span className="ml-1 text-muted-foreground">≈ ${totalUsd.toFixed(2)}</span>
                </span>
              }
            />
            <SummaryRow
              icon={<GasIcon className="h-3 w-3 text-[#8b7cf6]" />}
              label={t("airdrop.total.gas")}
              value={
                <span>
                  {totalGas.toFixed(4)} <span className="text-muted-foreground">{CHAINS[chain].nativeSymbol}</span>
                  <span className="ml-1 text-muted-foreground">≈ ${gasUsd.toFixed(2)}</span>
                </span>
              }
            />
            <SummaryRow
              icon={<Zap className="h-3 w-3 text-[#8b7cf6]" />}
              label={t("swap.route.time")}
              value={CHAINS[chain].bridgeTime}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-4">
          <button
            onClick={handleAirdrop}
            disabled={cta.disabled || sending}
            className="portal-cta flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-[#0b0a1f] transition-all hover:bg-white/90 hover:shadow-[0_12px_32px_rgba(255,255,255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("airdrop.cta.processing")}
              </>
            ) : (
              cta.label
            )}
          </button>

          {sentTx && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between rounded-lg border border-[#8b7cf6]/30 bg-[#8b7cf6]/10 px-3 py-2 text-xs text-[#b8a8ff]"
            >
              <span>{t("airdrop.sent", { count: validRecipients.length })}</span>
              <a
                href={`${CHAINS[chain].explorer}/tx/${sentTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] underline underline-offset-2"
              >
                {sentTx.slice(0, 10)}…{sentTx.slice(-6)}
              </a>
            </motion.div>
          )}

          {!chainEvm && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <p>{t("airdrop.warning.solana")}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Token picker — single side (only the token to airdrop) */}
      <TokenPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tokens={tokens}
        currentChain={chain}
        side="de"
        currentSymbol={token?.symbol ?? null}
        onSelect={(tk) => setTokenSymbol(tk.symbol)}
        onChainChange={(c) => setChain(c)}
      />

      {/* Wallet connect modal */}
      <WalletConnectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        wallet={wallet}
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
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            title={title}
            aria-label={title}
            className={
              "rounded-lg p-2 transition-colors " +
              (active
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground")
            }
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TokenGlyph({ token }: { token: BridgeToken }) {
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

function SummaryRow({
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
