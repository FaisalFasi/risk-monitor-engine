'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNearWallet } from '@/hooks/useNearWallet';
import { TokenSelector } from '@/components/TokenSelector';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Token, NEAR_TOKENS, SwapTransaction } from '@/types/tokens';
import { NearSwapService } from '@/services/near-swap';

interface SwapResult {
  success: boolean;
  transaction?: SwapTransaction;
  error?: string;
}

const NearIntentsDashboardV2 = () => {
  const { account, isConnected, connect, disconnect } = useNearWallet();
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Token selection
  const [fromToken, setFromToken] = useState<Token>(NEAR_TOKENS.NEAR);
  const [toToken, setToToken] = useState<Token>(NEAR_TOKENS.USDC);
  const [amount, setAmount] = useState('1.0');
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  const [exchangeRate, setExchangeRate] = useState('0.00');
  const [priceImpact, setPriceImpact] = useState(0);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const swapService = new NearSwapService('testnet');

  // Get quote when inputs change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && account) {
      getSwapQuote();
    }
  }, [amount, fromToken, toToken]);

  const getSwapQuote = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;

    try {
      setIsLoadingQuote(true);
      const estimate = await swapService.getSwapEstimate({
        fromToken,
        toToken,
        amountIn: amount,
        accountId: account.accountId,
      });

      setEstimatedOutput(estimate.quote.amountOut);
      setExchangeRate(estimate.exchangeRate);
      setPriceImpact(estimate.priceImpact);
    } catch (err) {
      console.error('Error getting quote:', err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connect();
      console.log('Wallet connection initiated');
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to NEAR wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setSwapResult(null);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSwapResult(null);
    
    try {
      console.log(`Executing swap: ${amount} ${fromToken.symbol} → ${toToken.symbol}`);
      
      // Execute the swap
      const transaction = await swapService.executeSwap({
        fromToken,
        toToken,
        amountIn: amount,
        accountId: account.accountId,
        slippage: 0.5,
      });

      setSwapResult({
        success: true,
        transaction,
      });

      // Refresh quote
      await getSwapQuote();
      
    } catch (err) {
      console.error('Swap error:', err);
      setError('Failed to execute swap');
      setSwapResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSwapDirection = () => {
    // Swap the from and to tokens
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleMaxAmount = () => {
    if (account && fromToken.symbol === 'NEAR') {
      // Set to available balance minus some for gas
      const balance = parseFloat(account.balance) - 0.1; // Keep 0.1 NEAR for gas
      setAmount(Math.max(0, balance).toFixed(4));
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Swap Card */}
      <Card>
        <CardHeader>
          <CardTitle>Token Swap</CardTitle>
          <CardDescription>
            Swap tokens on NEAR Protocol using Ref Finance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-slate-800 dark:text-slate-300 text-center">
                Connect to your NEAR wallet to start swapping tokens
              </p>
              <Button onClick={handleConnect} disabled={isLoading} size="lg">
                {isLoading ? 'Connecting...' : 'Connect NEAR Wallet'}
              </Button>
              {error && (
                <div className="max-w-md">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Account Info */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {account.accountId}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Balance: {account.balance} NEAR
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Swap Interface */}
              <div className="space-y-2">
                {/* From Token */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      From
                    </label>
                    {fromToken.symbol === 'NEAR' && account && (
                      <button
                        onClick={handleMaxAmount}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        MAX
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={amount}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="flex-1 text-2xl font-medium bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    <TokenSelector
                      selectedToken={fromToken}
                      onSelectToken={setFromToken}
                      excludeTokens={[toToken.id]}
                    />
                  </div>
                </div>

                {/* Swap Direction Button */}
                <div className="flex justify-center -my-3 relative z-10">
                  <button
                    onClick={handleSwapDirection}
                    className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-full hover:border-blue-500 dark:hover:border-blue-400 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                {/* To Token */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 block">
                    To (estimated)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={isLoadingQuote ? '...' : estimatedOutput}
                      disabled
                      placeholder="0.0"
                      className="flex-1 text-2xl font-medium bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-70"
                    />
                    <TokenSelector
                      selectedToken={toToken}
                      onSelectToken={setToToken}
                      excludeTokens={[fromToken.id]}
                    />
                  </div>
                </div>
              </div>

              {/* Swap Details */}
              {estimatedOutput !== '0.00' && !isLoadingQuote && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Exchange Rate</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      1 {fromToken.symbol} ≈ {exchangeRate} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Price Impact</span>
                    <span className={`font-medium ${priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Fee</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      0.3%
                    </span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button 
                onClick={handleSwap} 
                disabled={isLoading || !amount || parseFloat(amount) <= 0 || isLoadingQuote}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Executing Swap...' : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
              </Button>

              {/* Swap Result */}
              {swapResult && (
                <div className={`p-4 rounded-lg ${swapResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {swapResult.success ? '✅' : '❌'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {swapResult.success ? 'Swap Successful!' : 'Swap Failed'}
                      </h4>
                      {swapResult.success && swapResult.transaction ? (
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-600 dark:text-slate-400">
                            Swapped {swapResult.transaction.amountIn} {swapResult.transaction.fromToken.symbol} for{' '}
                            {swapResult.transaction.amountOut} {swapResult.transaction.toToken.symbol}
                          </p>
                          <a
                            href={swapResult.transaction.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                          >
                            <span>View on Explorer</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {swapResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {isConnected && account && (
        <TransactionHistory 
          accountId={account.accountId}
          network="testnet"
        />
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Token Swaps on NEAR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Token swaps are executed through <strong>Ref Finance</strong>, NEAR's leading decentralized exchange (DEX).
              All transactions are executed on-chain and can be verified on NEAR Explorer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400 font-medium mb-1">✅ No Custody</div>
                <div className="text-xs">Your tokens never leave your wallet</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-green-600 dark:text-green-400 font-medium mb-1">⚡ Fast Execution</div>
                <div className="text-xs">Swaps complete in seconds</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-purple-600 dark:text-purple-400 font-medium mb-1">🔍 Transparent</div>
                <div className="text-xs">All transactions on-chain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NearIntentsDashboardV2;

