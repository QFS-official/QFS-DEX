# QFS Swap

Cross-chain DEX + bridge + airdrop interface for BNB Chain, Polygon, Solana, and Ethereum.

Built with Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui.

## Features

### Swap (OKX-style)
- Same-chain token swaps with live price ratio
- Token picker modal with search, network filter tabs, verified badges, live prices + 24h change
- Favorite pairs persisted to localStorage
- Recent swaps history (max 30 records) with status icons and explorer links
- Live price chart (Recharts) with 1H / 24H / 7D / 30D ranges

### Bridge (Portal-style)
- Cross-chain transfers between BNB / Polygon / Solana / Ethereum
- Per-side network + token selectors
- Route info: estimated time, fee, gas

### Airdrop
- Mass token distribution to up to 500 recipients per transaction
- Recipient validation per chain (EVM + Solana base58)
- Live gas estimation, recipients counter (valid + invalid badges)
- Paste-from-clipboard support
- Supported on Ethereum, BNB Chain, Polygon, Solana

### Wallets
- MetaMask, Trust Wallet, Coinbase Wallet, Binance Web3 Wallet (EIP-1193 detection)
- WalletConnect protocol with QR code (universal links for iOS / Android)
- Mobile wallets catalog with Populares / Recientes tabs + search filter
- Device detection (iOS / Android / desktop) with deep-link routing

### Internationalization
- Spanish (default) + English
- ~150 translation keys covering all user-facing strings
- Auto-detect from `navigator.language`, persisted to localStorage

### Theming
- Dark (default, deep navy + lavender accent) + Light (cream + navy)
- Sun/Moon toggle in header
- All portal utility classes (`.portal-card`, `.portal-bg`, etc.) have light overrides

## Supported Tokens

| Symbol  | Ethereum | Polygon | BNB Chain | Solana |
|---------|----------|---------|-----------|--------|
| QFS     | `0x7C670...305E` | `0xb5787...49E7` | – | – |
| ALARAB  | `0x93617...e358` | `0xF5c06...14B8` | – | – |
| GCRM    | `0x2Ae2d...9B3`   | `0x11175...046f` | – | – |
| TRAEX   | – | `0xf343c...9dD0` | – | – |
| USDC    | ✅ | ✅ | ✅ | ✅ |
| USDT    | ✅ | ✅ | ✅ | ✅ |
| WETH    | ✅ | ✅ | ✅ | – |
| WORM    | ✅ | ✅ | ✅ | ✅ |

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Charts**: Recharts
- **Animation**: Framer Motion
- **i18n**: Custom context + flat-key translations (`src/lib/i18n/`)
- **Theme**: `next-themes` (class-based)
- **State**: Zustand + TanStack Query (available, not heavily used)
- **Database**: Prisma + SQLite (available, used for swap history persistence via localStorage instead)

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Theme variables + portal utility classes
│   ├── layout.tsx         # ThemeProvider + LanguageProvider
│   └── page.tsx           # Main page (only route)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   └── portal/           # QFS Swap components
│       ├── airdrop-card.tsx
│       ├── bridge-card.tsx
│       ├── swap-card.tsx
│       ├── token-picker-modal.tsx
│       ├── wallet-connect-modal.tsx
│       ├── walletconnect-qr-modal.tsx
│       ├── price-chart.tsx
│       ├── swap-history.tsx
│       ├── favorite-pairs.tsx
│       ├── mode-tabs.tsx
│       ├── portal-header.tsx
│       ├── theme-toggle.tsx
│       └── language-toggle.tsx
├── hooks/
│   └── use-wallet.ts      # EIP-1193 wallet detection + connect
├── lib/
│   ├── bridge/
│   │   └── chains.ts     # Chain + token catalog
│   ├── i18n/
│   │   ├── translations.ts
│   │   └── LanguageContext.tsx
│   ├── swap/
│   │   ├── favorites.ts
│   │   ├── history.ts
│   │   └── price-data.ts
│   └── wallets/
│       └── mobile-recents.ts
└── public/
    └── qfs-logo.png
```

## Development

```bash
bun install
bun run dev          # starts on port 3000
bun run lint         # ESLint
bun run db:push      # apply Prisma schema (optional)
```

## Production Notes

- **Swap / Bridge / Airdrop actions are simulated** (no on-chain transactions) — replace the `setTimeout` mocks in `handleSwap` / `handleBridge` / `handleAirdrop` with real Wormhole SDK + token contract calls.
- **WalletConnect uses a demo URI** — to enable real WC, install `@walletconnect/ethereum-provider`, register a projectId at [cloud.walletconnect.com](https://cloud.walletconnect.com), and initialize the provider in `use-wallet.ts`.
- **Token prices are static** — replace `usdPrice` and `change24h` in `src/lib/bridge/chains.ts` with live CoinGecko API calls.
- **Solana is not reachable via MetaMask/Coinbase** — the UI shows an amber warning pointing users to Phantom Wallet for Solana-side operations.

## License

MIT
