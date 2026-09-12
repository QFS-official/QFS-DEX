import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Bridge — BNB · Polygon · Solana · Ethereum",
  description:
    "Cross-chain bridge for BNB Chain, Polygon, Solana, and Ethereum. Connect MetaMask or Coinbase Wallet to bridge USDC, USDT, ETH, and native gas tokens across chains.",
  keywords: ["Portal Bridge", "BNB Chain", "Polygon", "Solana", "Ethereum", "cross-chain bridge", "MetaMask", "Coinbase Wallet"],
  authors: [{ name: "Portal Bridge" }],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%239d8df9'/%3E%3Cstop offset='1' stop-color='%237c6cf0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='14' fill='url(%23g)'/%3E%3Cpath d='M10 10 L22 10 M22 10 L22 22 M22 22 L10 22 M10 22 L10 10' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
  },
  openGraph: {
    title: "Portal Bridge — BNB · Polygon · Solana · Ethereum",
    description: "Cross-chain bridge for BNB Chain, Polygon, Solana, and Ethereum.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Bridge — BNB · Polygon · Solana · Ethereum",
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
