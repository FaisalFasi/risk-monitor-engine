'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/types/tokens';
import { NearTransactionHistory } from '@/services/near-transaction-history';
import { RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  accountId: string;
  network?: 'testnet' | 'mainnet';
  limit?: number;
}

export function TransactionHistory({ 
  accountId, 
  network = 'testnet',
  limit = 25 
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ minutesLeft: number; resetTime: Date | null } | null>(null);
  const lastFetchRef = useRef<number>(0);
  const lastAccountRef = useRef<string>('');

  // Memoize the service instance to prevent recreation on every render
  const transactionService = useMemo(() => new NearTransactionHistory(network), [network]);

  // Check rate limit status on mount and periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const status = transactionService.isRateLimited();
      if (status.limited) {
        setRateLimitInfo({ minutesLeft: status.minutesLeft, resetTime: status.resetTime });
      } else {
        setRateLimitInfo(null);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [transactionService]);

  const loadTransactions = useCallback(async (loadMore = false, forceRefresh = false) => {
    // CHECK RATE LIMIT but don't block - Pikespeak API works even if NearBlocks is limited
    if (!forceRefresh) {
      const status = transactionService.isRateLimited();
      if (status.limited) {
        console.log('⏰ NearBlocks rate limited, but trying Pikespeak API first...');
        // Don't block - let Pikespeak API try
        setRateLimitInfo({ minutesLeft: status.minutesLeft, resetTime: status.resetTime });
      }
    }

    // Extra validation
    if (!accountId || accountId === 'undefined') {
      console.error('❌ Cannot load transactions: Invalid accountId', accountId);
      setError('Invalid account ID');
      setLoading(false);
      return;
    }

    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    
    // If account changed, reset the debounce
    if (lastAccountRef.current !== accountId) {
      lastAccountRef.current = accountId;
      lastFetchRef.current = 0;
    }
    
    // Debounce: Don't fetch if less than 2 seconds since last fetch (unless it's a manual refresh)
    if (!forceRefresh && !loadMore && timeSinceLastFetch < 2000 && lastFetchRef.current !== 0) {
      console.log('⏳ Skipping fetch - too soon since last request');
      return;
    }
    
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Loading transaction history for:', accountId);

      const currentOffset = loadMore ? offset : 0;

      const result = await transactionService.getTransactionHistory({
        accountId,
        limit,
        offset: currentOffset,
        network,
      });

      if (loadMore) {
        setTransactions(prev => [...prev, ...result.transactions]);
      } else {
        setTransactions(result.transactions);
      }

      setHasMore(result.hasMore);
      setOffset(currentOffset + limit);

    } catch (err) {
      console.error('Error loading transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      
      // Check if it's a rate limit error
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        const status = transactionService.isRateLimited();
        if (status.limited) {
          setRateLimitInfo({ minutesLeft: status.minutesLeft, resetTime: status.resetTime });
          setError(`⚠️ Rate limited. Try again in ${status.minutesLeft} minute(s) at ${status.resetTime?.toLocaleTimeString()}`);
        } else {
          setError('⚠️ NearBlocks API rate limit reached. Please wait and click Refresh.');
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [accountId, network, limit, offset, transactionService]);

  useEffect(() => {
    // Check rate limit but DON'T block - Pikespeak API should work
    const status = transactionService.isRateLimited();
    if (status.limited) {
      console.log('⏰ NearBlocks rate limited, but trying Pikespeak API...');
      setRateLimitInfo({ minutesLeft: status.minutesLeft, resetTime: status.resetTime });
      // Continue anyway - let Pikespeak try
    }

    // Only load if accountId is valid
    if (accountId && accountId !== 'undefined') {
      loadTransactions();
    } else {
      console.warn('⚠️ TransactionHistory: Invalid accountId:', accountId);
      setLoading(false);
      setError('Please connect your wallet to view transaction history');
    }
  }, [accountId, network]);

  const handleLoadMore = () => {
    loadTransactions(true);
  };

  const handleRefresh = () => {
    setOffset(0);
    lastFetchRef.current = 0; // Reset debounce timer
    loadTransactions(false, true); // Force refresh
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'transfer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'stake':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'contract_call':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // More than 1 day
    return date.toLocaleDateString();
  };

  const truncateAddress = (address: string | undefined | null, chars = 8) => {
    if (!address) return 'Unknown';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  const handleClearRateLimit = () => {
    transactionService.clearRateLimit();
    setRateLimitInfo(null);
    setError(null);
    handleRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <a
          href={`https://testnet.nearblocks.io/address/${accountId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          View All on NearBlocks →
        </a>
        <Button 
          onClick={handleRefresh} 
          disabled={loading || (rateLimitInfo !== null && rateLimitInfo.minutesLeft > 0)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {rateLimitInfo && rateLimitInfo.minutesLeft > 0 ? `Wait ${rateLimitInfo.minutesLeft}m` : 'Refresh'}
        </Button>
      </div>
      <div>
        {rateLimitInfo && rateLimitInfo.minutesLeft > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  API Rate Limit Active
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  Too many API requests. History will be available in <strong>{rateLimitInfo.minutesLeft} minute(s)</strong> at {rateLimitInfo.resetTime?.toLocaleTimeString()}.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleClearRateLimit}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    I've Waited - Retry Now
                  </Button>
                  <a
                    href={`https://testnet.nearblocks.io/address/${accountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-xs font-medium"
                  >
                    View on Explorer Instead →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && !rateLimitInfo && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              💡 You can verify your transactions manually at:{' '}
              <a 
                href={`https://testnet.nearblocks.io/address/${accountId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                NearBlocks Explorer
              </a>
            </p>
          </div>
        )}

        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: '#2c5bff', borderTopColor: 'transparent' }}></div>
            <p className="text-sm" style={{ color: '#475569' }}>Loading transactions from Pikespeak API...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="space-y-4">
            {/* Main message with retry */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="text-center space-y-4">
                <div className="text-5xl mb-2">⏰</div>
                <div>
                  <p className="font-semibold text-lg mb-2" style={{ color: '#0f172a' }}>
                    Transaction History Temporarily Unavailable
                  </p>
                  <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                    The transaction indexer API is rate limited. Your transactions are safe on the blockchain.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    onClick={() => {
                      localStorage.removeItem('nearblocks_rate_limit');
                      window.location.reload();
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Loading History
                  </button>
                  
                  <span className="text-sm text-slate-400">or</span>
                  
                  <a
                    href={`https://testnet.nearblocks.io/address/${accountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-2"
                  >
                    View on Explorer →
                  </a>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                  💡 NearBlocks explorer always works and shows all your transactions
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div
                key={`${tx.hash}-${index}`}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getTypeColor(tx.type || 'transfer')}`}>
                      {(tx.type || 'transfer').replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(tx.status || 'pending')}`}>
                      {(tx.status || 'pending').toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs" style={{ color: '#64748b' }}>
                    {tx.timestamp ? formatTime(tx.timestamp) : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">From</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {tx.from || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">To</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {tx.to || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {tx.value || '0 NEAR'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {tx.fee ? `Fee: ${tx.fee}` : 'Fee: ~0.0001 NEAR'}
                    </p>
                  </div>
                  {tx.explorerUrl && (
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline flex items-center space-x-1"
                      style={{ color: '#2c5bff' }}
                    >
                      <span>View</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
