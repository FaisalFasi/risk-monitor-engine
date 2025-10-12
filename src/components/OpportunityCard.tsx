import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustScoreDisplay } from '@/components/TrustScoreDisplay';
import { TransactionForm } from '@/components/TransactionForm';
import { scoringService, OpportunityScore } from '@/services/scoring-service';

interface Opportunity {
  id: number;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  contractAddress?: string;
  category?: string;
  tvl?: number;
  maxDeposit?: number;
  minDeposit?: number;
  status?: 'active' | 'inactive' | 'paused';
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isConnected: boolean;


  onDeposit?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
  onAllocate?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
  onWithdraw?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
}

export function OpportunityCard({ opportunity, isConnected, onDeposit, onAllocate, onWithdraw }: OpportunityCardProps) {
  const [opportunityScore, setOpportunityScore] = useState<OpportunityScore | null>(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [showForm, setShowForm] = useState<'deposit' | 'allocate' | 'withdraw' | null>(null);

  // Initialize or update opportunity score
  useEffect(() => {
    const mockMetrics = scoringService.generateMockMetrics(opportunity.id);
    const score = scoringService.updateOpportunityScore(
      opportunity.id,
      opportunity.name,
      opportunity.contractAddress || '',
      mockMetrics,
      (opportunity.category as any) || 'defi'
    );
    setOpportunityScore(score);
  }, [opportunity]);
    
  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-500 text-white">⭐ Preferred ({score})</Badge>;
    if (score >= 50) return <Badge variant="default" className="bg-yellow-500 text-white">✅ Moderate ({score})</Badge>;
    return <Badge variant="destructive">🚨 Caution ({score})</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'staking': return '🔒';
      case 'lending': return '💰';
      case 'liquidity': return '💧';
      case 'defi': return '🏛️';
      default: return '📊';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <StatusBadge status="success" text="Active" />;
      case 'paused': return <StatusBadge status="warning" text="Paused" />;
      case 'inactive': return <StatusBadge status="error" text="Inactive" />;
      default: return <StatusBadge status="info" text="Unknown" />;
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 border border-[#f1f5f9] dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(opportunity.category || '')}</span>
            <CardTitle className="text-xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
              {opportunity.name}
            </CardTitle>
          </div>
          {opportunity.status && getStatusBadge(opportunity.status)}
        </div>
        <CardDescription className="leading-relaxed" style={{ color: '#475569' }}>
          {opportunity.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#64748b' }}>APY:</span>
          <span className="text-lg font-bold text-[#10B981] dark:text-green-400">
            {opportunity.apy.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Trust Score:</span>
          <div className="flex items-center gap-2">
            {opportunityScore && (
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  opportunityScore.currentScore.total >= 80 ? 'border-green-500 text-green-600' :
                  opportunityScore.currentScore.total >= 60 ? 'border-yellow-500 text-yellow-600' :
                  'border-red-500 text-red-600'
                }`}
                onClick={() => setShowScoreDetails(!showScoreDetails)}
              >
                {opportunityScore.currentScore.total}/100
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="h-6 px-2 text-xs"
            >
              {showScoreDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
        
        {opportunity.tvl && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>TVL:</span>
            <span className="text-md font-bold" style={{ color: '#0f172a' }}>
              ${opportunity.tvl.toLocaleString()}
            </span>
          </div>
        )}
        
        {opportunity.minDeposit && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Min Deposit:</span>
            <span className="text-md font-bold" style={{ color: '#0f172a' }}>
              {opportunity.minDeposit} NEAR
            </span>
          </div>
        )}
        
        {opportunity.maxDeposit && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Max Deposit:</span>
            <span className="text-md font-bold" style={{ color: '#0f172a' }}>
              {opportunity.maxDeposit} NEAR
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Category:</span>
          <Badge variant="secondary">{opportunity.category}</Badge>
        </div>

        {/* Trust Score Details */}
        {showScoreDetails && opportunityScore && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <TrustScoreDisplay
              score={opportunityScore}
              showBreakdown={true}
              showMetrics={true}
              size="sm"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        {isConnected ? (
          <div className="space-y-2 w-full">
            {showForm ? (
              <div className="space-y-3">
                <TransactionForm
                  type={showForm}
                  onSubmit={async (data) => {
                    if (showForm === 'deposit' && onDeposit) {
                      await onDeposit(opportunity.id, data.amount, data.tokenType);
                    } else if (showForm === 'allocate' && onAllocate) {
                      await onAllocate(opportunity.id, data.amount, data.tokenType);
                    } else if (showForm === 'withdraw' && onWithdraw) {
                      await onWithdraw(opportunity.id, data.amount, data.tokenType);
                    }
                    setShowForm(null);
                  }}
                />
                <Button
                  onClick={() => setShowForm(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowForm('deposit')}
                  className="w-full text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#2c5bff' }}
                  disabled={opportunity.status !== 'active'}
                >
                  📥 Deposit
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => setShowForm('allocate')}
                    className="w-full text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: '#2c5bff' }}
                    disabled={opportunity.status !== 'active'}
                  >
                    🔄 Allocate
                  </Button>
                  <Button 
                    onClick={() => setShowForm('withdraw')}
                    className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={opportunity.status !== 'active'}
                  >
                    📤 Withdraw
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button 
            className="w-full bg-[#e2e8f0] dark:bg-gray-600 text-[#64748b] dark:text-white font-semibold cursor-not-allowed" 
            disabled
          >
            Connect Wallet to Interact
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
