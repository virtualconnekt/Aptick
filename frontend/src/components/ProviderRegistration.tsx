'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ProviderRegistration() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('');
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
      const result = await AptickService.registerProvider(
        signAndSubmitTransaction,
        account.address.toString(),
        parseInt(pricePerUnit),
        unit
      );

      if (result.success) {
        setMessage(`Successfully registered as provider! Transaction: ${result.hash}`);
        setPricePerUnit('');
        setUnit('');
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
        <Plus className="text-blue-600" size={24} />
        Register as Service Provider
      </h2>
      
      {/* Dedicated Page CTA */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Enhanced Registration Experience</h3>
            <p className="text-sm text-blue-700">
              Use our dedicated registration page with APT/Octas converter and detailed guidance
            </p>
          </div>
          <Link 
            href="/provider/register"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Go to Page
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Unit (in Octas)
          </label>
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="100"
            required
          />
          <p className="text-xs text-gray-500 mt-1">1 APT = 100,000,000 Octas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Unit
          </label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="GB, API calls, minutes, etc."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !account || !signAndSubmitTransaction}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registering...' : 'Register Provider'}
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