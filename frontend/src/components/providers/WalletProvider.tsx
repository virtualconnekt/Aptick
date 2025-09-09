'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';

// Simple wallet provider setup - will work with browser extension wallets
const wallets: any[] = [];

interface AptosWalletProviderProps {
  children: ReactNode;
}

export function AptosWalletProvider({ children }: AptosWalletProviderProps) {
  return (
    <AptosWalletAdapterProvider 
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: Network.DEVNET,
        mizuwallet: {
          manifestURL: "https://assets.mz.xyz/static/config/mizuwallet-manifest.json",
        },
      }}
      onError={(error: any) => {
        console.log("Wallet error:", error);
        console.error('Wallet error type:', typeof error);
        console.error('Wallet error message:', error instanceof Error ? error.message : String(error));
        console.error('Full wallet error object:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}