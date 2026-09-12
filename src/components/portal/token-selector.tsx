"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type BridgeToken } from "@/lib/bridge/chains";

interface Props {
  value: BridgeToken | null;
  options: BridgeToken[];
  onChange: (token: BridgeToken) => void;
  disabled?: boolean;
}

export function TokenSelector({ value, options, onChange, disabled }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className="portal-pill flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {value ? (
            <TokenGlyph token={value} />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-muted-foreground">
              ?
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold leading-tight text-foreground">
              {value?.symbol ?? "Select"}
            </div>
            <div className="text-[10px] leading-tight text-muted-foreground">
              {value?.name ?? "Choose a token"}
            </div>
          </div>
          <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] rounded-xl border-white/10 bg-[#1a1832] p-1 text-foreground"
      >
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          Select a token
        </div>
        {options.map((t) => {
          const selected = !!value && value.symbol === t.symbol;
          return (
            <DropdownMenuItem
              key={t.symbol}
              onSelect={(e) => {
                e.preventDefault();
                onChange(t);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm focus:bg-white/5"
            >
              <TokenGlyph token={t} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{t.symbol}</div>
                <div className="text-[10px] text-muted-foreground">
                  {t.name} · ≈ ${t.usdPrice.toFixed(2)}
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

export function TokenGlyph({ token }: { token: BridgeToken }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-foreground"
      style={{
        background: `linear-gradient(135deg, ${token.gradient[0]}, ${token.gradient[1]})`,
        boxShadow: `0 2px 6px ${token.gradient[0]}55`,
      }}
    >
      {token.symbol.slice(0, 2)}
    </div>
  );
}
