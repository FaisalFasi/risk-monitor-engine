import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Ensure data is seeded
    ensureSeeded();
    
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get agent
    const agent = store.getAgent(agentId);
    
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found'
        },
        { status: 404 }
      );
    }
    
    // Generate risk metrics based on agent's credibility tier
    const tierMultipliers: Record<string, number> = {
      'PLATINUM': 1.2,
      'GOLD': 1.0,
      'SILVER': 0.8,
      'BRONZE': 0.6,
    };
    
    const multiplier = tierMultipliers[agent.credibilityTier] || 0.8;
    
    // Calculate LTV based on tier (higher tier = higher max LTV)
    const maxLTV = 60 + (multiplier * 20); // 60-84%
    const currentLTV = maxLTV * (0.4 + Math.random() * 0.3); // 40-70% utilization
    
    // Generate risk metrics
    const riskMetrics = {
      healthFactor: 1.2 + Math.random() * 0.8, // 1.2 - 2.0
      ltv: {
        current: parseFloat(currentLTV.toFixed(2)),
        maximum: parseFloat(maxLTV.toFixed(2)),
        utilization: parseFloat(((currentLTV / maxLTV) * 100).toFixed(1)),
      },
      creditLine: {
        total: Math.floor(100000 + multiplier * 400000), // $100k - $580k
        used: Math.floor((100000 + multiplier * 400000) * (currentLTV / maxLTV)),
        available: 0, // Will calculate below
        apr: parseFloat((5 + (1 - multiplier) * 5).toFixed(2)), // 5-8% (lower tier = higher APR)
      },
      collateral: {
        totalValue: Math.floor(200000 + multiplier * 600000), // $200k - $920k
        requiredValue: 0, // Will calculate below
        excessCollateral: 0, // Will calculate below
        collateralRatio: 0, // Will calculate below
      },
      assetManagement: {
        aum: Math.floor(500000 + multiplier * 1500000), // $500k - $2.3M
        diversityScore: Math.floor(60 + multiplier * 30), // 60-96
        liquidationRisk: parseFloat((100 - multiplier * 60).toFixed(1)), // 28-76 (inverted)
      },
      performanceVariance: parseFloat((5 + Math.random() * 15).toFixed(1)), // 5-20%
      tierStability: Math.floor(70 + multiplier * 25), // 70-100
      marketExposure: parseFloat((30 + Math.random() * 40).toFixed(1)), // 30-70%
    };
    
    // Calculate derived values
    riskMetrics.creditLine.available = riskMetrics.creditLine.total - riskMetrics.creditLine.used;
    riskMetrics.collateral.requiredValue = Math.floor(riskMetrics.creditLine.used * 1.5);
    riskMetrics.collateral.totalValue = Math.floor(riskMetrics.collateral.requiredValue * (1 + Math.random() * 0.5));
    riskMetrics.collateral.excessCollateral = riskMetrics.collateral.totalValue - riskMetrics.collateral.requiredValue;
    riskMetrics.collateral.collateralRatio = parseFloat(((riskMetrics.collateral.totalValue / riskMetrics.creditLine.used) * 100).toFixed(1));
    
    return NextResponse.json({
      success: true,
      data: riskMetrics
    });
  } catch (error) {
    console.error('Error fetching risk metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch risk metrics'
      },
      { status: 500 }
    );
  }
}
