'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { CreditCard } from 'lucide-react';

export function DepositForm() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [billingId, setBillingId] = useState('');
  const [amount, setAmount] = useState('');
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
      const result = await AptickService.deposit(
        signAndSubmitTransaction,
        account.address.toString(),
        parseInt(billingId),
        parseInt(amount)
      );

      if (result.success) {
        setMessage(`Successfully deposited ${amount} Octas! Transaction: ${result.hash}`);
        setBillingId('');
        setAmount('');
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
        <CreditCard className="text-green-600" size={24} />
        Deposit to Escrow
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
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (in Octas)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="1000000"
            required
          />
          <p className="text-xs text-gray-500 mt-1">1 APT = 100,000,000 Octas</p>
        </div>

        <button
          type="submit"
          disabled={loading || !account || !signAndSubmitTransaction}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Depositing...' : 'Deposit Funds'}
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