'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { WalletConnect } from '@/components/WalletConnect';
import { ArrowLeft, Plus, Calculator, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterProviderPage() {
  const wallet = useWallet();
  const { account, signAndSubmitTransaction } = wallet;
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('');
  const [priceInApt, setPriceInApt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    billingId?: number;
    transactionHash?: string;
  } | null>(null);

  // Debug: Log wallet methods
  console.log('🔍 Wallet object inspection:');
  console.log('Wallet keys:', Object.keys(wallet));
  console.log('signAndSubmitTransaction available:', !!signAndSubmitTransaction);
  console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction);
  
  // Check for alternative transaction methods
  const altMethods = ['submitTransaction', 'signTransaction', 'sendTransaction'];
  altMethods.forEach(method => {
    console.log(`${method} available:`, !!(wallet as any)[method]);
  });

  // Helper function to convert APT to Octas
  const aptToOctas = (apt: number): number => {
    return Math.floor(apt * 100000000);
  };

  // Helper function to convert Octas to APT
  const octasToApt = (octas: number): number => {
    return octas / 100000000;
  };

  // Handle APT input change
  const handleAptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const aptValue = e.target.value;
    setPriceInApt(aptValue);
    if (aptValue && !isNaN(Number(aptValue))) {
      setPricePerUnit(aptToOctas(Number(aptValue)).toString());
    } else {
      setPricePerUnit('');
    }
  };

  // Handle Octas input change
  const handleOctasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const octasValue = e.target.value;
    setPricePerUnit(octasValue);
    if (octasValue && !isNaN(Number(octasValue))) {
      setPriceInApt(octasToApt(Number(octasValue)).toFixed(8));
    } else {
      setPriceInApt('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Form Submission Debug ===');
    console.log('Account object:', account);
    console.log('Account address:', account?.address?.toString());
    console.log('signAndSubmitTransaction function:', signAndSubmitTransaction);
    console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction);
    
    if (!account) {
      console.log('❌ No account connected');
      setResult({
        success: false,
        message: 'Please connect your wallet first'
      });
      return;
    }
    
    if (!signAndSubmitTransaction) {
      console.log('❌ No signAndSubmitTransaction method available');
      setResult({
        success: false,
        message: 'Wallet does not support transaction signing. Please try reconnecting your wallet.'
      });
      return;
    }

    if (!pricePerUnit || !unit) {
      console.log('❌ Missing form data');
      setResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('=== Starting Provider Registration ===');
      
      // First, check if the contract is deployed and initialized
      console.log('🔍 Checking contract deployment...');
      const isContractDeployed = await AptickService.checkContractDeployment();
      console.log('Contract deployed:', isContractDeployed);
      
      if (!isContractDeployed) {
        console.log('🔧 Contract not initialized, attempting to initialize...');
        
        const initResult = await AptickService.initialize(
          signAndSubmitTransaction,
          account.address.toString()
        );
        
        if (!initResult.success) {
          setResult({
            success: false,
            message: `Failed to initialize contract: ${initResult.error}`
          });
          return;
        }
        
        console.log('✅ Contract initialized successfully');
      }
      
      console.log('✅ Contract is deployed, proceeding with registration...');
      
      // Test wallet connection by trying to get account info
      try {
        console.log('🔍 Testing wallet connection...');
        const accountAddress = account.address.toString();
        console.log('✅ Wallet address accessible:', accountAddress);
      } catch (walletError) {
        console.error('❌ Wallet access error:', walletError);
        setResult({
          success: false,
          message: 'Unable to access wallet information. Please reconnect your wallet.'
        });
        return;
      }
      
      console.log('🚀 Calling AptickService.registerProvider...');
      const response = await AptickService.registerProvider(
        signAndSubmitTransaction,
        account.address.toString(),
        parseInt(pricePerUnit),
        unit
      );

      console.log('📊 Registration response:', response);

      if (response.success) {
        console.log('✅ Registration successful!');
        setResult({
          success: true,
          message: 'Provider registered successfully!',
          transactionHash: response.hash
        });
        
        // Reset form
        setPricePerUnit('');
        setPriceInApt('');
        setUnit('');
      } else {
        console.log('❌ Registration failed:', response.error);
        setResult({
          success: false,
          message: response.error || 'Registration failed'
        });
      }
    } catch (error) {
      console.error('💥 Form submission error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      setResult({
        success: false,
        message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Title and Description */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Plus className="text-blue-600" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Register as a Service Provider
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Set your price per unit and unit type (e.g., GB, API_CALL). 
              A billing ID will be generated on-chain for you to use in your dApp.
            </p>
          </div>

          {/* Wallet Connection Status */}
          {!account && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                Please connect your wallet to register as a service provider
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Price Per Unit */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Price per Unit
              </label>
              
              {/* APT Input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Price in APT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.00000001"
                    value={priceInApt}
                    onChange={handleAptChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00000100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">APT</span>
                  </div>
                </div>
              </div>

              {/* Octas Input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Price in Octas
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={handleOctasChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">Octas</span>
                  </div>
                </div>
              </div>

              {/* Conversion Helper */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                <Calculator size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  1 APT = 100,000,000 Octas
                </span>
              </div>
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Type
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., GB, API_CALL, MB, minutes"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: GB, API_CALL, MB, minutes, requests, etc.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !account || !signAndSubmitTransaction}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Registering Service...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Register Service
                </>
              )}
            </button>
          </form>

          {/* Result Section */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-center ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                <p className="font-medium mb-2">{result.message}</p>
                
                {result.success && result.transactionHash && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Transaction Hash:</span>
                    </p>
                    <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                      {result.transactionHash}
                    </p>
                    <p className="text-xs text-green-600">
                      View your transaction on{' '}
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${result.transactionHash}?network=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-800"
                      >
                        Aptos Explorer
                      </a>
                    </p>
                    <p className="text-sm mt-4 p-3 bg-blue-50 rounded border-blue-200 border">
                      <strong>Next Steps:</strong> Your billing ID will be available once the transaction is confirmed. 
                      You can use this ID to integrate billing into your dApp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}