'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SwapInterface } from '@/components/SwapInterface';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Header } from '@/components/Header';
import { useNearWallet } from '@/hooks/useNearWallet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Zap, Shield, Link2, Search, Circle, RefreshCw, DollarSign, Coins, Gem, Bitcoin } from 'lucide-react';

export default function NearIntentsPage() {
  const { account, isConnected } = useNearWallet();

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl overflow-visible">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4" style={{ color: '#0f172a' }}>
            NEAR Token Swap
          </h1>
          <p className="text-sm md:text-lg max-w-2xl mx-auto px-4" style={{ color: '#475569' }}>
            Swap tokens on NEAR Protocol with <strong>live market rates</strong> powered by CoinGecko
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative">
          {/* Main Swap Interface - Takes center stage */}
          <div className="lg:col-span-5 xl:col-span-4 relative z-10">
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
                  <Zap className="w-10 h-10 mb-3 text-yellow-500" />
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
                  <Shield className="w-10 h-10 mb-3 text-blue-500" />
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
                  <Link2 className="w-10 h-10 mb-3 text-purple-500" />
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
                  <Search className="w-10 h-10 mb-3 text-green-500" />
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
                    <TokenItem key={token.id} token={token} />
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

// Token Item Component with image fallback
function TokenItem({ token }: { token: any }) {
  const [imageError, setImageError] = useState(false);

  const getFallbackIcon = (icon: string) => {
    const iconProps = { className: "w-8 h-8", strokeWidth: 2 };
    switch(icon) {
      case 'near': return <Circle {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'wnear': return <RefreshCw {...iconProps} className="w-8 h-8 text-purple-500" />;
      case 'usdc': return <DollarSign {...iconProps} className="w-8 h-8 text-blue-600" />;
      case 'usdt': return <DollarSign {...iconProps} className="w-8 h-8 text-green-600" />;
      case 'dai': return <Coins {...iconProps} className="w-8 h-8 text-yellow-500" />;
      case 'weth': return <Gem {...iconProps} className="w-8 h-8 text-indigo-500" />;
      case 'wbtc': return <Bitcoin {...iconProps} className="w-8 h-8 text-orange-500" />;
      default: return <Coins {...iconProps} />;
    }
  };

  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center space-x-2">
        {token.iconUrl && !imageError ? (
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={token.iconUrl}
              alt={token.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={() => setImageError(true)}
              unoptimized
            />
            {token.symbol === 'wNEAR' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                <RefreshCw className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0">
            {getFallbackIcon(token.icon)}
          </div>
        )}
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
  );
}