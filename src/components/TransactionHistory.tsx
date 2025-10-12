'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/types/tokens';
import { NearTransactionHistory } from '@/services/near-transaction-history';

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

  const transactionService = new NearTransactionHistory(network);

  useEffect(() => {
    loadTransactions();
  }, [accountId, network]);

  const loadTransactions = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadTransactions(true);
  };

  const handleRefresh = () => {
    setOffset(0);
    loadTransactions(false);
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
    if (!address) return 'N/A';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent transactions for {truncateAddress(accountId, 12)}
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? '🔄' : '↻'} Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: '#2c5bff', borderTopColor: 'transparent' }}></div>
            <p className="text-sm" style={{ color: '#475569' }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p style={{ color: '#0f172a' }}>No transactions found</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Make a swap or transfer to see your history here
            </p>
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
                    <p className="text-xs" style={{ color: '#64748b' }}>From</p>
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      {truncateAddress(tx.from)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#64748b' }}>To</p>
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      {truncateAddress(tx.to)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      {tx.value || '0 NEAR'}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      Fee: {tx.fee || '0 NEAR'}
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
      </CardContent>
    </Card>
  );
}
