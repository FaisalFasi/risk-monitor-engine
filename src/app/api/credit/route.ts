import { staticResponses } from '@/app/_utils/static-export';
import { CreditVault, VaultStatus } from '@/types/credit';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// Mock credit vaults data for AI agents
const mockCreditVaults: CreditVault[] = [
  {
    id: 'vault-001',
    agentId: 'agent-001',
    balance: 750000, // 750 NEAR borrowed
    creditLimit: 1000000, // 1000 NEAR limit
    currentLTV: 0.67, // 67%
    maxLTV: 0.75, // 75%
    utilization: 0.75, // 75% of credit used
    status: VaultStatus.ACTIVE,
    collateral: [
      {
        id: 'col-001',
        assetType: 'WNEAR',
        amount: 500,
        value: 2500, // $5 per NEAR
        ltvRatio: 0.75,
        liquidationThreshold: 0.85,
        lastUpdated: new Date('2025-10-12T10:00:00Z'),
      },
    ],
    riskMetrics: {
      healthFactor: 1.8,
      liquidationRisk: 0.15,
      collateralQuality: 0.92,
      marketVolatility: 0.28,
      lastCalculated: new Date('2025-10-12T18:00:00Z'),
    },
    createdAt: new Date('2025-09-01T00:00:00Z'),
    updatedAt: new Date('2025-10-12T18:00:00Z'),
  },
  {
    id: 'vault-002',
    agentId: 'agent-002',
    balance: 450000, // 450 NEAR borrowed
    creditLimit: 500000, // 500 NEAR limit
    currentLTV: 0.89, // 89% - high!
    maxLTV: 0.75,
    utilization: 0.90, // 90% of credit used
    status: VaultStatus.UNDER_REVIEW,
    collateral: [
      {
        id: 'col-002',
        assetType: 'USDC',
        amount: 1000,
        value: 1000, // $1 per USDC
        ltvRatio: 0.75,
        liquidationThreshold: 0.85,
        lastUpdated: new Date('2025-10-12T17:00:00Z'),
      },
    ],
    riskMetrics: {
      healthFactor: 1.1, // Warning level!
      liquidationRisk: 0.65,
      collateralQuality: 0.78,
      marketVolatility: 0.42,
      lastCalculated: new Date('2025-10-12T18:00:00Z'),
    },
    createdAt: new Date('2025-09-15T00:00:00Z'),
    updatedAt: new Date('2025-10-12T18:00:00Z'),
  },
  {
    id: 'vault-003',
    agentId: 'agent-003',
    balance: 1200000, // 1200 NEAR borrowed
    creditLimit: 2000000, // 2000 NEAR limit
    currentLTV: 0.48, // 48% - healthy
    maxLTV: 0.75,
    utilization: 0.60, // 60% of credit used
    status: VaultStatus.ACTIVE,
    collateral: [
      {
        id: 'col-003',
        assetType: 'WNEAR',
        amount: 1000,
        value: 5000, // $5 per NEAR
        ltvRatio: 0.75,
        liquidationThreshold: 0.85,
        lastUpdated: new Date('2025-10-12T16:00:00Z'),
      },
      {
        id: 'col-003b',
        assetType: 'USDC',
        amount: 1500,
        value: 1500,
        ltvRatio: 0.80,
        liquidationThreshold: 0.90,
        lastUpdated: new Date('2025-10-12T16:00:00Z'),
      },
    ],
    riskMetrics: {
      healthFactor: 2.5, // Very healthy
      liquidationRisk: 0.05,
      collateralQuality: 0.95,
      marketVolatility: 0.18,
      lastCalculated: new Date('2025-10-12T18:00:00Z'),
    },
    createdAt: new Date('2025-08-20T00:00:00Z'),
    updatedAt: new Date('2025-10-12T18:00:00Z'),
  },
];

// Calculate aggregate stats
const calculateStats = () => {
  const totalVaults = mockCreditVaults.length;
  const activeVaults = mockCreditVaults.filter(v => v.status === VaultStatus.ACTIVE).length;
  const atRiskVaults = mockCreditVaults.filter(v => v.riskMetrics.healthFactor < 1.5).length;
  
  const totalCreditLimit = mockCreditVaults.reduce((sum, v) => sum + v.creditLimit, 0);
  const totalBorrowed = mockCreditVaults.reduce((sum, v) => sum + v.balance, 0);
  const totalCollateralValue = mockCreditVaults.reduce((sum, v) => 
    sum + v.collateral.reduce((colSum, col) => colSum + col.value, 0), 0
  );
  
  const avgHealthFactor = mockCreditVaults.reduce((sum, v) => 
    sum + v.riskMetrics.healthFactor, 0) / totalVaults;
  
  const avgUtilization = mockCreditVaults.reduce((sum, v) => 
    sum + v.utilization, 0) / totalVaults;

  return {
    totalVaults,
    activeVaults,
    atRiskVaults,
    totalCreditLimit: totalCreditLimit / 1000000, // Convert to millions
    totalBorrowed: totalBorrowed / 1000000,
    totalCollateralValue: totalCollateralValue / 1000,
    avgHealthFactor: avgHealthFactor.toFixed(2),
    avgUtilization: (avgUtilization * 100).toFixed(1),
    protocolRevenue: 542, // Mock monthly revenue from interest
  };
};

export async function GET() {
  const stats = calculateStats();
  
  // Return data directly without double nesting
  return Response.json({
    success: true,
    data: mockCreditVaults,
    stats,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return staticResponses.notAllowed();
}
