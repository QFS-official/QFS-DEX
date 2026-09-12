"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import type { ChainId } from "@/lib/bridge/chains";
import { CHAINS } from "@/lib/bridge/chains";
import { useFavorites, type FavoritePair } from "@/lib/swap/favorites";

interface Props {
  /** Current pair context — controls the "add/remove favorite" pill */
  currentFrom: string;
  currentTo: string;
  currentChain: ChainId;
  /** Called when the user clicks a favorite chip — apply that pair */
  onApply: (fav: FavoritePair) => void;
  /** Called when the user clicks the star to toggle current pair */
  onToggleCurrent?: () => void;
}

export function FavoritePairs({
  currentFrom,
  currentTo,
  currentChain,
  onApply,
  onToggleCurrent,
}: Props) {
  const { favorites, isFavorite, toggle } = useFavorites();
  const currentFavorited = isFavorite(currentFrom, currentTo, currentChain);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Star / add current pair */}
      <button
        onClick={() => {
          if (onToggleCurrent) onToggleCurrent();
          else toggle(currentFrom, currentTo, currentChain);
        }}
        className={
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors " +
          (currentFavorited
            ? "bg-[#8b7cf6]/15 text-[#b8a8ff] ring-[#8b7cf6]/40 hover:bg-[#8b7cf6]/25"
            : "bg-white/[0.04] text-muted-foreground ring-white/8 hover:text-white hover:bg-white/[0.07]")
        }
        title={currentFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Star
          className={"h-3 w-3 " + (currentFavorited ? "fill-[#8b7cf6] text-[#8b7cf6]" : "")}
        />
        {currentFrom}/{currentTo}
      </button>

      {/* Divider */}
      {favorites.length > 0 && (
        <span className="mx-1 h-3 w-px bg-white/10" aria-hidden />
      )}

      {/* Favorite chips */}
      <AnimatePresence initial={false}>
        {favorites.map((fav) => {
          const isCurrent =
            fav.fromSymbol === currentFrom &&
            fav.toSymbol === currentTo &&
            fav.chain === currentChain;
          const chain = CHAINS[fav.chain];
          return (
            <motion.div
              key={fav.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={
                "group inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-xs ring-1 transition-colors " +
                (isCurrent
                  ? "bg-[#8b7cf6]/15 text-[#b8a8ff] ring-[#8b7cf6]/30"
                  : "bg-white/[0.04] text-white/80 ring-white/8 hover:bg-white/[0.07]")
              }
            >
              {/* Chain glyph (left) */}
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${chain.gradient[0]}, ${chain.gradient[1]})`,
                }}
                title={chain.name}
              >
                {chain.glyph}
              </span>
              {/* Apply button */}
              <button
                onClick={() => onApply(fav)}
                className="font-medium"
                title={`Aplicar par ${fav.fromSymbol}/${fav.toSymbol} en ${chain.name}`}
              >
                {fav.fromSymbol}/{fav.toSymbol}
              </button>
              {/* Remove button */}
              <button
                onClick={() => toggle(fav.fromSymbol, fav.toSymbol, fav.chain)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-white/10 hover:text-red-300"
                aria-label={`Quitar ${fav.fromSymbol}/${fav.toSymbol} de favoritos`}
                title="Quitar de favoritos"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {favorites.length === 0 && !currentFavorited && (
        <span className="text-[11px] text-muted-foreground">
          Pulsa <Star className="inline h-2.5 w-2.5" /> para guardar pares frecuentes.
        </span>
      )}
    </div>
  );
}
