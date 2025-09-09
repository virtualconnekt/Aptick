'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const wallet = useWallet();
  const { 
    connected, 
    account, 
    connect, 
    disconnect,
    wallets
  } = wallet;

  // Debug wallet state
  console.log('Wallet state:', {
    connected,
    account: account ? {
      address: account.address.toString(),
      publicKey: account.publicKey
    } : null,
    availableWallets: wallets.map(w => w.name),
    walletMethods: Object.keys(wallet)
  });

  const handleConnect = async () => {
    try {
      // Try to connect with the first available wallet
      if (wallets.length > 0) {
        await connect(wallets[0].name);
      } else {
        // Fallback - try to connect with a generic method
        await connect('Petra'); // This will work if Petra is installed
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  if (connected && account) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Connected to Devnet</p>
          <p className="text-xs text-gray-500 font-mono">
            {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Wallet size={20} />
      Connect Wallet
    </button>
  );
}