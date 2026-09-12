"use client";

import { useCallback, useMemo } from "react";
import { PortalFooter, PortalHeader } from "@/components/portal/portal-header";
import { BridgeCard } from "@/components/portal/bridge-card";
import { useWallet } from "@/hooks/use-wallet";
import { CHAINS, type ChainId } from "@/lib/bridge/chains";

export default function Home() {
  const wallet = useWallet();

  const selectedChain = useMemo(() => {
    return CHAINS[wallet.chainId ? chainIdFromEvm(wallet.chainId) ?? "bnb" : "bnb"];
  }, [wallet.chainId]);

  // Open the wallet modal that lives inside BridgeCard by dispatching
  // a custom event BridgeCard listens for.
  const openWallet = useCallback(() => {
    document.dispatchEvent(new CustomEvent("portal:open-wallet"));
  }, []);

  return (
    <div className="portal-bg portal-grid-bg relative flex min-h-screen flex-col">
      <PortalHeader wallet={wallet} onOpenWallet={openWallet} />

      <main className="flex flex-1 items-start justify-center px-4 pt-4 sm:items-center sm:pt-8">
        <div className="flex w-full flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Bridge across BNB · Polygon · Solana
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cross-chain swaps powered by the Wormhole portal protocol.
              {selectedChain.evmChainId === wallet.chainId && wallet.address
                ? ` Connected to ${selectedChain.name}.`
                : ""}
            </p>
          </div>

          <BridgeCard wallet={wallet} />

          {/* Helper note for Solana */}
          <div className="max-w-md text-center text-[11px] text-muted-foreground">
            MetaMask and Coinbase Wallet connect to BNB Chain and Polygon.
            For Solana, install{" "}
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
      </main>

      <PortalFooter />
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
