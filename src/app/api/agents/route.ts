import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ensure data is seeded
    ensureSeeded();
    
    // Get all agents from store
    const agents = store.getAgents();
    
    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Add agent to store
    store.addAgent(body);
    
    return NextResponse.json({
      success: true,
      data: body
    });
  } catch (error) {
    console.error('Error adding agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add agent'
      },
      { status: 500 }
    );
  }
}
