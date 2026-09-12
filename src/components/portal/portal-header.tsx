"use client";

import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useWallet, WALLETS } from "@/hooks/use-wallet";
import { CHAINS } from "@/lib/bridge/chains";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface HeaderProps {
  wallet: ReturnType<typeof useWallet>;
  onOpenWallet?: () => void;
}

export function PortalHeader({ wallet, onOpenWallet }: HeaderProps) {
  const { t } = useLanguage();
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-white/10">
            <Image
              src="/qfs-logo.png"
              alt="QFS Swap logo"
              width={36}
              height={36}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            QFS <span className="text-[#8b7cf6]">Swap</span>
          </span>
          <span className="hidden rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/10 sm:inline">
            {t("header.brand.badge")}
          </span>
        </div>

        {/* Right cluster: nav + theme + language + wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink active>{t("header.nav.swap")}</NavLink>
            <NavLink>{t("header.nav.usdc")}</NavLink>
            <NavLink>{t("header.nav.explorer")}</NavLink>
          </nav>
          <ThemeToggle />
          <LanguageToggle />
          <WalletPill wallet={wallet} onOpenWallet={onOpenWallet} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href="#"
      className={
        active
          ? "rounded-lg px-3 py-1.5 text-sm font-medium text-foreground ring-1 ring-white/10"
          : "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {children}
    </a>
  );
}

function WalletPill({
  wallet,
  onOpenWallet,
}: {
  wallet: ReturnType<typeof useWallet>;
  onOpenWallet?: () => void;
}) {
  const { t } = useLanguage();
  // Look up the connected wallet's metadata to render the correct brand color
  const meta = wallet.kind ? WALLETS.find((w) => w.id === wallet.kind) : null;
  const dotGradient = meta
    ? `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`
    : "linear-gradient(135deg, #8b7cf6, #7c6cf0)";
  const dotGlow = meta ? meta.gradient[0] : "#8b7cf6";

  return (
    <button
      onClick={() => onOpenWallet?.()}
      className="portal-pill flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/[0.07]"
      aria-label={
        wallet.address
          ? t("header.wallet.connected", { address: wallet.shortAddress ?? "" })
          : t("header.wallet.connect")
      }
    >
      {wallet.isConnecting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : wallet.address ? (
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background: dotGradient,
            boxShadow: `0 0 8px ${dotGlow}`,
          }}
        />
      ) : (
        <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60" />
      )}
      <span className="font-mono">
        {wallet.address
          ? wallet.shortAddress
          : wallet.isConnecting
            ? t("header.wallet.connecting")
            : t("header.wallet.connect")}
      </span>
    </button>
  );
}

/**
 * Footer showing the supported chains and a small disclaimer — QFS Swap style.
 */
export function PortalFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto w-full px-4 pb-6 pt-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="portal-divider mb-6" />
        <div className="flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8b7cf6]" />
            <span>{t("footer.powered")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="uppercase tracking-widest">{t("footer.networks")}</span>
            {Object.values(CHAINS).map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                />
                <span className="font-medium text-foreground/80">{c.name}</span>
              </span>
            ))}
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            {t("footer.docs")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
