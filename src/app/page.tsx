'use client';

import Image from 'next/image';
import { Header } from "@/components/Header";
import { NearLoginButton } from "@/components/NearLoginButton";
import { useNearWallet } from "@/hooks/useNearWallet";
import { OpportunityCard } from "@/components/OpportunityCard";
import { GlobalStats } from "@/components/GlobalStats";
import { UserVaultSection } from "@/components/UserVaultSection";
import { TransactionHistory } from "@/components/TransactionHistory";

export default function Home() {
  const { account, isConnected, disconnect } = useNearWallet();

  const handleLoginSuccess = (accountId: string) => {
    console.log('Login successful for account:', accountId);
  };

  const handleLogout = async () => {
    await disconnect();
  };

  // Mock data for opportunities (will be fetched from Registry contract)
  const opportunities = [
    {
      id: 1,
      name: "Stake wNEAR",
      description: "Stake wrapped NEAR tokens to earn staking rewards",
      apy: 12.5,
      trustScore: 85,
      performance: 35,
      reliability: 38,
      safety: 12,
      totalScore: 85,
      riskLevel: "Preferred ⭐"
    },
    {
      id: 2,
      name: "USDC Lending",
      description: "Lend USDC to earn interest through DeFi protocols",
      apy: 8.2,
      trustScore: 72,
      performance: 28,
      reliability: 32,
      safety: 12,
      totalScore: 72,
      riskLevel: "Moderate ✅"
    },
    {
      id: 3,
      name: "NEAR Liquid Staking",
      description: "Liquid staking derivative for NEAR tokens",
      apy: 15.8,
      trustScore: 45,
      performance: 25,
      reliability: 15,
      safety: 5,
      totalScore: 45,
      riskLevel: "Caution 🚨"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-7xl" style={{ background: 'linear-gradient(180deg, #fff 0, rgba(248, 250, 252, 0.5))' }}>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
          <div className={`flex items-center justify-center overflow-hidden `}>
              <Image 
                src="/logo/bod.png" 
                alt="Bond Credit Logo" 
                quality={100}
                width={100}
                height={100}
                className="w-[300px] h-full items-center object-contain p-2  "
                priority
              />
            </div>
           
          </div>
          <p className="text-2xl mb-3 font-semibold tracking-tight" style={{ color: '#0f172a' }}>
            Credit layer for the agentic economy
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#475569' }}>
            Discover high-yield opportunities with our v0 scoring system. Earn rewards through trusted protocols.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            {!isConnected ? (
              <NearLoginButton 
                onLoginSuccess={handleLoginSuccess}
                className="px-10 py-4 text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#2c5bff' }}
              />
            ) : (
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-3 px-6 py-3.5 bg-[#D1FAE5] dark:bg-green-900/30 rounded-xl border border-[#10B981]/20">
                  <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse-subtle"></div>
                  <span className="text-[#065F46] dark:text-green-300 font-semibold">
                    Connected: {account?.accountId}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-3 text-[#475569] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-slate-100 font-medium transition-colors rounded-lg hover:bg-white/50"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Stats */}
        <GlobalStats />

        {/* Opportunities Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: '#0f172a' }}>
              Investment Opportunities
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#475569' }}>
              Browse available opportunities with our v0 scoring system based on Performance, Reliability, and Safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard 
                key={opportunity.id} 
                opportunity={opportunity} 
                isConnected={isConnected}
              />
            ))}
          </div>
        </div>

        {/* User-specific sections when logged in */}
        {isConnected && account && (
          <>
            <UserVaultSection account={account?.accountId || ''} />
            <TransactionHistory accountId={account?.accountId || ''} network="testnet" />
          </>
        )}

        {/* Call to Action for non-logged users */}
        {!isConnected && (
          <div className="text-center py-16 px-8 bg-white dark:bg-slate-800/50 rounded-2xl border border-[#e2e8f0] dark:border-slate-700/50 shadow-md">
            <h3 className="text-3xl font-bold mb-4 tracking-tight" style={{ color: '#0f172a' }}>
              Ready to Start Earning?
            </h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: '#475569' }}>
              Connect your NEAR wallet to deposit funds, allocate to strategies, and start earning yield on your assets.
            </p>
            <NearLoginButton 
              onLoginSuccess={handleLoginSuccess}
              className="px-10 py-4 text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#2c5bff' }}
            />
          </div>
        )}
      </main>
    </div>
  );
}