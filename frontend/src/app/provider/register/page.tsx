'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptickService } from '@/lib/aptick-service';
import { WalletConnect } from '@/components/WalletConnect';
import { ArrowLeft, Plus, Calculator, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterProviderPage() {
  const wallet = useWallet();
  const { account, signAndSubmitTransaction, connected } = wallet;
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('');
  const [priceInApt, setPriceInApt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBillingId, setLoadingBillingId] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    billingId?: number;
    transactionHash?: string;
  } | null>(null);

  // Debug: Log wallet methods
  console.log('🔍 Wallet object inspection:');
  console.log('Wallet keys:', Object.keys(wallet));
  console.log('connected state:', connected);
  console.log('signAndSubmitTransaction available:', !!signAndSubmitTransaction);
  console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction);
  console.log('account available:', !!account);
  
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
    console.log('Connected state:', connected);
    console.log('Account object:', account);
    console.log('Account address:', account?.address?.toString());
    console.log('signAndSubmitTransaction function:', signAndSubmitTransaction);
    console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction);
    
    // Enhanced wallet connection validation
    if (!connected) {
      console.log('❌ Wallet not connected (connected=false)');
      setResult({
        success: false,
        message: 'Wallet is not connected. Please connect your wallet and try again.'
      });
      return;
    }
    
    if (!account) {
      console.log('❌ No account available');
      setResult({
        success: false,
        message: 'No account found. Please ensure your wallet is properly connected.'
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
        unit,
        connected // Pass the connected state for validation
      );

      console.log('📊 Registration response:', response);

      if (response.success) {
        console.log('✅ Registration successful!');
        
        // Try to get the billing ID from the transaction
        try {
          console.log('🔍 Fetching billing ID from transaction...');
          const assignedBillingId = await AptickService.getBillingIdFromTransaction(response.hash);
          
          if (assignedBillingId !== null && assignedBillingId > 0) {
            setResult({
              success: true,
              message: 'Provider registered successfully!',
              billingId: assignedBillingId,
              transactionHash: response.hash
            });
          } else {
            console.warn('⚠️ Could not retrieve billing ID, but registration was successful');
            setResult({
              success: true,
              message: 'Provider registered successfully! Billing ID will be available shortly.',
              transactionHash: response.hash
            });
          }
        } catch (billingIdError) {
          console.error('🚨 Error fetching billing ID:', billingIdError);
          console.error('Billing ID error details:', {
            errorMessage: billingIdError instanceof Error ? billingIdError.message : String(billingIdError),
            errorStack: billingIdError instanceof Error ? billingIdError.stack : undefined
          });
          setResult({
            success: true,
            message: 'Provider registered successfully! Billing ID will be available shortly.',
            transactionHash: response.hash
          });
        }
        
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

  const handleGetBillingId = async () => {
    if (!result?.success || !result?.transactionHash) return;
    
    setLoadingBillingId(true);
    try {
      console.log('🔄 Manually fetching billing ID...');
      let billingId = await AptickService.getBillingIdFromTransaction(result.transactionHash);
      
      if (!billingId) {
        console.log('🔄 Trying alternative method...');
        billingId = await AptickService.getLatestBillingId();
      }
      
      if (billingId && billingId > 0) {
        setResult(prev => prev ? { ...prev, billingId } : null);
      } else {
        alert('Could not retrieve billing ID. Please check the transaction on Aptos Explorer.');
      }
    } catch (error) {
      console.error('🚨 Error manually fetching billing ID:', error);
      alert('Error fetching billing ID. Please try again later.');
    } finally {
      setLoadingBillingId(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051419]">
      {/* Header */}
      <header className="bg-[#051419] border-b border-[#bfcfc8]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-3 text-[#bfcfc8] hover:text-[#95dcc3] transition-colors group"
              >
                <div className="p-2 bg-[#bfcfc8]/10 group-hover:bg-[#007BFF]/20 transition-colors">
                  <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 rounded-2xl p-10">
          {/* Title and Description */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] p-4 rounded-2xl shadow-lg">
                <Plus className="text-[#FFFFFF]" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-tight">
                Register as a<br />Service Provider
              </h1>
            </div>
            <p className="text-lg text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text max-w-xl mx-auto leading-relaxed">
              Set your price per unit and unit type (e.g., GB, API_CALL). 
              A billing ID will be generated on-chain for you to use in your dApp.
            </p>
          </div>

          {/* Wallet Connection Status */}
          {!connected && (
            <div className="mb-8 p-6 bg-gradient-to-r from-[#007BFF]/5 to-[#2CEAA3]/5 border border-[#007BFF]/20 rounded-xl">
              <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text text-center font-medium">
                Please connect your wallet to register as a service provider
              </p>
            </div>
          )}
          
          {connected && !account && (
            <div className="mb-8 p-6 bg-gradient-to-r from-[#2CEAA3]/10 to-[#007BFF]/10 border border-[#2CEAA3]/30 rounded-xl">
              <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text text-center font-medium">
                Wallet connected but no account found. Please refresh and try again.
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Price Per Unit */}
            <div className="space-y-6">
              <label className="block text-lg font-semibold text-[#bba500]">
                Price per Unit
              </label>
              
              {/* APT Input */}
              <div>
                <label className="block text-sm font-medium text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-3">
                  Price in APT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.00000001"
                    value={priceInApt}
                    onChange={handleAptChange}
                    className="w-full p-4 border-2 border-[#bfcfc8]/30 bg-[#FFFFFF]/10 backdrop-blur-sm focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition-colors text-[#FFFFFF] text-lg"
                    placeholder="0.00000100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-[#bfcfc8] text-lg font-semibold">APT</span>
                  </div>
                </div>
              </div>

              {/* Octas Input */}
              <div>
                <label className="block text-sm font-medium text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-3">
                  Price in Octas
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={handleOctasChange}
                    className="w-full p-4 border-2 border-[#bfcfc8]/30 bg-[#FFFFFF]/10 backdrop-blur-sm focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition-colors text-[#FFFFFF] text-lg"
                    placeholder="100"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-[#bfcfc8] text-lg font-semibold">Octas</span>
                  </div>
                </div>
              </div>

              {/* Conversion Helper */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#007BFF]/5 to-[#2CEAA3]/5 rounded-xl border border-[#007BFF]/20">
                <div className="p-2 bg-[#007BFF]/10 rounded-lg">
                  <Calculator size={20} className="text-[#007BFF]" />
                </div>
                <span className="text-sm text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text font-medium">
                  1 APT = 100,000,000 Octas
                </span>
              </div>
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-lg font-semibold text-[#bba500] mb-3">
                Unit Type
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-4 border-2 border-[#bfcfc8]/30 bg-[#FFFFFF]/10 backdrop-blur-sm focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition-colors text-[#FFFFFF] text-lg"
                placeholder="e.g., GB, API_CALL, MB, minutes"
                required
              />
              <p className="text-sm text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mt-2">
                Examples: GB, API_CALL, MB, minutes, requests, etc.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !connected || !account || !signAndSubmitTransaction}
              className="w-full bg-gradient-to-r from-[#FFFFFF] to-[#30aff8] hover:from-[#FFFFFF]/90 hover:to-[#30aff8]/90 text-[#524800] py-5 px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Registering Service...
                </>
              ) : (
                <>
                  <Plus size={24} />
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
                    {result.billingId && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-blue-900 mb-1">
                              🎉 Your Billing ID: <span className="font-mono text-xl">{result.billingId}</span>
                            </p>
                            <p className="text-sm text-blue-700">
                              Use this ID to integrate billing into your dApp. Save it for your records!
                            </p>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(result.billingId!.toString())}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                            title="Copy Billing ID"
                          >
                            Copy ID
                          </button>
                        </div>
                      </div>
                    )}
                    
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
                    
                    {!result.billingId && (
                      <div className="text-sm mt-4 p-3 bg-yellow-50 rounded border-yellow-200 border">
                        <p className="mb-2">
                          <strong>Billing ID not retrieved automatically.</strong> You can try to get it manually:
                        </p>
                        <button
                          onClick={handleGetBillingId}
                          disabled={loadingBillingId}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {loadingBillingId ? 'Getting ID...' : 'Get My Billing ID'}
                        </button>
                        <p className="text-xs mt-2 text-gray-600">
                          Or check your transaction on Aptos Explorer to see the billing ID in the events.
                        </p>
                      </div>
                    )}
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