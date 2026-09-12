"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type BridgeMode = "swap" | "dca" | "bridge" | "airdrop";

interface ModeTabsProps {
  value: BridgeMode;
  onChange: (next: BridgeMode) => void;
}

export function ModeTabs({ value, onChange }: ModeTabsProps) {
  const { t } = useLanguage();
  const TABS: { id: BridgeMode; label: string; isNew?: boolean }[] = [
    { id: "swap", label: t("mode.swap") },
    { id: "dca", label: t("mode.dca"), isNew: true },
    { id: "bridge", label: t("mode.bridge") },
    { id: "airdrop", label: t("mode.airdrop") },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1 backdrop-blur-md">
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={
              "relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
              (active ? "text-[#0b0a1f]" : "text-muted-foreground hover:text-foreground")
            }
          >
            {active && (
              <motion.div
                layoutId="mode-tab-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.label}
              {tab.isNew && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#8b7cf6]"
                  title="New"
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
