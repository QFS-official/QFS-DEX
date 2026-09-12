"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translate, type Lang, LANGS } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Translate a key with optional {param} interpolation */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "qfs:lang";

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  // Auto-detect from navigator.language
  const nav = navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("en") ? "en" : "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "es" on server, hydrate to actual choice on mount
  const [lang, setLangState] = useState<Lang>("es");
  // Skip the first write so we don't overwrite the stored value before hydration
  const skipNextWrite = useRef(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLangState(readInitialLang()), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Persist + update <html lang="..."> whenever the language changes
  useEffect(() => {
    if (skipNextWrite.current) {
      // The first effect run happens before hydration completes —
      // skip it so we don't overwrite the stored value with the initial "es".
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* quota */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback for components used outside the provider —
    // returns Spanish with the lookup function still working
    return {
      lang: "es",
      setLang: () => {},
      t: (key, params) => translate("es", key, params),
    };
  }
  return ctx;
}

export { LANGS };
export type { Lang };
