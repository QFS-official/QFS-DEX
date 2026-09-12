"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  // next-themes reads from localStorage which isn't available on the server,
  // so we only render the active icon after mount to avoid hydration mismatch
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const current = mounted ? resolvedTheme ?? theme : "dark";
  const isLight = current === "light";

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="portal-pill flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-all hover:bg-white/[0.07] hover:text-foreground"
            aria-label={t("header.theme.toggle")}
            title={t("header.theme.toggle")}
          >
            {mounted ? (
              isLight ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              // Placeholder icon during SSR / hydration
              <Moon className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {t("header.theme.toggle")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
