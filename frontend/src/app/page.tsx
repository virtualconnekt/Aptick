'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { Activity, ArrowRight, Shield, Zap, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#051419]">
      {/* Header */}
      <header className="bg-[#051419] border-b border-[#bfcfc8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl">
                <img src="/logo.png" alt="Aptick Logo" className="w-12 h-12 rounded-full" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text">Aptick</h1>
                <p className="text-sm text-[#bfcfc8]">Blockchain Billing System</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-6 leading-tight">
              Decentralized Billing
              <span className="block bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
            <p className="text-xl text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text max-w-3xl mx-auto mb-12 leading-relaxed">
              Aptick is a cutting-edge billing and payment system built on the Aptos blockchain. 
              Enable transparent, usage-based billing for your services with on-chain escrow and automated payments.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/provider/register"
                className="group flex items-center gap-3 bg-gradient-to-r from-[#FFFFFF] to-[#30aff8] hover:from-[#FFFFFF]/90 hover:to-[#30aff8]/90 text-[#524800] px-8 py-4 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Become a Provider</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a 
                href="#how-it-works"
                className="flex items-center gap-3 border-2 border-[#bfcfc8] hover:border-[#95dcc3] text-[#bfcfc8] hover:text-[#95dcc3] px-8 py-4 font-semibold text-lg transition-all duration-200"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Why Choose Aptick?</h3>
            <p className="text-lg text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text max-w-2xl mx-auto">
              Built for the future of decentralized services with transparency and efficiency at its core.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 rounded-2xl p-8 text-center hover:bg-[#FFFFFF]/10 transition-all duration-200">
              <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] p-4 rounded-2xl w-fit mx-auto mb-6">
                <Shield className="text-[#FFFFFF]" size={32} />
              </div>
              <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Secure Escrow</h4>
              <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                Funds are held securely in on-chain escrow accounts, ensuring trust between providers and users.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 rounded-2xl p-8 text-center hover:bg-[#FFFFFF]/10 transition-all duration-200">
              <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] p-4 rounded-2xl w-fit mx-auto mb-6">
                <Zap className="text-[#FFFFFF]" size={32} />
              </div>
              <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Usage-Based Billing</h4>
              <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                Pay only for what you use. Transparent, automated billing based on actual service consumption.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 rounded-2xl p-8 text-center hover:bg-[#FFFFFF]/10 transition-all duration-200">
              <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] p-4 rounded-2xl w-fit mx-auto mb-6">
                <Globe className="text-[#FFFFFF]" size={32} />
              </div>
              <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Blockchain Native</h4>
              <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                Built on Aptos blockchain for fast, low-cost transactions with full transparency and immutability.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-[#FFFFFF]/5 backdrop-blur-sm rounded-3xl border border-[#bfcfc8]/20 mb-20">
          <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">How Aptick Works</h3>
              <p className="text-lg text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text max-w-2xl mx-auto">
                Simple, transparent, and secure billing in three easy steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-[#FFFFFF] font-bold text-2xl">1</span>
                </div>
                <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Register Provider</h4>
                <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                  Service providers register their billing service with custom pricing per unit. 
                  Set your rates for GB, API calls, or any service metric.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-[#2CEAA3] to-[#007BFF] w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-[#FFFFFF] font-bold text-2xl">2</span>
                </div>
                <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Deposit Funds</h4>
                <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                  Users prepay APT tokens into secure escrow accounts for specific services. 
                  Funds are held safely on-chain until used.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-[#007BFF] to-[#2CEAA3] w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-[#FFFFFF] font-bold text-2xl">3</span>
                </div>
                <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-4">Track Usage</h4>
                <p className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text leading-relaxed">
                  Providers record usage and payments are automatically deducted from escrow. 
                  Complete transparency and instant settlement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-6">Built for Developers</h3>
              <p className="text-lg text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text mb-8 leading-relaxed">
                Integrate Aptick into your applications with our comprehensive SDK. 
                Support for React, Vue, Angular, and vanilla JavaScript.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#2CEAA3]" size={24} />
                  <span className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text">Easy SDK integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#2CEAA3]" size={24} />
                  <span className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text">Wallet adapter compatibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#2CEAA3]" size={24} />
                  <span className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text">Real-time balance tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#2CEAA3]" size={24} />
                  <span className="text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#30aff8] to-[#bba600] bg-clip-text">Automated billing workflows</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 rounded-2xl p-8">
              <div className="text-[#bfcfc8] font-mono text-sm space-y-4">
                <div>
                  <div className="text-[#2CEAA3] mb-2">// Install Aptick SDK</div>
                  <div className="mb-4">npm install aptick-sdk</div>
                </div>
                
                <div>
                  <div className="text-[#2CEAA3] mb-2">// Initialize client</div>
                  <div className="mb-4">
                    <div>const client = new AptickClient(&#123;</div>
                    <div>&nbsp;&nbsp;network: 'devnet'</div>
                    <div>&#125;);</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-[#2CEAA3] mb-2">// Record usage</div>
                  <div>
                    <div>await client.recordUsage(</div>
                    <div>&nbsp;&nbsp;billingId, userAddress, units</div>
                    <div>);</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contract Info Footer */}
        <section className="py-16 border-t border-[#bfcfc8]/20">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-[#bba500] mb-6">Contract Information</h4>
            <div className="bg-[#FFFFFF]/5 backdrop-blur-sm border border-[#bfcfc8]/20 p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-[#2CEAA3] font-medium block mb-1">Network:</span>
                  <span className="text-[#bfcfc8]">Aptos Devnet</span>
                </div>
                <div>
                  <span className="text-[#2CEAA3] font-medium block mb-1">Contract:</span>
                  <code className="text-[#bfcfc8] text-xs break-all">
                    0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1
                  </code>
                </div>
                <div>
                  <span className="text-[#2CEAA3] font-medium block mb-1">Module:</span>
                  <span className="text-[#bfcfc8]">billing</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
