import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AptosWalletProvider } from '@/components/providers/WalletProvider';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aptick - Blockchain Billing System",
  description: "Decentralized billing and payment system on Aptos blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AptosWalletProvider>
          {children}
        </AptosWalletProvider>
      </body>
    </html>
  );
}
