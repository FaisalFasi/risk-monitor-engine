'use client';

import React from 'react';
import Image from 'next/image';
import { SwapInterface } from '@/components/SwapInterface';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Header } from '@/components/Header';
import { useNearWallet } from '@/hooks/useNearWallet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Zap, Shield, Link2, Search, Circle, RefreshCw, DollarSign, Coins, Gem, Bitcoin } from 'lucide-react';
import { NEAR_TOKENS } from '@/types/tokens';
import Link from 'next/link';

export default function SwapPage() {
  const { account, isConnected } = useNearWallet();

  // Debug logging
  console.log('SwapPage - isConnected:', isConnected);
  console.log('SwapPage - account:', account);
  console.log('SwapPage - account.accountId:', account?.accountId);

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
          
          {/* Navigation Tabs */}
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/near-intents/swap"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white shadow-lg"
            >
              Swap
            </Link>
            <Link
              href="/near-intents/vault"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Vault
            </Link>
            <Link
              href="/near-intents/transfer"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Transfer
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative">
          {/* Main Swap Interface */}
          <div className="lg:col-span-5 xl:col-span-4 relative z-10">
            <SwapInterface />
          </div>

          {/* Transaction History & Info */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Complete Blockchain History */}
            {isConnected && account && account.accountId && (
              <Card className="border-2 border-blue-100 dark:border-blue-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        Transaction History
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        All types: swaps, transfers, vault operations, smart contract calls
                      </CardDescription>
                    </div>
                    <a
                      href={`https://testnet.nearblocks.io/address/${account.accountId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Open in Explorer →
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <TransactionHistory 
                    accountId={account.accountId}
                    network="testnet"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Show message if wallet connected but no accountId */}
            {isConnected && account && !account.accountId && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-slate-600 dark:text-slate-400">
                    <p className="font-medium mb-2">⏳ Loading account information...</p>
                    <p className="text-sm">Please wait a moment while we fetch your account details.</p>
                  </div>
                </CardContent>
              </Card>
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

// Token Item Component
function TokenItem({ token }: { token: any }) {
  const [imageError, setImageError] = React.useState(false);

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

