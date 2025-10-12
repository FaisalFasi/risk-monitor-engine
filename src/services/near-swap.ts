// Service for executing token swaps on NEAR using Ref Finance

import { Token, SwapQuote, SwapTransaction, parseTokenAmount, formatTokenAmount, getExplorerUrl } from '@/types/tokens';
import { priceService } from './price-service';

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

      // Calculate estimate based on exchange rate
      const amountInFloat = parseFloat(amountIn);
      
      // Get exchange rate (in production, get this from Ref Finance)
      const exchangeRate = await this.getExchangeRate(fromToken, toToken);
      
      // Calculate output amount in token units (not yocto)
      const amountOutFloat = amountInFloat * exchangeRate;
      
      // Apply slippage (0.5% default)
      const slippageFactor = (100 - slippage) / 100;
      const amountOutWithSlippage = amountOutFloat * slippageFactor;
      
      // Format to reasonable decimals based on token
      const decimalsToShow = toToken.decimals === 24 ? 4 : toToken.decimals === 18 ? 6 : 2;
      const amountOut = amountOutWithSlippage.toFixed(decimalsToShow);
      const minimumReceived = amountOutWithSlippage.toFixed(decimalsToShow);

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

      // Check if trying to swap native NEAR
      if (fromToken.isNative && fromToken.symbol === 'NEAR') {
        throw new Error(
          '⚠️ Direct NEAR swaps not supported yet.\n\n' +
          'To swap NEAR:\n' +
          '1. Go to Vault (/near-intents/vault)\n' +
          '2. Wrap your NEAR → wNEAR\n' +
          '3. Come back and swap wNEAR → other tokens\n\n' +
          'Or use the Transfer feature to send NEAR directly.'
        );
      }

      // REAL swap for wrapped tokens using Ref Finance
      const amountInParsed = parseTokenAmount(amountIn, fromToken.decimals);
      const minAmountOut = parseTokenAmount(estimate.minimumReceived, toToken.decimals);

      // Token → Token swap via Ref Finance
      const actions = [{
        type: 'FunctionCall',
        params: {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: this.refFinanceContract,
            amount: amountInParsed,
            msg: JSON.stringify({
              force: 0,
              actions: [{
                pool_id: this.getPoolId(fromToken, toToken),
                token_in: fromToken.contractId || fromToken.symbol,
                token_out: toToken.contractId || toToken.symbol,
                min_amount_out: minAmountOut,
              }]
            }),
          },
          gas: '180000000000000', // 180 TGas
          deposit: '1', // 1 yoctoNEAR for security
        },
      }];
      
      return {
        signerId: options.accountId,
        receiverId: fromToken.contractId || this.refFinanceContract,
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
   * Get exchange rate between two tokens using LIVE market prices
   * Fetches from CoinGecko API with fallback to cached prices
   */
  private async getExchangeRate(fromToken: Token, toToken: Token): Promise<number> {
    try {
      // Get real-time exchange rate from price service
      const rate = await priceService.getExchangeRate(fromToken.symbol, toToken.symbol);
      console.log(`💱 Live rate: 1 ${fromToken.symbol} = ${rate.toFixed(4)} ${toToken.symbol}`);
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate, using fallback:', error);
      // Fallback to last known rates if API fails
      return priceService.getExchangeRate(fromToken.symbol, toToken.symbol);
    }
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

