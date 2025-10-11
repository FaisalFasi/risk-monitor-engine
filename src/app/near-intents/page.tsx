'use client';

import React from 'react';
import { SwapInterface } from '@/components/SwapInterface';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Header } from '@/components/Header';
import { useNearWallet } from '@/hooks/useNearWallet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function NearIntentsPage() {
  const { account, isConnected } = useNearWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
            NEAR Token Swap
          </h1>
          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
            Swap tokens on NEAR Protocol with <strong>live market rates</strong> powered by CoinGecko
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Swap Interface - Takes center stage */}
          <div className="lg:col-span-5 xl:col-span-4">
            <SwapInterface />
          </div>

          {/* Transaction History & Info - Side panel */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Transaction History */}
            {isConnected && account && (
              <TransactionHistory 
                accountId={account.accountId}
                network="testnet"
              />
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Real-Time Rates
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Live market prices from CoinGecko API, updated every minute
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">🔐</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Secure Signing
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your wallet signs all transactions - keys never leave your device
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">⛓️</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    On-Chain Execution
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All transactions execute on NEAR blockchain and are publicly verifiable
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Transparent
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    View all transactions on NearBlocks explorer with full details
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Supported Tokens */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Tokens</CardTitle>
                <CardDescription>Trade between these tokens with live market rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.values(NEAR_TOKENS).map((token: any) => (
                    <div 
                      key={token.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{token.icon}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Import NEAR_TOKENS for the supported tokens section
import { NEAR_TOKENS } from '@/types/tokens';