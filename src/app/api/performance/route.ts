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
    
    // Generate mock performance metrics
    // In production, these would come from actual tracking/analytics
    const metrics = {
      apr: 12.5 + Math.random() * 10, // 12.5% - 22.5%
      ltv: 65 + Math.random() * 10, // 65% - 75%
      aum: 500000 + Math.random() * 1000000, // $500k - $1.5M
      volatility: 5 + Math.random() * 10, // 5% - 15%
      sharpeRatio: 1.2 + Math.random() * 0.8, // 1.2 - 2.0
      maxDrawdown: 8 + Math.random() * 12, // 8% - 20%
      lastUpdated: new Date(),
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance metrics'
      },
      { status: 500 }
    );
  }
}
