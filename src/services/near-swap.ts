// Service for executing token swaps on NEAR using Ref Finance

import { Token, SwapQuote, SwapTransaction, parseTokenAmount, formatTokenAmount, getExplorerUrl } from '@/types/tokens';

export interface SwapOptions {
  fromToken: Token;
  toToken: Token;
  amountIn: string;
  slippage?: number; // in percentage, default 0.5%
  accountId: string;
}

export interface SwapEstimate {
  quote: SwapQuote;
  minimumReceived: string;
  priceImpact: number;
  exchangeRate: string;
}

/**
 * NEAR Swap Service
 * Handles token swaps using Ref Finance (NEAR's main DEX)
 * or prepares transactions for NEAR Intents protocol
 */
export class NearSwapService {
  private refFinanceContract: string;
  private network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.refFinanceContract = network === 'testnet' 
      ? 'ref-finance-101.testnet'  // Ref Finance testnet contract
      : 'v2.ref-finance.near';      // Ref Finance mainnet contract
  }

  /**
   * Get a swap estimate/quote
   */
  async getSwapEstimate(options: SwapOptions): Promise<SwapEstimate> {
    const { fromToken, toToken, amountIn, slippage = 0.5 } = options;

    try {
      console.log(`Getting swap estimate: ${amountIn} ${fromToken.symbol} → ${toToken.symbol}`);

      // For demo/testing purposes, we'll calculate a simple estimate
      // In production, you'd call Ref Finance's get_return method
      const amountInParsed = parseTokenAmount(amountIn, fromToken.decimals);
      
      // Simulate exchange rate (in production, get this from Ref Finance)
      const exchangeRate = await this.getExchangeRate(fromToken, toToken);
      const amountOutRaw = BigInt(amountInParsed) * BigInt(Math.floor(exchangeRate * 1000)) / BigInt(1000);
      
      // Apply slippage
      const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100));
      const amountOutWithSlippage = amountOutRaw * slippageMultiplier / BigInt(10000);
      
      const amountOut = formatTokenAmount(amountOutWithSlippage.toString(), toToken.decimals);
      const minimumReceived = formatTokenAmount(amountOutWithSlippage.toString(), toToken.decimals);

      // Calculate price impact (simplified)
      const priceImpact = 0.1; // 0.1% (in production, calculate based on liquidity)

      // Simulate route (in production, get optimal route from Ref Finance)
      const route = this.getSwapRoute(fromToken, toToken);

      const quote: SwapQuote = {
        fromToken,
        toToken,
        amountIn,
        amountOut,
        priceImpact,
        fee: '0.3%', // Ref Finance fee
        route,
      };

      return {
        quote,
        minimumReceived,
        priceImpact,
        exchangeRate: exchangeRate.toFixed(4),
      };

    } catch (error) {
      console.error('Error getting swap estimate:', error);
      throw new Error(`Failed to get swap estimate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prepare a swap transaction (returns transaction data for wallet to sign)
   * This creates the actual transaction object that will be signed by the user's wallet
   */
  async prepareSwapTransaction(options: SwapOptions): Promise<any> {
    const { fromToken, toToken, amountIn, slippage = 0.5 } = options;
    
    try {
      const estimate = await this.getSwapEstimate(options);
      
      console.log('Preparing swap transaction:', {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount: amountIn,
        estimate: estimate.quote.amountOut,
      });

      // For testnet demo swaps, we'll use a simple NEAR transfer to simulate
      // In production, this would call Ref Finance contract
      const actions = [];

      if (fromToken.isNative && fromToken.symbol === 'NEAR') {
        // For NEAR swaps, we can do a simple transfer to demonstrate
        // In real implementation, this would interact with Ref Finance
        actions.push({
          type: 'Transfer',
          params: {
            deposit: parseTokenAmount('0.01', 24), // Small test amount
          },
        });
      } else {
        // For token swaps, prepare function call
        actions.push({
          type: 'FunctionCall',
          params: {
            methodName: 'ft_transfer_call',
            args: {
              receiver_id: this.refFinanceContract,
              amount: parseTokenAmount(amountIn, fromToken.decimals),
              msg: JSON.stringify({
                force: 0,
                actions: [{
                  pool_id: this.getPoolId(fromToken, toToken),
                  token_in: fromToken.contractId,
                  token_out: toToken.contractId,
                  min_amount_out: parseTokenAmount(estimate.minimumReceived, toToken.decimals),
                }]
              }),
            },
            gas: '180000000000000', // 180 TGas
            deposit: '1', // 1 yoctoNEAR
          },
        });
      }

      // Return transaction in wallet selector format
      return {
        signerId: options.accountId,
        receiverId: fromToken.isNative ? options.accountId : fromToken.contractId,
        actions,
      };
      
    } catch (error) {
      console.error('Error preparing swap transaction:', error);
      throw error;
    }
  }

  /**
   * Execute swap (for server-side execution with private key)
   * For client-side, use prepareSwap and have the wallet sign it
   */
  async executeSwap(options: SwapOptions): Promise<SwapTransaction> {
    try {
      console.log(`Executing swap: ${options.amountIn} ${options.fromToken.symbol} → ${options.toToken.symbol}`);

      // Get swap estimate
      const estimate = await this.getSwapEstimate(options);

      // In production, this would:
      // 1. Prepare the transaction
      // 2. Sign it with the user's wallet
      // 3. Send it to the blockchain
      // 4. Wait for confirmation

      // For now, we'll simulate a successful swap
      const mockTxHash = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transaction: SwapTransaction = {
        hash: mockTxHash,
        from: options.accountId,
        to: this.refFinanceContract,
        fromToken: options.fromToken,
        toToken: options.toToken,
        amountIn: options.amountIn,
        amountOut: estimate.quote.amountOut,
        status: 'pending',
        timestamp: Date.now(),
        explorerUrl: getExplorerUrl(mockTxHash, this.network),
      };

      console.log('✅ Swap transaction created:', transaction);

      return transaction;

    } catch (error) {
      console.error('Error executing swap:', error);
      throw new Error(`Failed to execute swap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get exchange rate between two tokens
   * In production, fetch from Ref Finance or price oracle
   */
  private async getExchangeRate(fromToken: Token, toToken: Token): Promise<number> {
    // Simulate exchange rates
    const rates: Record<string, Record<string, number>> = {
      NEAR: {
        USDC: 4.50,    // 1 NEAR = 4.50 USDC
        USDT: 4.48,    // 1 NEAR = 4.48 USDT
        DAI: 4.49,     // 1 NEAR = 4.49 DAI
        WETH: 0.0013,  // 1 NEAR = 0.0013 WETH
        WBTC: 0.00008, // 1 NEAR = 0.00008 WBTC
      },
      USDC: {
        NEAR: 0.222,   // 1 USDC = 0.222 NEAR
        USDT: 0.998,   // 1 USDC ≈ 1 USDT
        DAI: 0.999,    // 1 USDC ≈ 1 DAI
      },
      USDT: {
        NEAR: 0.223,
        USDC: 1.002,
        DAI: 1.001,
      },
    };

    const fromRates = rates[fromToken.symbol];
    if (fromRates && fromRates[toToken.symbol]) {
      return fromRates[toToken.symbol];
    }

    // Default fallback
    return 1.0;
  }

  /**
   * Get swap route (which pools to use)
   * In production, get optimal route from Ref Finance
   */
  private getSwapRoute(fromToken: Token, toToken: Token): string[] {
    // For most swaps, it's direct
    // For some, you might need to go through wNEAR
    if (fromToken.isNative || toToken.isNative) {
      return [fromToken.symbol, toToken.symbol];
    }

    // If neither is NEAR, might need to route through wNEAR
    if (!this.hasDirectPool(fromToken, toToken)) {
      return [fromToken.symbol, 'wNEAR', toToken.symbol];
    }

    return [fromToken.symbol, toToken.symbol];
  }

  /**
   * Check if direct pool exists
   */
  private hasDirectPool(fromToken: Token, toToken: Token): boolean {
    // Common pairs have direct pools
    const commonPairs = ['NEAR-USDC', 'NEAR-USDT', 'USDC-USDT', 'USDC-DAI'];
    const pair = `${fromToken.symbol}-${toToken.symbol}`;
    const reversePair = `${toToken.symbol}-${fromToken.symbol}`;
    
    return commonPairs.includes(pair) || commonPairs.includes(reversePair);
  }

  /**
   * Get pool ID for a token pair
   * In production, fetch from Ref Finance
   */
  private getPoolId(fromToken: Token, toToken: Token): number {
    // Simulated pool IDs (in production, fetch from Ref Finance)
    const poolIds: Record<string, number> = {
      'NEAR-USDC': 1,
      'NEAR-USDT': 2,
      'USDC-USDT': 3,
      'NEAR-DAI': 4,
      'USDC-DAI': 5,
    };

    const pair = `${fromToken.symbol}-${toToken.symbol}`;
    const reversePair = `${toToken.symbol}-${fromToken.symbol}`;

    return poolIds[pair] || poolIds[reversePair] || 0;
  }

  /**
   * Get recent swaps for an account
   */
  async getRecentSwaps(accountId: string, limit: number = 10): Promise<SwapTransaction[]> {
    try {
      console.log(`Fetching recent swaps for ${accountId}`);
      
      // In production, fetch from NearBlocks or indexer
      // Filter for swap transactions
      
      // For now, return empty array
      return [];

    } catch (error) {
      console.error('Error fetching recent swaps:', error);
      return [];
    }
  }
}

// Export singleton instance
export const nearSwapService = new NearSwapService('testnet');

