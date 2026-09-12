"use client";

import { useCallback, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PortalFooter, PortalHeader } from "@/components/portal/portal-header";
import { BridgeCard } from "@/components/portal/bridge-card";
import { SwapCard } from "@/components/portal/swap-card";
import { MarketingPanel } from "@/components/portal/marketing-panel";
import { ModeTabs, type BridgeMode } from "@/components/portal/mode-tabs";
import { useWallet } from "@/hooks/use-wallet";
import { CHAINS, type ChainId } from "@/lib/bridge/chains";

export default function Home() {
  const wallet = useWallet();
  const [mode, setMode] = useState<BridgeMode>("swap");

  const selectedChain = useMemo(() => {
    return CHAINS[wallet.chainId ? chainIdFromEvm(wallet.chainId) ?? "bnb" : "bnb"];
  }, [wallet.chainId]);

  // Open the wallet modal that lives inside the cards by dispatching a custom event.
  const openWallet = useCallback(() => {
    document.dispatchEvent(new CustomEvent("portal:open-wallet"));
  }, []);

  return (
    <div className="portal-bg portal-grid-bg relative flex min-h-screen flex-col">
      <PortalHeader wallet={wallet} onOpenWallet={openWallet} />

      {/* Mode tabs (OKX-style pill nav) */}
      <div className="flex justify-center px-4 pb-2 sm:px-6">
        <ModeTabs value={mode} onChange={setMode} />
      </div>

      <main className="flex flex-1 items-start justify-center px-4 pt-6 sm:items-center sm:pt-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-6 lg:flex-row lg:items-start">
          {/* Left: card */}
          <div className="flex flex-1 flex-col items-center gap-4 lg:flex-none lg:w-[460px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {mode === "swap" && "Swap entre tokens"}
                {mode === "dca" && "Compra programada (DCA)"}
                {mode === "bridge" && "Bridge cross-chain"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "swap" && "Mejor precio vía Portal Routing en 400+ DEXs y 30+ redes."}
                {mode === "dca" && "Configura compras recurrentes automáticas."}
                {mode === "bridge" && "Transfiere activos entre BNB, Polygon, Solana y Ethereum."}
                {selectedChain.evmChainId === wallet.chainId && wallet.address
                  ? ` Conectado a ${selectedChain.name}.`
                  : ""}
              </p>
            </div>

            {mode === "swap" && <SwapCard wallet={wallet} />}
            {mode === "bridge" && <BridgeCard wallet={wallet} />}
            {mode === "dca" && <ComingSoonCard label="DCA — próximamente" />}

            {/* Helper note for Solana */}
            <div className="max-w-md text-center text-[11px] text-muted-foreground">
              MetaMask y Coinbase Wallet conectan BNB Chain, Polygon y Ethereum.
              Para Solana, instala{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b7cf6] underline-offset-2 hover:underline"
              >
                Phantom Wallet
              </a>
              .
            </div>
          </div>

          {/* Right: marketing panel (OKX-style), only on lg+ */}
          {mode === "swap" && <MarketingPanel />}
          {mode === "bridge" && <BridgeMarketingPanel />}
          {mode === "dca" && <div className="hidden lg:block lg:w-[440px]" />}
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}

function ComingSoonCard({ label }: { label: string }) {
  return (
    <div className="portal-card flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl px-6 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-xl"
        style={{
          background: "linear-gradient(135deg, #9d8df9 0%, #7c6cf0 100%)",
          boxShadow: "0 8px 24px rgba(139, 124, 246, 0.4)",
        }}
      >
        🚀
      </div>
      <h3 className="text-lg font-semibold text-white">{label}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Estamos trabajando en esta función. Mientras tanto, usa Swap para
        operar en la misma red o Bridge para mover activos entre cadenas.
      </p>
    </div>
  );
}

/**
 * Marketing panel variant for the Bridge mode — keeps the same shape as the
 * Swap-side MarketingPanel but emphasizes cross-chain specifics.
 */
function BridgeMarketingPanel() {
  return (
    <div className="hidden w-full flex-col justify-between rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 lg:flex">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(18, 241, 149, 0.4), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#8b7cf6]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#b8a8ff] ring-1 ring-[#8b7cf6]/30">
          Portal Bridge
        </div>
        <h3 className="text-3xl font-semibold leading-tight tracking-tight text-white">
          Mueve activos <span className="text-[#8b7cf6]">entre redes</span>
        </h3>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Portal Bridge transfiere tokens nativos y wrapped entre BNB Chain,
          Polygon, Solana y Ethereum usando el protocolo Wormhole.
          Sin custodia, con hasta 5 confirmaciones de seguridad.
        </p>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-3">
        {Object.values(CHAINS).map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2.5 rounded-2xl border border-white/6 bg-white/[0.02] p-3 transition-colors hover:border-white/12 hover:bg-white/[0.05]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`,
              }}
            >
              {c.glyph}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {c.shortName} · {c.bridgeTime}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-8 grid grid-cols-3 gap-4 border-t border-white/6 pt-6">
        <Stat value="$8.4B" label="Volumen total" />
        <Stat value="4" label="Redes" />
        <Stat value="<5m" label="Tiempo medio" />
      </div>

      <div className="relative mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-[#8b7cf6]" />
        <span>Audited by</span>
        <span className="font-medium text-white/80">Trail of Bits</span>
        <span>·</span>
        <span>Non-custodial</span>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold text-white">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/** Maps a decimal EVM chain id back to our internal ChainId enum. */
function chainIdFromEvm(id: number): ChainId | null {
  for (const c of Object.values(CHAINS)) {
    if (c.evmChainId === id) return c.id;
  }
  return null;
}
