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
    
    // Get reputation events for the agent
    const events = store.getReputationEvents(agentId);
    const allEvents = store.getAllReputationEvents();
    
    // Calculate summary
    const positiveEvents = events.filter(e => e.impact > 0).length;
    const negativeEvents = events.filter(e => e.impact < 0).length;
    const totalImpact = events.reduce((sum, e) => sum + e.impact, 0);
    
    // Calculate trend
    const recentEvents = events.slice(0, 5);
    const recentImpact = recentEvents.reduce((sum, e) => sum + e.impact, 0);
    const trend = recentImpact > 0 ? 'improving' : recentImpact < 0 ? 'declining' : 'stable';
    
    // Get agent scores
    const agent = store.getAgent(agentId);
    
    const summary = {
      totalEvents: events.length,
      positiveEvents,
      negativeEvents,
      totalImpact,
      trend,
      breakdown: {
        overall: agent?.score?.overall || 0,
        performance: agent?.score?.performance || 0,
        provenance: agent?.score?.provenance || 0,
        perception: agent?.score?.perception || 0,
      },
      recentEvents: events.slice(0, 10).map(event => ({
        id: event.id,
        description: event.description,
        impact: event.impact,
        timestamp: event.timestamp,
        type: event.type,
      })),
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching agentbeat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reputation data'
      },
      { status: 500 }
    );
  }
}
