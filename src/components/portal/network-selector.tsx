"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CHAIN_LIST,
  type ChainConfig,
  type ChainId,
} from "@/lib/bridge/chains";

interface Props {
  value: ChainId;
  onChange: (next: ChainId) => void;
  /** Chain ids that should be hidden from this dropdown (e.g. the destination dropdown hides the source selection if you want to force cross-chain) */
  exclude?: ChainId[];
  label?: string;
}

export function NetworkSelector({ value, onChange, exclude = [], label }: Props) {
  const current = CHAIN_LIST.find((c) => c.id === value)!;
  const options = CHAIN_LIST.filter((c) => !exclude.includes(c.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="portal-pill flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.07]"
          aria-label={`Select network — current ${current.name}`}
        >
          <ChainGlyph chain={current} />
          <div className="min-w-0">
            <div className="text-xs font-semibold leading-tight text-white">
              {current.name}
            </div>
            <div className="text-[10px] leading-tight text-muted-foreground">
              {current.shortName}
            </div>
          </div>
          <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[200px] rounded-xl border-white/10 bg-[#1a1832] p-1 text-white"
      >
        {label && (
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
        )}
        {options.map((chain) => {
          const selected = chain.id === value;
          return (
            <DropdownMenuItem
              key={chain.id}
              onSelect={(e) => {
                e.preventDefault();
                onChange(chain.id);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm focus:bg-white/5"
            >
              <ChainGlyph chain={chain} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{chain.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {chain.shortName} · {chain.bridgeTime}
                </div>
              </div>
              {selected && <Check className="h-4 w-4 text-[#8b7cf6]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChainGlyph({ chain }: { chain: ChainConfig }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{
        background: `linear-gradient(135deg, ${chain.gradient[0]}, ${chain.gradient[1]})`,
        boxShadow: `0 2px 6px ${chain.gradient[0]}55`,
      }}
    >
      {chain.glyph}
    </div>
  );
}
