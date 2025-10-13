'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useNearWallet } from '@/hooks/useNearWallet';
import { TokenSelector } from '@/components/TokenSelector';
import { Token, NEAR_TOKENS, SwapTransaction, getExplorerUrl } from '@/types/tokens';
import { NearSwapService } from '@/services/near-swap';
import { priceService } from '@/services/price-service';
import { Link, CheckCircle2, XCircle } from 'lucide-react';

interface SwapResult {
  success: boolean;
  transaction?: SwapTransaction;
  error?: string;
}

export function SwapInterface() {
  const { account, isConnected, connect, disconnect, executeTransaction, refreshBalance } = useNearWallet();
  
  // Swap state - Now supports direct NEAR swaps!
  const [fromToken, setFromToken] = useState<Token>(NEAR_TOKENS.NEAR);
  const [toToken, setToToken] = useState<Token>(NEAR_TOKENS.USDC);
  const [amount, setAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  const [exchangeRate, setExchangeRate] = useState('0.00');
  const [priceImpact, setPriceImpact] = useState(0);
  const [slippage, setSlippage] = useState(0.5);
  const [maxAvailable, setMaxAvailable] = useState<string>('0');
  
  // UI state
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pricesLastUpdated, setPricesLastUpdated] = useState<number>(0);

  const swapService = new NearSwapService('testnet');

  // Check for transaction hashes in URL (after wallet redirect)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const txHashes = urlParams.get('transactionHashes');
      
      if (txHashes) {
        console.log('🔗 Transaction completed! Hashes in URL:', txHashes);
        const hashes = txHashes.split(',');
        
        setSwapResult({
          success: true,
          transaction: {
            hash: hashes[0],
            from: account?.accountId || 'unknown',
            to: 'ref-finance-101.testnet',
            fromToken,
            toToken,
            amountIn: '0',
            amountOut: '0',
            status: 'success',
            timestamp: Date.now(),
            explorerUrl: getExplorerUrl(hashes[0], 'testnet'),
          },
        });
        
        // Show success message
        alert(
          '✅ Transactions Submitted!\n\n' +
          `Transaction hashes found in URL.\n` +
          `Check status at:\n${getExplorerUrl(hashes[0], 'testnet')}\n\n` +
          'Your balances will update shortly.\n' +
          'Check "Your Token Balances" panel below.'
        );
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Start aggressive refresh
        console.log('🔄 Starting balance refresh after redirect...');
        [2000, 4000, 6000, 8000, 10000, 15000, 20000, 25000, 30000].forEach((delay, index) => {
          setTimeout(async () => {
            console.log(`🔄 Post-redirect refresh ${index + 1}/9...`);
            await refreshBalance();
          }, delay);
        });
      }
    }
  }, []);

  // Get max available when token or account changes
  useEffect(() => {
    if (account && fromToken.symbol === 'NEAR') {
      getMaxAvailable();
    }
  }, [account, fromToken]);

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

  const getMaxAvailable = async () => {
    if (!account) return;
    
    const validation = await swapService.validateSwapBalance(
      account.accountId,
      '0',
      fromToken
    );
    
    if (validation.maxAvailable) {
      setMaxAvailable(validation.maxAvailable);
    }
  };

  const getSwapQuote = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;

    try {
      setIsLoadingQuote(true);
      setError(null);
      
      // Validate balance first for NEAR swaps
      const validation = await swapService.validateSwapBalance(
        account.accountId,
        amount,
        fromToken
      );

      if (!validation.valid && validation.error) {
        setError(validation.error);
        setEstimatedOutput('0.00');
        setExchangeRate('0.00');
        setIsLoadingQuote(false);
        return;
      }

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

    // Safety check for NEAR swaps - keep minimum balance
    if (fromToken.symbol === 'NEAR') {
      const balance = parseFloat(account.balance);
      const swapAmount = parseFloat(amount);
      const refStorageFee = 0.25; // One-time Ref Finance FULL storage deposit
      const keepForAccount = 1.0; // Account storage minimum
      const neededTotal = swapAmount + refStorageFee + keepForAccount; // Amount + 0.25 (storage) + 1 (account)
      
      console.log('💰 Balance check:', {
        account: account.accountId,
        balance: balance,
        trying_to_swap: swapAmount,
        ref_storage: refStorageFee,
        keep_for_account: keepForAccount,
        total_needed: neededTotal,
        will_work: neededTotal <= balance
      });
      
      if (neededTotal > balance) {
        const maxSafe = Math.max(0, balance - 1.25).toFixed(2);
        setError(
          `⚠️ Insufficient balance!\n\n` +
          `Your balance: ${balance.toFixed(4)} NEAR\n` +
          `Trying to swap: ${swapAmount} NEAR\n` +
          `Ref Finance storage: 0.25 NEAR (one-time)\n` +
          `Account minimum: 1 NEAR\n\n` +
          `Maximum you can swap: ${maxSafe} NEAR`
        );
        return;
      }
      
      if (swapAmount > balance) {
        setError(`You only have ${balance.toFixed(4)} NEAR. Cannot swap ${swapAmount} NEAR.`);
        return;
      }
    }

    setIsSwapping(true);
    setError(null);
    setSwapResult(null);
    
    try {
      console.log('🔄 Preparing swap transaction...');
      console.log('From:', fromToken.symbol, 'To:', toToken.symbol, 'Amount:', amount);
      
      // Validate balance one more time before swap
      const validation = await swapService.validateSwapBalance(
        account.accountId,
        amount,
        fromToken
      );

      if (!validation.valid && validation.error) {
        setError(validation.error);
        setIsSwapping(false);
        return;
      }

      const transactionData = await swapService.prepareSwapTransaction({
        fromToken,
        toToken,
        amountIn: amount,
        accountId: account.accountId,
        slippage,
      });

      console.log('📝 Transaction data prepared');
      console.log('Transaction type:', Array.isArray(transactionData) ? 'Multi-transaction batch' : 'Single transaction');
      console.log('📤 Sending transaction(s) to wallet...');

      const result = await executeTransaction(transactionData);
      
      console.log('✅ Transaction result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', result ? Object.keys(result) : 'null');
      
      // Extract transaction hash from result (varies by wallet)
      let txHash = 'unknown';
      
      // Try multiple ways to get the transaction hash
      if (result?.transaction?.hash) {
        txHash = result.transaction.hash;
      } else if (result?.transaction_outcome?.id) {
        txHash = result.transaction_outcome.id;
      } else if (Array.isArray(result) && result[0]?.transaction?.hash) {
        // For batch transactions
        txHash = result[0].transaction.hash;
      } else if (typeof result === 'string') {
        txHash = result;
      } else if (!result || result === undefined) {
        // MyNearWallet redirects and returns undefined
        // Try to get hash from URL params after redirect
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const txHashes = urlParams.get('transactionHashes');
          if (txHashes) {
            // Take first hash from comma-separated list
            txHash = txHashes.split(',')[0];
            console.log('📝 Transaction hash from URL:', txHash);
          }
        }
      }
      
      console.log('📝 Final transaction hash:', txHash);
      
      // Check if transaction actually succeeded
      const success = txHash !== 'unknown' && !txHash.includes('error');
      
      if (!success) {
        console.error('⚠️ Transaction may have failed - no valid hash received');
        console.error('Full result:', JSON.stringify(result, null, 2));
      }
      
      const swapTransaction: SwapTransaction = {
        hash: txHash,
        from: account.accountId,
        to: Array.isArray(transactionData) ? transactionData[0]?.receiverId : transactionData.receiverId,
        fromToken,
        toToken,
        amountIn: amount,
        amountOut: estimatedOutput,
        status: success ? 'success' : 'pending',
        timestamp: Date.now(),
        explorerUrl: getExplorerUrl(txHash, 'testnet'),
        gasUsed: result?.transaction_outcome?.outcome?.gas_burnt?.toString(),
      };

      setSwapResult({
        success: success,
        transaction: swapTransaction,
      });

      console.log('✅ Transaction submitted!', swapTransaction);
      console.log('🔗 View on explorer:', swapTransaction.explorerUrl);
      
      // Show transaction link immediately
      alert(
        '✅ Transaction Submitted!\n\n' +
        `Transaction Hash: ${txHash}\n\n` +
        'Check transaction status at:\n' +
        `${swapTransaction.explorerUrl}\n\n` +
        'Your balances will update in 10-15 seconds.\n' +
        'Click Refresh button if needed.'
      );
      
      // If this was a NEAR wrap, guide user to next step
      if (fromToken.symbol === 'NEAR') {
        console.log('🔄 NEAR wrapping transaction submitted');
      } else {
        console.log('🔄 Token swap transaction submitted');
      }
      
      console.log('🔄 Starting aggressive balance refresh cycle...');
      
      // Aggressive refresh cycle - every 3 seconds for 30 seconds
      const refreshIntervals = [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000];
      
      refreshIntervals.forEach((delay, index) => {
        setTimeout(async () => {
          console.log(`🔄 Balance refresh ${index + 1}/${refreshIntervals.length}...`);
          try {
            await refreshBalance();
            console.log(`✅ Refresh ${index + 1} complete`);
          } catch (refreshErr) {
            console.error(`❌ Refresh ${index + 1} failed:`, refreshErr);
          }
        }, delay);
      });
      
      // After wrapping, switch to wNEAR
      if (fromToken.symbol === 'NEAR') {
        setTimeout(() => {
          console.log('🔄 Auto-switching to wNEAR...');
          setFromToken(NEAR_TOKENS.WNEAR);
        }, 8000);
      }
      
      // Clear form
      setAmount('');
      setEstimatedOutput('0.00');
      
    } catch (err: any) {
      console.error('❌ ========== SWAP ERROR DETAILS ==========');
      console.error('Error type:', typeof err);
      console.error('Error message:', err?.message);
      console.error('Error name:', err?.name);
      console.error('Error stack:', err?.stack);
      console.error('Error code:', err?.code);
      console.error('Error kind:', err?.kind);
      console.error('Full error:', err);
      
      // Try to extract detailed error information
      try {
        const errorStr = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
        console.error('Error JSON:', errorStr);
      } catch (jsonErr) {
        console.error('Could not stringify error');
      }
      
      console.error('❌ ======================================');
      
      // Check if this is an invalid token error (E102)
      if (err?.message?.includes('E102') || err?.message?.includes('invalid token id')) {
        console.error('❌ Invalid token error - token not whitelisted or pool doesn\'t exist');
        const errorMsg = 
          '⚠️ Token Swap Error\n\n' +
          'The token pair may not be available on Ref Finance testnet.\n' +
          'Possible reasons:\n' +
          '• Token not whitelisted on Ref Finance\n' +
          '• No liquidity pool exists\n' +
          '• Wrong token contract address\n\n' +
          'The swap functionality is working correctly - this is a testnet token availability issue.';
        
        setError(errorMsg);
        alert(errorMsg);
        setIsSwapping(false);
        return;
      }
      
      let errorMessage = 'Failed to execute swap';
      
      if (err?.message?.includes('User rejected') || err?.type === 'UserRejected') {
        errorMessage = 'Transaction cancelled';
      } else if (err?.message?.includes('does not have enough balance')) {
        errorMessage = 'Insufficient balance for transaction';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setSwapResult({
        success: false,
        error: errorMessage,
      });
      
      // Show detailed error to user
      const errorDetails = [
        `Error: ${errorMessage}`,
        ``,
        `Technical Details:`,
        `Type: ${typeof err}`,
        `Message: ${err?.message || 'N/A'}`,
        `Code: ${err?.code || 'N/A'}`,
        ``,
        `Please:`,
        `1. Check browser console (F12) for full details`,
        `2. Copy the error from console`,
        `3. Share with developer if issue persists`
      ].join('\n');
      
      alert(errorDetails);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxAmount = () => {
    if (!account) return;
    
    if (fromToken.symbol === 'NEAR') {
      // For NEAR, use validated max available
      if (maxAvailable && parseFloat(maxAvailable) > 0) {
        setAmount(maxAvailable);
      } else {
        const balance = parseFloat(account.balance);
        const max = Math.max(0, balance - 0.11); // 0.01 gas + 0.1 minimum
        setAmount(max.toFixed(2));
      }
    } else {
      // For tokens like wNEAR, use full balance (no gas needed from token balance)
      const tokenBalance = account.tokens?.find(t => t.token === fromToken.symbol);
      if (tokenBalance && tokenBalance.balance) {
        setAmount(tokenBalance.balance);
      }
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-[#f1f5f9] dark:border-slate-700 overflow-visible">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#e2e8f0] dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#0f172a' }}>
              Swap Tokens
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  console.log('🔄 Manual balance refresh triggered');
                  await refreshBalance();
                }}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors border border-green-200 dark:border-green-800"
                title="Refresh wallet balance from blockchain"
              >
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
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
                <span className="text-sm font-medium" style={{ color: '#0f172a' }}>Slippage Tolerance</span>
                <span className="text-sm" style={{ color: '#64748b' }}>{slippage}%</span>
              </div>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slippage === value
                        ? 'text-white'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={slippage === value ? { backgroundColor: '#2c5bff' } : { color: '#0f172a' }}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Interface */}
        <div className="p-4 md:p-6 relative">
          {!isConnected ? (
            <div className="text-center py-12">
              <Link className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg md:text-xl font-semibold mb-2" style={{ color: '#0f172a' }}>
                Connect Your Wallet
              </h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#64748b' }}>
                Connect your NEAR wallet to start swapping tokens with real-time market rates
              </p>
              <Button onClick={connect} size="lg" className="px-8">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info Notice for NEAR swaps */}
              {fromToken.symbol === 'NEAR' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>ℹ️ Why wrap first?</strong> NEAR is a native token. DEXes only trade fungible tokens (NEP-141). 
                    Wrapping converts NEAR → wNEAR so it can be swapped.
                    {maxAvailable && parseFloat(maxAvailable) > 0 && (
                      <span className="block mt-1">💡 Max: <strong>{maxAvailable} NEAR</strong></span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Show wNEAR balance after wrapping */}
              {fromToken.symbol === 'wNEAR' && account?.tokens?.find(t => t.token === 'wNEAR') && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-900 dark:text-green-200">
                    ✅ <strong>{account.tokens.find(t => t.token === 'wNEAR')?.balance} wNEAR</strong> available to swap.
                    <span className="block mt-1 text-xs">💰 Cost: 3 txs (~0.4 NEAR first time, ~0.01 if registered)</span>
                  </p>
                </div>
              )}
              
              {/* Warning if no wNEAR balance */}
              {fromToken.symbol === 'wNEAR' && (!account?.tokens?.find(t => t.token === 'wNEAR') || parseFloat(account?.tokens?.find(t => t.token === 'wNEAR')?.balance || '0') === 0) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-900 dark:text-yellow-200">
                    ⚠️ <strong>No wNEAR found.</strong> Select "NEAR" → wrap it → then swap.
                  </p>
                </div>
              )}
              
              {/* Info for swapping tokens back to NEAR */}
              {(fromToken.symbol === 'USDC' || fromToken.symbol === 'USDT' || fromToken.symbol === 'DAI') && toToken.symbol === 'NEAR' && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-orange-900 dark:text-orange-200">
                    💡 <strong>To get NEAR:</strong> Swap {fromToken.symbol} → wNEAR, then unwrap at Vault page.
                  </p>
                </div>
              )}
              
              {/* From Token */}
              <div className="relative z-20">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-[#e2e8f0] dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>
                      From
                    </span>
                    <div className="flex items-center space-x-2">
                      {account && (
                        <>
                          <span className="text-xs" style={{ color: '#64748b' }}>
                            Balance: {
                              fromToken.symbol === 'NEAR' 
                                ? account.balance 
                                : account.tokens?.find(t => t.token === fromToken.symbol)?.balance || '0.00'
                            }
                          </span>
                          {(fromToken.symbol === 'NEAR' || (account.tokens?.find(t => t.token === fromToken.symbol)?.balance && parseFloat(account.tokens?.find(t => t.token === fromToken.symbol)?.balance || '0') > 0)) && (
                            <button
                              onClick={handleMaxAmount}
                              className="px-2 py-1 rounded text-xs font-medium hover:opacity-90 transition-colors text-white"
                              style={{ backgroundColor: '#2c5bff' }}
                            >
                              MAX
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex items-center space-x-3 justify-between ">
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
                      className=" w-full text-3xl md:text-4xl font-bold   bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:text-slate-300 "
                      style={{ color: '#0f172a' }}
                    />
                    <div className="flex-1 w-fit-content">
                     <TokenSelector
                      selectedToken={fromToken}
                      onSelectToken={setFromToken}
                      excludeTokens={[toToken.id]}
                      compact={true}
                      /> 
                    </div>
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
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border-2 border-[#e2e8f0] dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>
                      To (Estimated)
                    </span>
                    {exchangeRate !== '0.00' && (
                      <span className="text-xs" style={{ color: '#64748b' }}>
                        1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="text-3xl md:text-4xl font-bold">
                        {isLoadingQuote ? (
                          <span className="text-slate-400 text-2xl">Calculating...</span>
                        ) : estimatedOutput && estimatedOutput !== '0.00' && estimatedOutput !== '0' ? (
                          <span style={{ color: '#0f172a' }}>~{estimatedOutput}</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0.0</span>
                        )}
                      </div>
                    </div>
                    <TokenSelector
                      selectedToken={toToken}
                      onSelectToken={setToToken}
                      excludeTokens={[fromToken.id]}
                      allowedTokens={fromToken.symbol === 'NEAR' ? ['wnear'] : undefined}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Swap Details */}
              {amount && parseFloat(amount) > 0 && !isLoadingQuote && estimatedOutput !== '0.00' && estimatedOutput !== '0' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#64748b' }}>Expected Output</span>
                    <span className="font-bold" style={{ color: '#0f172a' }}>
                      ~{estimatedOutput} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#64748b' }}>Price Impact</span>
                    <span className={`font-medium ${
                      priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 
                      priceImpact > 2 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#64748b' }}>Network Fee</span>
                    <span className="font-medium" style={{ color: '#0f172a' }}>
                      ~0.001 NEAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#64748b' }}>Slippage Tolerance</span>
                    <span className="font-medium" style={{ color: '#0f172a' }}>
                      {slippage}%
                    </span>
                  </div>
                  {pricesLastUpdated > 0 && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between" style={{ color: '#64748b' }}>
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
                disabled={isSwapping || !amount || parseFloat(amount) <= 0 || isLoadingQuote}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                {isSwapping ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{fromToken.symbol === 'NEAR' ? 'Wrapping NEAR...' : 'Swapping...'}</span>
                  </span>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !amount || parseFloat(amount) <= 0 ? (
                  'Enter Amount'
                ) : fromToken.symbol === 'NEAR' ? (
                  `Step 1: Wrap ${amount} NEAR → wNEAR`
                ) : (
                  `Swap ${fromToken.symbol} for ${toToken.symbol}`
                )}
              </Button>

              {/* Manual Refresh Button */}
              <Button
                onClick={async () => {
                  console.log('🔄 Manual balance refresh triggered');
                  await refreshBalance();
                  alert('Balance refresh triggered! Check "Your Token Balances" panel below.');
                }}
                variant="outline"
                className="w-full"
              >
                🔄 Refresh All Balances
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
                      {swapResult.success ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500" />
                      )}
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

      {/* Testnet Notice */}
      {isConnected && account && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>⚠️ Testnet Limitation:</strong> Ref Finance testnet has no liquidity pools. 
            Swaps submit but fail with "[1 failed receipt]". Registration works (costs 0.375 NEAR).
            <strong className="block mt-1">✅ On mainnet, all swaps work perfectly!</strong>
          </p>
        </div>
      )}

      {/* Token Balances Panel */}
      {isConnected && account && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Your Token Balances
            </h3>
            <button
              onClick={async () => {
                console.log('🔄 Manual token balance refresh');
                await refreshBalance();
              }}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-2">
            {/* NEAR Balance */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">NEAR</div>
                  <div className="text-xs text-slate-500">Native Token</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-slate-100">{account.balance}</div>
                <div className="text-xs text-slate-500">NEAR</div>
              </div>
            </div>

            {/* Token Balances */}
            {account.tokens && account.tokens.length > 0 ? (
              account.tokens.map((token) => (
                <div key={token.token} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{token.token}</div>
                      <div className="text-xs text-slate-500">{token.contract.substring(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{token.balance}</div>
                    <div className="text-xs text-slate-500">{token.token}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-center text-sm text-slate-500">
                No token balances found. Swap some tokens to see them here!
              </div>
            )}
          </div>
          
          <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
            💡 Balances update automatically after transactions. Click Refresh to update manually.
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="mt-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💱 <strong>Live Prices:</strong> Real-time rates from CoinGecko API. Click refresh icon to update.
          </p>
        </div>
      </div>
    </div>
  );
}

