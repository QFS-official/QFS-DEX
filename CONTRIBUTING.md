# Contributing to QFS Swap

Thanks for contributing! This guide covers the basics.

## Setup

```bash
git clone https://github.com/QFS-official/QFS-DEX.git
cd QFS-DEX
bun install
bun run dev   # starts on http://localhost:3000
```

## Project conventions

### File structure

- **New components**: place in `src/components/portal/` (use existing naming pattern: `kebab-case.tsx`)
- **Business logic / stores**: place in `src/lib/<domain>/` (e.g. `src/lib/bridge/`, `src/lib/i18n/`, `src/lib/swap/`)
- **Hooks**: place in `src/hooks/` (e.g. `use-wallet.ts`)
- **Pages**: only `src/app/page.tsx` is user-visible (Next.js App Router) — don't add new routes unless absolutely necessary

### Translations (i18n)

All user-facing strings must use the `t("key")` function from `useLanguage()`:

```tsx
import { useLanguage } from "@/lib/i18n/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();
  return <button>{t("my.button.label")}</button>;
}
```

Add the key to BOTH `es` and `en` dictionaries in `src/lib/i18n/translations.ts`.

### Theming

- Use CSS variables (`text-foreground`, `bg-card`, etc.) — never `text-white` on its own (it won't adapt to light theme)
- For utility classes that need theme-specific styling, add `.light .your-class` overrides in `src/app/globals.css`
- Test your changes in BOTH dark and light themes

### Tokens

To add a new token, edit `src/lib/bridge/chains.ts`:

```typescript
{
  symbol: "MYTOKEN",
  name: "My Token",
  addressByChain: {
    eth: "0x...",     // Ethereum mainnet contract
    polygon: "0x...", // Polygon contract
    // bnb, solana — add as needed
  },
  usdPrice: 1.0,         // mock — replace with live CoinGecko data later
  change24h: 2.5,        // percent change 24h
  verified: true,        // shows blue checkmark in token picker
  emoji: "M",
  gradient: ["#FF6B35", "#F7931E"], // brand colors
  decimals: 18,
}
```

### Wallets

To add a new EVM wallet extension, edit `src/hooks/use-wallet.ts`:

1. Add the wallet id to `WalletKind`
2. Add a `WALLETS` entry with metadata (name, gradient, glyph, installUrl)
3. Update `pickProvider()` and `isWalletInstalled()` with the wallet's detection flag (e.g. `isXxxWallet`)

### Lint and build

Before pushing, run:

```bash
bun run lint   # must pass with 0 errors
bun run build  # must complete successfully
```

The GitHub Actions CI workflow will run these on every PR.

## Committing

- Use clear commit messages starting with: `feat:`, `fix:`, `chore:`, `docs:`, `i18n:`, `refactor:`, `test:`, `style:`
- Example: `feat: add OKX-style token picker modal with search filter`
- Don't commit `.env`, `db/*.db`, `node_modules/`, `*.log`, or binary artifacts (they're in `.gitignore`)

## Deployment

Pushing to `main` triggers:
1. **CI workflow** (`.github/workflows/ci.yml`) — lint + build
2. **Deploy workflow** (`.github/workflows/deploy.yml`) — pushes to Vercel production

See `README.md` → "Deployment" section for required GitHub secrets.
