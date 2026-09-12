"use client";

import { useState } from "react";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, LANGS } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="portal-pill flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-foreground/80 transition-all hover:bg-white/[0.07] hover:text-foreground"
          aria-label={t("header.language.toggle")}
          title={t("header.language.toggle")}
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="font-semibold">{current.short}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] rounded-xl border-white/10 bg-[#1a1832] p-1 text-foreground"
      >
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          {t("header.language.toggle")}
        </div>
        {LANGS.map((l) => {
          const selected = l.id === lang;
          return (
            <DropdownMenuItem
              key={l.id}
              onSelect={(e) => {
                e.preventDefault();
                setLang(l.id);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm focus:bg-white/5"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-foreground/80 ring-1 ring-white/10">
                {l.short}
              </span>
              <span className="flex-1">{l.label}</span>
              {selected && <Check className="h-3.5 w-3.5 text-[#8b7cf6]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
