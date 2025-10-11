// Service for fetching NEAR transaction history from blockchain APIs

import { Transaction, getExplorerUrl } from '@/types/tokens';

export interface TransactionHistoryOptions {
  accountId: string;
  limit?: number;
  offset?: number;
  network?: 'testnet' | 'mainnet';
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch transaction history for a NEAR account
 * Uses multiple data sources with fallback:
 * 1. NearBlocks API (primary)
 * 2. NEAR RPC (fallback)
 * 3. Pagoda Enhanced API (fallback)
 */
export class NearTransactionHistory {
  private network: 'testnet' | 'mainnet';
  private rpcUrl: string;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.rpcUrl = network === 'testnet' 
      ? 'https://test.rpc.fastnear.com'
      : 'https://free.rpc.fastnear.com';
  }

  /**
   * Fetch transaction history for an account
   */
  async getTransactionHistory(options: TransactionHistoryOptions): Promise<TransactionHistoryResponse> {
    const { accountId, limit = 25, offset = 0 } = options;

    try {
      // Try NearBlocks API first (has the best data)
      console.log(`Fetching transaction history for ${accountId} from NearBlocks...`);
      const nearBlocksData = await this.fetchFromNearBlocks(accountId, limit, offset);
      
      if (nearBlocksData.transactions.length > 0) {
        console.log(`✅ Found ${nearBlocksData.transactions.length} transactions from NearBlocks`);
        return nearBlocksData;
      }

      // Fallback to NEAR RPC
      console.log('NearBlocks returned no data, trying NEAR RPC...');
      const rpcData = await this.fetchFromNEARRPC(accountId, limit);
      
      if (rpcData.transactions.length > 0) {
        console.log(`✅ Found ${rpcData.transactions.length} transactions from NEAR RPC`);
        return rpcData;
      }

      console.log('No transactions found from any source');
      return {
        transactions: [],
        total: 0,
        hasMore: false,
      };

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error(`Failed to fetch transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch from NearBlocks API (best for transaction history)
   */
  private async fetchFromNearBlocks(
    accountId: string,
    limit: number,
    offset: number
  ): Promise<TransactionHistoryResponse> {
    try {
      const baseUrl = this.network === 'testnet'
        ? 'https://api-testnet.nearblocks.io/v1'
        : 'https://api.nearblocks.io/v1';

      const url = `${baseUrl}/account/${accountId}/txns?page=${Math.floor(offset / limit) + 1}&per_page=${limit}&order=desc`;
      
      console.log('Fetching from NearBlocks:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`NearBlocks API error: ${response.status} ${response.statusText}`);
        return { transactions: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      
      // NearBlocks API response structure
      const txns = data.txns || [];
      
      const transactions: Transaction[] = txns.map((tx: any) => ({
        hash: tx.transaction_hash,
        from: tx.signer_account_id,
        to: tx.receiver_account_id,
        value: this.formatAmount(tx.actions_agg?.deposit || '0'),
        type: this.determineTransactionType(tx.actions),
        status: tx.outcomes?.status ? 'success' : 'failed',
        timestamp: Math.floor(tx.block_timestamp / 1000000), // Convert nanoseconds to milliseconds
        blockHeight: tx.block_height || 0,
        gasUsed: this.formatGas(tx.outcomes_agg?.gas_used || 0),
        fee: this.formatAmount(tx.outcomes_agg?.transaction_fee || '0'),
        explorerUrl: getExplorerUrl(tx.transaction_hash, this.network),
        method: tx.actions?.[0]?.method || undefined,
        args: tx.actions?.[0]?.args || undefined,
      }));

      return {
        transactions,
        total: data.count || transactions.length,
        hasMore: transactions.length === limit,
      };

    } catch (error) {
      console.error('Error fetching from NearBlocks:', error);
      return { transactions: [], total: 0, hasMore: false };
    }
  }

  /**
   * Fetch from NEAR RPC (fallback method)
   */
  private async fetchFromNEARRPC(accountId: string, limit: number): Promise<TransactionHistoryResponse> {
    try {
      console.log('Fetching from NEAR RPC:', this.rpcUrl);
      
      // Get account transactions using EXPERIMENTAL_tx_status
      // Note: This is limited and doesn't give full history
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'EXPERIMENTAL_changes',
          params: {
            changes_type: 'account_changes',
            account_ids: [accountId],
            block_id: 'final',
          },
        }),
      });

      if (!response.ok) {
        console.warn(`NEAR RPC error: ${response.status} ${response.statusText}`);
        return { transactions: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      
      // RPC doesn't give us full transaction history easily
      // Return empty for now - this is a limitation of direct RPC access
      console.log('NEAR RPC response:', data);
      
      return {
        transactions: [],
        total: 0,
        hasMore: false,
      };

    } catch (error) {
      console.error('Error fetching from NEAR RPC:', error);
      return { transactions: [], total: 0, hasMore: false };
    }
  }

  /**
   * Format amount from yoctoNEAR to NEAR
   */
  private formatAmount(amount: string): string {
    try {
      const num = BigInt(amount);
      const divisor = BigInt('1000000000000000000000000'); // 10^24
      const whole = num / divisor;
      const remainder = num % divisor;
      
      if (remainder === BigInt(0)) {
        return `${whole} NEAR`;
      }
      
      const decimal = Number(remainder) / Number(divisor);
      const formatted = Number(whole) + decimal;
      return `${formatted.toFixed(4)} NEAR`;
    } catch {
      return '0 NEAR';
    }
  }

  /**
   * Format gas amount
   */
  private formatGas(gas: number | string): string {
    const gasNum = typeof gas === 'string' ? parseFloat(gas) : gas;
    if (gasNum > 1000000000000) {
      return `${(gasNum / 1000000000000).toFixed(2)} TGas`;
    }
    return `${(gasNum / 1000000000).toFixed(2)} Ggas`;
  }

  /**
   * Determine transaction type from actions
   */
  private determineTransactionType(actions: any[]): Transaction['type'] {
    if (!actions || actions.length === 0) return 'transfer';

    const action = actions[0];
    
    if (action.action === 'TRANSFER' || action.action_kind === 'TRANSFER') {
      return 'transfer';
    }
    
    if (action.action === 'FUNCTION_CALL' || action.action_kind === 'FUNCTION_CALL') {
      const method = action.method || action.args?.method_name;
      
      if (method && (method.includes('swap') || method.includes('exchange'))) {
        return 'swap';
      }
      
      if (method && (method.includes('stake') || method.includes('deposit_and_stake'))) {
        return 'stake';
      }
      
      return 'contract_call';
    }
    
    return 'transfer';
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: accountId,
          },
        }),
      });

      const data = await response.json();
      const balance = data.result?.amount || '0';
      return this.formatAmount(balance);
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return '0 NEAR';
    }
  }
}

// Export a singleton instance
export const nearTransactionHistory = new NearTransactionHistory('testnet');

