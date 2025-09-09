'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { Activity } from 'lucide-react';

export function UsageRecorder() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [billingId, setBillingId] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [units, setUnits] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !signAndSubmitTransaction) {
      setMessage('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await AptickService.recordUsage(
        signAndSubmitTransaction,
        account.address.toString(),
        parseInt(billingId),
        userAddress,
        parseInt(units)
      );

      if (result.success) {
        setMessage(`Successfully recorded ${units} units of usage! Transaction: ${result.hash}`);
        setBillingId('');
        setUserAddress('');
        setUnits('');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="text-orange-600" size={24} />
        Record Usage (Providers Only)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing ID
          </label>
          <input
            type="number"
            value={billingId}
            onChange={(e) => setBillingId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Address
          </label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Units Used
          </label>
          <input
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !account || !signAndSubmitTransaction}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Recording...' : 'Record Usage'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('Successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}