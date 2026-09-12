/**
 * Chain configurations for the Portal-style bridge.
 * Covers BNB Chain (BSC), Polygon, Solana, and Ethereum mainnet.
 */

export type ChainId = "bnb" | "polygon" | "solana" | "eth";

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  /** EVM chain id in hex (e.g. "0x38") — null for non-EVM chains like Solana */
  evmChainIdHex: string | null;
  /** Decimal EVM chain id, null for non-EVM */
  evmChainId: number | null;
  /** Block explorer URL */
  explorer: string;
  /** Native token symbol */
  nativeSymbol: string;
  /** Native token name */
  nativeName: string;
  /** Gradient stops used for the chain badge */
  gradient: [string, string];
  /** Approximate bridge time shown in the UI */
  bridgeTime: string;
  /** Whether this chain is reachable through an EVM wallet (MetaMask / Coinbase) */
  isEvm: boolean;
  /** Logo glyph — a single letter or short token shown inside the chain badge */
  glyph: string;
}

export const CHAINS: Record<ChainId, ChainConfig> = {
  bnb: {
    id: "bnb",
    name: "BNB Chain",
    shortName: "BNB",
    evmChainIdHex: "0x38",
    evmChainId: 56,
    explorer: "https://bscscan.com",
    nativeSymbol: "BNB",
    nativeName: "BNB",
    gradient: ["#F0B90B", "#F8D12F"],
    bridgeTime: "~3 min",
    isEvm: true,
    glyph: "B",
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    shortName: "MATIC",
    evmChainIdHex: "0x89",
    evmChainId: 137,
    explorer: "https://polygonscan.com",
    nativeSymbol: "POL",
    nativeName: "POL",
    gradient: ["#8247E5", "#A36AE5"],
    bridgeTime: "~4 min",
    isEvm: true,
    glyph: "P",
  },
  eth: {
    id: "eth",
    name: "Ethereum",
    shortName: "ETH",
    evmChainIdHex: "0x1",
    evmChainId: 1,
    explorer: "https://etherscan.io",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    gradient: ["#627EEA", "#8A92B2"],
    bridgeTime: "~5 min",
    isEvm: true,
    glyph: "Ξ",
  },
  solana: {
    id: "solana",
    name: "Solana",
    shortName: "SOL",
    evmChainIdHex: null,
    evmChainId: null,
    explorer: "https://solscan.io",
    nativeSymbol: "SOL",
    nativeName: "Solana",
    gradient: ["#14F195", "#9945FF"],
    bridgeTime: "~2 min",
    isEvm: false,
    glyph: "S",
  },
};

export const CHAIN_LIST: ChainConfig[] = Object.values(CHAINS);

/**
 * Tokens supported by the bridge per chain. The same logical asset
 * (e.g. USDC) is bridged across chains, with a per-chain contract address.
 */
export interface BridgeToken {
  symbol: string;
  name: string;
  /** Map from chain id to the token's contract on that chain (or "native" for native gas token) */
  addressByChain: Partial<Record<ChainId, string>>;
  /** Approximate USD price used for the UI's amount preview */
  usdPrice: number;
  /** Icon emoji fallback used when no token logo is available */
  emoji: string;
  /** Optional gradient for the placeholder logo */
  gradient: [string, string];
  decimals: number;
}

export const BRIDGE_TOKENS: BridgeToken[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    addressByChain: {
      bnb: "0x8AC76a86ccAC72f7D76555AaC5Df0617DdCa8E",
      polygon: "0x3c499c542cEF5E3811e1192ce70d8cc03d5703fa",
      eth: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    usdPrice: 1.0,
    emoji: "💵",
    gradient: ["#2775CA", "#3B82F6"],
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    addressByChain: {
      bnb: "0x55d398326f99059fF7e31Ad08CFC1F7Cc8129135",
      polygon: "0xc2132D05D31c914a87C6611C10748AEc348Bf728",
      eth: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      solana: "Es9vMFrzaCERmJfrF4H2FY5NMAfjH3E2SkoH2EF5pdrT",
    },
    usdPrice: 1.0,
    emoji: "💵",
    gradient: ["#26A17B", "#1FA171"],
    decimals: 6,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    addressByChain: {
      bnb: "0x2170Ed0880ac9C75B4F8a8B0C1B5E8E5c5D5Aa5",
      polygon: "0x7ceB23fD6bC0adD59262eD9025EeB5b5b5b5b5b5",
      eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    usdPrice: 2350.0,
    emoji: "💎",
    gradient: ["#627EEA", "#4255A6"],
    decimals: 18,
  },
  {
    symbol: "WORM",
    name: "Wormhole",
    addressByChain: {
      bnb: "0x4fE9355e25b6D5D6f2c9E17580Bc0eA1B0F5Aa5",
      polygon: "0xD76C0eA1B0F5Aa5e25b6D5D6f2c9E17580Bc0eA1",
      eth: "0x6985881eC6C4098270259b7BCd2B0B1a5B5B5B5B",
      solana: "worm3DTm7BkJv5k7vU3yB8D5c8b9k2V9M1cJ4D5f",
    },
    usdPrice: 0.42,
    emoji: "🐛",
    gradient: ["#8b7cf6", "#5d4bcc"],
    decimals: 18,
  },
];

export const NATIVE_BY_CHAIN: Record<ChainId, BridgeToken> = {
  bnb: {
    symbol: "BNB",
    name: "BNB",
    addressByChain: { bnb: "native" },
    usdPrice: 580.0,
    emoji: "🟡",
    gradient: ["#F0B90B", "#F8D12F"],
    decimals: 18,
  },
  polygon: {
    symbol: "POL",
    name: "POL",
    addressByChain: { polygon: "native" },
    usdPrice: 0.42,
    emoji: "🟣",
    gradient: ["#8247E5", "#A36AE5"],
    decimals: 18,
  },
  eth: {
    symbol: "ETH",
    name: "Ether",
    addressByChain: { eth: "native" },
    usdPrice: 2350.0,
    emoji: "Ξ",
    gradient: ["#627EEA", "#8A92B2"],
    decimals: 18,
  },
  solana: {
    symbol: "SOL",
    name: "Solana",
    addressByChain: { solana: "native" },
    usdPrice: 145.0,
    emoji: "🟢",
    gradient: ["#14F195", "#9945FF"],
    decimals: 9,
  },
};

/**
 * Returns the tokens that are bridgeable on a given chain
 * (the chain's native token + every token that has an address on this chain).
 */
export function tokensForChain(chainId: ChainId): BridgeToken[] {
  const native = NATIVE_BY_CHAIN[chainId];
  const bridging = BRIDGE_TOKENS.filter((t) => t.addressByChain[chainId]);
  return [native, ...bridging];
}
