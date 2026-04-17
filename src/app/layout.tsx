import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainLens — Blockchain Address Analyzer",
  description: "Analyze any EVM address: portfolio, transactions, and security across Ethereum, Polygon, Arbitrum, Optimism, and Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
