'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useNearWallet } from '@/hooks/useNearWallet';
import { TokenSelector } from '@/components/TokenSelector';
import { Token, NEAR_TOKENS, SwapTransaction, getExplorerUrl } from '@/types/tokens';
import { NearSwapService } from '@/services/near-swap';
import { priceService } from '@/services/price-service';

interface SwapResult {
  success: boolean;
  transaction?: SwapTransaction;
  error?: string;
}

export function SwapInterface() {
  const { account, isConnected, connect, disconnect, executeTransaction } = useNearWallet();
  
  // Swap state
  const [fromToken, setFromToken] = useState<Token>(NEAR_TOKENS.NEAR);
  const [toToken, setToToken] = useState<Token>(NEAR_TOKENS.USDC);
  const [amount, setAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  const [exchangeRate, setExchangeRate] = useState('0.00');
  const [priceImpact, setPriceImpact] = useState(0);
  const [slippage, setSlippage] = useState(0.5);
  
  // UI state
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pricesLastUpdated, setPricesLastUpdated] = useState<number>(0);

  const swapService = new NearSwapService('testnet');

  // Get quote when inputs change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && isConnected) {
      const debounce = setTimeout(() => {
        getSwapQuote();
      }, 500); // Debounce to avoid too many API calls
      
      return () => clearTimeout(debounce);
    } else {
      setEstimatedOutput('0.00');
      setExchangeRate('0.00');
    }
  }, [amount, fromToken, toToken, isConnected]);

  const getSwapQuote = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;

    try {
      setIsLoadingQuote(true);
      setError(null);
      
      const estimate = await swapService.getSwapEstimate({
        fromToken,
        toToken,
        amountIn: amount,
        accountId: account.accountId,
        slippage,
      });

      setEstimatedOutput(estimate.quote.amountOut);
      setExchangeRate(estimate.exchangeRate);
      setPriceImpact(estimate.priceImpact);
      setPricesLastUpdated(Date.now());
      
    } catch (err) {
      console.error('Error getting quote:', err);
      setError('Failed to get quote. Please try again.');
      setEstimatedOutput('0.00');
      setExchangeRate('0.00');
    } finally {
      setIsLoadingQuote(false);
    }
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

    setIsSwapping(true);
    setError(null);
    setSwapResult(null);
    
    try {
      const transactionData = await swapService.prepareSwapTransaction({
        fromToken,
        toToken,
        amountIn: amount,
        accountId: account.accountId,
        slippage,
      });

      const result = await executeTransaction(transactionData);
      const txHash = result?.transaction?.hash || result?.transaction_outcome?.id || 'unknown';
      
      const swapTransaction: SwapTransaction = {
        hash: txHash,
        from: account.accountId,
        to: transactionData.receiverId,
        fromToken,
        toToken,
        amountIn: amount,
        amountOut: estimatedOutput,
        status: 'success',
        timestamp: Date.now(),
        explorerUrl: getExplorerUrl(txHash, 'testnet'),
        gasUsed: result?.transaction_outcome?.outcome?.gas_burnt?.toString(),
      };

      setSwapResult({
        success: true,
        transaction: swapTransaction,
      });

      // Clear form
      setAmount('');
      setEstimatedOutput('0.00');
      
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.type === 'UserRejected') {
        setError('Transaction cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to execute swap');
      }
      setSwapResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxAmount = () => {
    if (account && fromToken.symbol === 'NEAR') {
      const balance = parseFloat(account.balance) - 0.1;
      setAmount(Math.max(0, balance).toFixed(4));
    }
  };

  const handleSwapDirection = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount('');
    setEstimatedOutput('0.00');
  };

  const handleRefreshPrices = async () => {
    setIsLoadingQuote(true);
    await priceService.refreshPrices();
    if (amount && parseFloat(amount) > 0) {
      await getSwapQuote();
    }
    setIsLoadingQuote(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main Swap Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Swap Tokens
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshPrices}
                disabled={isLoadingQuote}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh prices"
              >
                <svg className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isLoadingQuote ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Slippage Tolerance</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{slippage}%</span>
              </div>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slippage === value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Interface */}
        <div className="p-4 md:p-6">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="text-5xl md:text-6xl mb-4">🔗</div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                Connect your NEAR wallet to start swapping tokens with real-time market rates
              </p>
              <Button onClick={connect} size="lg" className="px-8">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* From Token */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      From
                    </span>
                    <div className="flex items-center space-x-2">
                      {fromToken.symbol === 'NEAR' && account && (
                        <>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Balance: {account.balance}
                          </span>
                          <button
                            onClick={handleMaxAmount}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            MAX
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setAmount(value);
                        }
                      }}
                      placeholder="0.0"
                      className="flex-1 text-3xl md:text-4xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    />
                    <TokenSelector
                      selectedToken={fromToken}
                      onSelectToken={setFromToken}
                      excludeTokens={[toToken.id]}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-4 relative z-10">
                <button
                  onClick={handleSwapDirection}
                  className="p-2 bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg hover:scale-110"
                >
                  <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To Token */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      To (Estimated)
                    </span>
                    {exchangeRate !== '0.00' && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                        {isLoadingQuote ? (
                          <span className="text-slate-400 text-2xl">Calculating...</span>
                        ) : estimatedOutput && estimatedOutput !== '0.00' && estimatedOutput !== '0' ? (
                          <span>~{estimatedOutput}</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0.0</span>
                        )}
                      </div>
                    </div>
                    <TokenSelector
                      selectedToken={toToken}
                      onSelectToken={setToToken}
                      excludeTokens={[fromToken.id]}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Swap Details */}
              {amount && parseFloat(amount) > 0 && !isLoadingQuote && estimatedOutput !== '0.00' && estimatedOutput !== '0' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Expected Output</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ~{estimatedOutput} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Price Impact</span>
                    <span className={`font-medium ${
                      priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 
                      priceImpact > 2 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Network Fee</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      ~0.001 NEAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Slippage Tolerance</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {slippage}%
                    </span>
                  </div>
                  {pricesLastUpdated > 0 && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Prices updated {Math.floor((Date.now() - pricesLastUpdated) / 1000)}s ago</span>
                      <span className="text-green-600 dark:text-green-400">● Live</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={isSwapping || !amount || parseFloat(amount) <= 0 || isLoadingQuote || !estimatedOutput || estimatedOutput === '0.00'}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                {isSwapping ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Swapping...</span>
                  </span>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !amount || parseFloat(amount) <= 0 ? (
                  'Enter Amount'
                ) : (
                  `Swap ${fromToken.symbol} for ${toToken.symbol}`
                )}
              </Button>

              {/* Swap Result */}
              {swapResult && (
                <div className={`p-4 rounded-xl border-2 ${
                  swapResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">
                      {swapResult.success ? '✅' : '❌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {swapResult.success ? 'Swap Successful!' : 'Swap Failed'}
                      </h4>
                      {swapResult.success && swapResult.transaction ? (
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-700 dark:text-slate-300">
                            {swapResult.transaction.amountIn} {swapResult.transaction.fromToken.symbol} → {swapResult.transaction.amountOut} {swapResult.transaction.toToken.symbol}
                          </p>
                          <a
                            href={swapResult.transaction.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            <span>View on Explorer</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 dark:text-red-400">{swapResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2 text-xs text-blue-700 dark:text-blue-300">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Live Prices:</strong> Exchange rates are fetched from <strong>CoinGecko API</strong> in real-time and update every minute. 
            Prices reflect actual market values. Click the refresh icon to update manually.
          </div>
        </div>
      </div>
    </div>
  );
}

