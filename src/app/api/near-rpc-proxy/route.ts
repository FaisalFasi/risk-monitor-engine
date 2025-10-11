import { NextRequest, NextResponse } from 'next/server';

// RPC endpoints with fallback support (in order of preference)
const RPC_ENDPOINTS = {
  testnet: [
    'https://test.rpc.fastnear.com',      // FastNEAR - good rate limits
    'https://near-testnet.lava.build',    // Lava Network - good alternative
    'https://rpc.testnet.near.org',       // Official NEAR RPC (fallback)
  ],
  mainnet: [
    'https://free.rpc.fastnear.com',      // FastNEAR - good rate limits
    'https://near.lava.build',             // Lava Network - good alternative
    'https://rpc.mainnet.near.org',        // Official NEAR RPC (fallback)
  ],
};

async function fetchWithFallback(body: any, endpoints: string[]): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      console.log(`Attempting RPC request to: ${endpoint} (attempt ${i + 1}/${endpoints.length})`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // If response is OK, return it
      if (response.ok) {
        console.log(`✅ Success with endpoint: ${endpoint}`);
        return response;
      }

      // If rate limited (429) or server error (5xx), try next endpoint
      if (response.status === 429 || response.status >= 500) {
        console.warn(`⚠️ Endpoint ${endpoint} returned status ${response.status}, trying next...`);
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      // For other errors (4xx), return the response as is
      return response;
      
    } catch (error) {
      console.warn(`⚠️ Endpoint ${endpoint} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Try next endpoint
      continue;
    }
  }

  // All endpoints failed
  throw lastError || new Error('All RPC endpoints failed');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the network from environment or default to testnet
    const networkId = process.env.NEXT_PUBLIC_NEAR_NETWORK_ID || 'testnet';
    const endpoints = RPC_ENDPOINTS[networkId as keyof typeof RPC_ENDPOINTS] || RPC_ENDPOINTS.testnet;

    console.log(`Proxying NEAR RPC request for network: ${networkId}`);
    
    // Try to fetch with fallback endpoints
    const response = await fetchWithFallback(body, endpoints);
    const data = await response.json();
    
    // Return the response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Error proxying NEAR RPC request (all endpoints failed):', error);
    return NextResponse.json(
      { 
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'All RPC endpoints failed. Please try again later.',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { 
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

