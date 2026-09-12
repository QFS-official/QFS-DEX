"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

const PARTNERS: { name: string; gradient: [string, string]; glyph: string }[] = [
  { name: "Uniswap", gradient: ["#FF007A", "#FF60AA"], glyph: "U" },
  { name: "1inch", gradient: ["#FF7090", "#E63487"], glyph: "1" },
  { name: "0x", gradient: ["#333", "#111"], glyph: "0x" },
  { name: "Curve", gradient: ["#A7E0B6", "#40A070"], glyph: "C" },
  { name: "Balancer", gradient: ["#C8A2C8", "#7B5398"], glyph: "B" },
  { name: "Pancake", gradient: ["#FFD166", "#F0B90B"], glyph: "🥞" },
  { name: "Sushi", gradient: ["#FA52A0", "#8B5CF6"], glyph: "S" },
  { name: "Aerodrome", gradient: ["#0052FF", "#1A56FF"], glyph: "A" },
];

export function MarketingPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden w-full flex-col justify-between rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 lg:flex"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(139, 124, 246, 0.4), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#8b7cf6]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#b8a8ff] ring-1 ring-[#8b7cf6]/30">
          <Sparkles className="h-3 w-3" />
          Portal Routing
        </div>
        <h3 className="text-3xl font-semibold leading-tight tracking-tight text-white">
          Swapea con el <span className="text-[#8b7cf6]">mejor precio</span>
        </h3>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Elige libremente entre las rutas de los principales agregadores DEX.
          Portal Routing busca las mejores cotizaciones en más de 400 DEXs y
          30 redes, con protección MEV y ejecución óptima.
        </p>
      </div>

      {/* Partners grid */}
      <div className="relative mt-8">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          Integrado con
        </div>
        <div className="grid grid-cols-4 gap-3">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/6 bg-white/[0.02] p-3 transition-colors hover:border-white/12 hover:bg-white/[0.05]"
              title={p.name}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                }}
              >
                {p.glyph}
              </div>
              <span className="text-[10px] text-muted-foreground">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="relative mt-8 grid grid-cols-3 gap-4 border-t border-white/6 pt-6">
        <Stat value="400+" label="DEXs" />
        <Stat value="30+" label="Redes" />
        <Stat value="$2.4B" label="Volumen 24h" />
      </div>

      {/* Trust row */}
      <div className="relative mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-[#8b7cf6]" />
        <span>Audited by</span>
        <span className="font-medium text-white/80">Trail of Bits</span>
        <span>·</span>
        <Zap className="h-3.5 w-3.5 text-[#8b7cf6]" />
        <span>MEV protection</span>
      </div>

      {/* CTA link */}
      <a
        href="#"
        className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#8b7cf6] transition-colors hover:text-white"
      >
        Explora los mercados disponibles
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </motion.div>
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
