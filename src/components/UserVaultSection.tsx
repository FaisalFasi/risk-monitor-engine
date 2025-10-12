'use client';

import { useState } from 'react';

interface UserVaultSectionProps {
  account: string;
}

export function UserVaultSection({ account }: UserVaultSectionProps) {
  const [isClaimingYield, setIsClaimingYield] = useState(false);
  
  // Mock data - will be fetched from Vault contract
  const vaultData = {
    totalDeposits: 1250.50,
    totalYield: 45.20,
    vaultShares: 1250.50,
    strategies: [
      { name: "Stake wNEAR", amount: 800.00, apy: 12.5, yield: 28.50 },
      { name: "USDC Lending", amount: 450.50, apy: 8.2, yield: 16.70 }
    ]
  };

  const handleClaimYield = async () => {
    setIsClaimingYield(true);
    try {
      // Simulate yield claim transaction
      console.log('Claiming yield for account:', account);
      
      // In a real implementation, this would call the vault contract
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Yield claimed successfully!');
      // You could add a success notification here
    } catch (error) {
      console.error('Failed to claim yield:', error);
      // You could add an error notification here
    } finally {
      setIsClaimingYield(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#0f172a' }}>
          My Vault
        </h2>
        <p className="text-lg" style={{ color: '#475569' }}>
          Manage your deposits and track your earnings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vault Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-[#f1f5f9] dark:border-slate-700/50">
          <h3 className="text-xl font-bold mb-6" style={{ color: '#0f172a' }}>
            Portfolio Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>
                ${vaultData.totalDeposits.toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: '#64748b' }}>
                Total Deposits
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                +${vaultData.totalYield.toFixed(2)}
              </div>
              <div className="text-sm" style={{ color: '#64748b' }}>
                Yield Earned
              </div>
            </div>
          </div>

          {/* Active Strategies */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#0f172a' }}>
              Active Strategies
            </h4>
            <div className="space-y-3">
              {vaultData.strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium" style={{ color: '#0f172a' }}>
                      {strategy.name}
                    </div>
                    <div className="text-sm" style={{ color: '#64748b' }}>
                      ${strategy.amount.toLocaleString()} • {strategy.apy}% APY
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      +${strategy.yield.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b' }}>
                      yield
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full py-4 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90" style={{ backgroundColor: '#2c5bff' }}>
            <div className="flex items-center justify-center space-x-2">
              <span>💰</span>
              <span>Deposit Funds</span>
            </div>
          </button>
          
          <button className="w-full py-4 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90" style={{ backgroundColor: '#2c5bff' }}>
            <div className="flex items-center justify-center space-x-2">
              <span>📤</span>
              <span>Withdraw Funds</span>
            </div>
          </button>

          <button 
            onClick={handleClaimYield}
            disabled={isClaimingYield}
            className={`w-full py-4 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90 ${isClaimingYield ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: '#10B981' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>{isClaimingYield ? 'Claiming...' : 'Claim Yield'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
