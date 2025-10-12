'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  TrendingUp
} from 'lucide-react';

interface VaultActivity {
  id: string;
  type: 'deposit' | 'withdraw';
  token: string;
  amount: string;
  shares: string;
  timestamp: number;
  txHash?: string;
}

interface VaultActivityHistoryProps {
  accountId?: string;
  className?: string;
}

// Mock vault activities - in production this would come from smart contract events
const mockVaultActivities: VaultActivity[] = [
  {
    id: '1',
    type: 'deposit',
    token: 'WNEAR',
    amount: '50.0000',
    shares: '50.0000',
    timestamp: Date.now() - 3600000,
    txHash: 'vault_dep_001'
  },
  {
    id: '2',
    type: 'withdraw',
    token: 'USDC',
    amount: '100.0000',
    shares: '95.5000',
    timestamp: Date.now() - 7200000,
    txHash: 'vault_wth_002'
  },
  {
    id: '3',
    type: 'deposit',
    token: 'USDT',
    amount: '200.0000',
    shares: '200.0000',
    timestamp: Date.now() - 86400000,
    txHash: 'vault_dep_003'
  }
];

export const VaultActivityHistory: React.FC<VaultActivityHistoryProps> = ({ accountId, className }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Vault Activity
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Your deposits and withdrawals from the vault (not token transfers)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mockVaultActivities.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-slate-600 dark:text-slate-400">
              No vault activity yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Deposit tokens into the vault to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockVaultActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'deposit' 
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    {activity.type === 'deposit' ? (
                      <ArrowDownToLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpFromLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {activity.type === 'deposit' ? 'Deposited' : 'Withdrew'} {activity.token}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {activity.type === 'deposit' ? '+' : '-'}{activity.amount}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activity.shares} shares {activity.type === 'deposit' ? 'minted' : 'burned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            💡 <strong>Note:</strong> This shows only vault deposits/withdrawals. 
            For token transfers, check the Transfer tab. For all activity, check the Swap tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

