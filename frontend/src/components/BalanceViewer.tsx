'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { Eye, RefreshCw } from 'lucide-react';

export function BalanceViewer() {
  const { account } = useWallet();
  const [billingId, setBillingId] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [usageUnits, setUsageUnits] = useState<number | null>(null);
  const [aptBalance, setAptBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBalance = async () => {
    if (!account || !billingId) return;

    setLoading(true);
    setMessage('');

    try {
      const escrowBalance = await AptickService.getUserBalance(
        parseInt(billingId),
        account.address.toString()
      );
      const units = await AptickService.getUserUsageUnits(
        parseInt(billingId),
        account.address.toString()
      );
      const apt = await AptickService.getAptBalance(account.address.toString());

      setBalance(escrowBalance);
      setUsageUnits(units);
      setAptBalance(apt);
    } catch (error) {
      setMessage(`Error fetching balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      AptickService.getAptBalance(account.address.toString()).then(setAptBalance);
    }
  }, [account]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Eye className="text-purple-600" size={24} />
        Account Balance
      </h2>

      {account && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Wallet APT Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {aptBalance !== null ? (aptBalance / 100000000).toFixed(8) : '...'} APT
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing ID
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={billingId}
              onChange={(e) => setBillingId(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="1"
            />
            <button
              onClick={fetchBalance}
              disabled={loading || !account || !billingId}
              className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {balance !== null && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-600">Escrow Balance</p>
              <p className="text-lg font-semibold text-blue-900">
                {(balance / 100000000).toFixed(8)} APT ({balance} Octas)
              </p>
            </div>

            {usageUnits !== null && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-600">Usage Units</p>
                <p className="text-lg font-semibold text-green-900">{usageUnits}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-md bg-red-100 text-red-700">
          {message}
        </div>
      )}
    </div>
  );
}