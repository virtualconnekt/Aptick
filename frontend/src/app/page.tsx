'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { ProviderRegistration } from '@/components/ProviderRegistration';
import { DepositForm } from '@/components/DepositForm';
import { BalanceViewer } from '@/components/BalanceViewer';
import { UsageRecorder } from '@/components/UsageRecorder';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aptick</h1>
                <p className="text-sm text-gray-600">Blockchain Billing System</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Aptick</h2>
          <p className="text-lg text-gray-600 max-w-3xl mb-6">
            A decentralized billing and payment system built on Aptos blockchain. 
            Register as a service provider, deposit funds into escrow, and manage 
            usage-based billing with transparent on-chain transactions.
          </p>
          
          {/* Provider Registration CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to become a service provider?</h3>
                <p className="text-blue-100">
                  Create your billing service and start accepting payments on-chain
                </p>
              </div>
              <Link 
                href="/provider/register"
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Register Now
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Provider Registration */}
          <ProviderRegistration />
          
          {/* Deposit Form */}
          <DepositForm />
          
          {/* Balance Viewer */}
          <BalanceViewer />
          
          {/* Usage Recorder */}
          <UsageRecorder />
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How Aptick Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Register Provider</h4>
              <p className="text-sm text-gray-600">
                Service providers register their billing service with custom pricing per unit.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Deposit Funds</h4>
              <p className="text-sm text-gray-600">
                Users prepay APT tokens into secure escrow accounts for specific services.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Usage</h4>
              <p className="text-sm text-gray-600">
                Providers record usage and payments are automatically deducted from escrow.
              </p>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Contract Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Network:</span> Aptos Devnet</p>
            <p><span className="font-medium">Contract:</span> <code className="bg-white px-2 py-1 rounded text-xs">0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1</code></p>
            <p><span className="font-medium">Module:</span> billing</p>
          </div>
        </div>
      </main>
    </div>
  );
}
