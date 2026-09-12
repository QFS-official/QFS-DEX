import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QFS Swap — BNB · Polygon · Solana · Ethereum",
  description:
    "Cross-chain bridge for BNB Chain, Polygon, Solana, and Ethereum. Connect MetaMask, Coinbase Wallet, Trust Wallet, Binance Web3 Wallet, or any mobile wallet via WalletConnect to bridge USDC, USDT, ETH, and native gas tokens across chains.",
  keywords: ["QFS Swap", "BNB Chain", "Polygon", "Solana", "Ethereum", "cross-chain bridge", "MetaMask", "Coinbase Wallet", "Trust Wallet", "WalletConnect"],
  authors: [{ name: "QFS Swap" }],
  icons: {
    icon: "/qfs-logo.png",
    apple: "/qfs-logo.png",
  },
  openGraph: {
    title: "QFS Swap — BNB · Polygon · Solana · Ethereum",
    description: "Cross-chain bridge for BNB Chain, Polygon, Solana, and Ethereum.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QFS Swap — BNB · Polygon · Solana · Ethereum",
    description: "Cross-chain bridge for BNB Chain, Polygon, Solana, and Ethereum.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
