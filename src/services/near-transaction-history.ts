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
 * 1. Pikespeak API (primary - free indexer with good rate limits)
 * 2. NearBlocks API (fallback)
 * 3. NEAR RPC (last resort)
 */
export class NearTransactionHistory {
  private network: 'testnet' | 'mainnet';
  private rpcUrl: string;
  private pagodaApiUrl: string;
  private cache: Map<string, { data: TransactionHistoryResponse; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache to reduce API calls
  private rateLimitUntil: number = 0; // Timestamp when rate limit will be lifted
  private readonly RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.rpcUrl = network === 'testnet' 
      ? 'https://test.rpc.fastnear.com'
      : 'https://free.rpc.fastnear.com';
    
    // Pikespeak API - Free NEAR indexer with good rate limits
    this.pagodaApiUrl = network === 'testnet'
      ? 'https://testnet-api.pikespeak.ai'
      : 'https://api.pikespeak.ai';
    
    this.cache = new Map();
    
    // Check if there's a saved rate limit in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nearblocks_rate_limit');
      if (saved) {
        const savedTime = parseInt(saved, 10);
        if (savedTime > Date.now()) {
          // Only set rate limit if it's less than 5 minutes old
          // This allows new Pagoda API to work even if NearBlocks is limited
          const ageMinutes = (Date.now() - (savedTime - this.RATE_LIMIT_DURATION)) / 60000;
          if (ageMinutes < 5) {
            console.log('⚠️ Recent rate limit detected, but trying Pagoda API first...');
          } else {
            this.rateLimitUntil = savedTime;
            console.log('⚠️ Rate limit active until:', new Date(savedTime).toLocaleTimeString());
          }
        }
      }
    }
  }

  /**
   * Fetch transaction history for an account
   */
  async getTransactionHistory(options: TransactionHistoryOptions): Promise<TransactionHistoryResponse> {
    const { accountId, limit = 25, offset = 0 } = options;

    // Check cache first
    const cacheKey = `${accountId}-${limit}-${offset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`✅ Using cached data for ${accountId}`);
      return cached.data;
    }

    // Check if we're still rate limited (but allow Pagoda to try anyway)
    const isRateLimited = Date.now() < this.rateLimitUntil;
    if (isRateLimited) {
      const minutesLeft = Math.ceil((this.rateLimitUntil - Date.now()) / 60000);
      console.log(`⏰ NearBlocks rate limited for ${minutesLeft} more minutes, but trying Pagoda API...`);
    }

    try {
      // Try Pikespeak API first (better rate limits, free tier)
      console.log(`🚀 Fetching transaction history for ${accountId} from Pikespeak API...`);
      const pikespeakData = await this.fetchFromPagoda(accountId, limit, offset);
      
      if (pikespeakData.transactions.length > 0) {
        console.log(`✅ Found ${pikespeakData.transactions.length} transactions from Pikespeak`);
        // Cache the result
        this.cache.set(cacheKey, { data: pikespeakData, timestamp: Date.now() });
        return pikespeakData;
      }

      // Fallback to NearBlocks API (skip if rate limited)
      if (!isRateLimited) {
        console.log('⚠️ Pikespeak returned no data, trying NearBlocks...');
        const nearBlocksData = await this.fetchFromNearBlocks(accountId, limit, offset);
        
        if (nearBlocksData.transactions.length > 0) {
          console.log(`✅ Found ${nearBlocksData.transactions.length} transactions from NearBlocks`);
          // Cache the result
          this.cache.set(cacheKey, { data: nearBlocksData, timestamp: Date.now() });
          return nearBlocksData;
        }
      } else {
        console.log('⏸️ Skipping NearBlocks - still rate limited');
      }

      // Last resort: Show helpful message
      console.log('ℹ️ No transaction data available from indexers');
      const rpcData = await this.fetchFromNEARRPC(accountId, limit);
      
      if (rpcData.transactions.length > 0) {
        console.log(`✅ Found ${rpcData.transactions.length} transactions from NEAR RPC`);
        // Cache the result
        this.cache.set(cacheKey, { data: rpcData, timestamp: Date.now() });
        return rpcData;
      }

      console.log('ℹ️ No transactions found from any source');
      const emptyResult = {
        transactions: [],
        total: 0,
        hasMore: false,
      };
      // Cache empty result too to prevent repeated failed calls
      this.cache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
      return emptyResult;

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error(`Failed to fetch transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch from Pikespeak API (PRIMARY - free indexer with good rate limits)
   * Falls back gracefully if not available
   */
  private async fetchFromPagoda(
    accountId: string,
    limit: number,
    offset: number
  ): Promise<TransactionHistoryResponse> {
    try {
      // Validate accountId
      if (!accountId || accountId === 'undefined' || accountId === 'null') {
        console.error('❌ Invalid accountId for Pikespeak:', accountId);
        return { transactions: [], total: 0, hasMore: false };
      }

      // Pikespeak API endpoint - using account/txns endpoint
      const page = Math.floor(offset / limit) + 1;
      const url = `${this.pagodaApiUrl}/account/txns/${accountId}?page=${page}&per_page=${limit}`;
      
      console.log('📡 Fetching from Pikespeak:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.warn(`Pikespeak API returned: ${response.status} ${response.statusText}`);
        return { transactions: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      
      console.log('🔍 Raw Pikespeak data:', data?.txns?.length || 0, 'transactions');
      
      // Pikespeak uses 'txns' array
      const txnsArray = data?.txns || data?.transactions || [];
      
      if (!Array.isArray(txnsArray) || txnsArray.length === 0) {
        console.log('ℹ️ No transaction data from Pikespeak');
        return { transactions: [], total: 0, hasMore: false };
      }

      // Parse Pikespeak transaction format (similar to NearBlocks)
      const transactions: Transaction[] = txnsArray.map((tx: any) => {
        const status: 'success' | 'failed' | 'pending' = 
          tx.outcomes?.status === true || tx.status === 'SUCCESS_VALUE' || tx.status === 'success' ? 'success' : 
          tx.outcomes?.status === false || tx.status === 'FAILURE' || tx.status === 'failed' ? 'failed' : 'pending';

        return {
          hash: tx.transaction_hash || tx.hash,
          from: tx.signer_account_id || tx.signer_id || 'Unknown',
          to: tx.receiver_account_id || tx.receiver_id || 'Unknown',
          value: this.formatAmount(tx.actions_agg?.deposit || tx.deposit || '0'),
          type: this.determineTransactionType(tx.actions || []),
          status,
          timestamp: Math.floor((tx.block_timestamp || Date.now()) / 1000000),
          blockHeight: tx.block_height || 0,
          gasUsed: this.formatGas(tx.outcomes_agg?.gas_used || 0),
          fee: this.formatAmount(tx.outcomes_agg?.transaction_fee || '0'),
          explorerUrl: getExplorerUrl(tx.transaction_hash || tx.hash, this.network),
          method: tx.actions?.[0]?.method || undefined,
          args: tx.actions?.[0]?.args || undefined,
        };
      });

      console.log('✅ Parsed', transactions.length, 'transactions from Pikespeak');

      return {
        transactions,
        total: data.count || transactions.length,
        hasMore: txnsArray.length === limit,
      };

    } catch (error: any) {
      // Don't log fetch errors as errors - they're expected if service is down
      if (error.name === 'AbortError') {
        console.log('⏱️ Pikespeak request timed out, using fallback...');
      } else {
        console.log('ℹ️ Pikespeak API not available, using fallback...');
      }
      return { transactions: [], total: 0, hasMore: false };
    }
  }

  /**
   * Fetch from NearBlocks API (FALLBACK)
   */
  private async fetchFromNearBlocks(
    accountId: string,
    limit: number,
    offset: number
  ): Promise<TransactionHistoryResponse> {
    try {
      // CHECK RATE LIMIT BEFORE MAKING ANY REQUEST
      if (Date.now() < this.rateLimitUntil) {
        const minutesLeft = Math.ceil((this.rateLimitUntil - Date.now()) / 60000);
        console.log('🛑 BLOCKED: Rate limit active -', minutesLeft, 'minutes left');
        throw new Error(`Rate limited. Please wait ${minutesLeft} more minute(s) before refreshing.`);
      }

      // Validate accountId
      if (!accountId || accountId === 'undefined' || accountId === 'null') {
        console.error('❌ Invalid accountId for NearBlocks:', accountId);
        return { transactions: [], total: 0, hasMore: false };
      }

      const baseUrl = this.network === 'testnet'
        ? 'https://api-testnet.nearblocks.io/v1'
        : 'https://api.nearblocks.io/v1';

      const url = `${baseUrl}/account/${accountId}/txns?page=${Math.floor(offset / limit) + 1}&per_page=${limit}&order=desc`;
      
      console.log('📡 Fetching from NearBlocks:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        // Set rate limit timestamp
        this.rateLimitUntil = Date.now() + this.RATE_LIMIT_DURATION;
        
        // Save to localStorage so it persists across page reloads
        if (typeof window !== 'undefined') {
          localStorage.setItem('nearblocks_rate_limit', this.rateLimitUntil.toString());
        }
        
        console.error('⚠️ NearBlocks API rate limit (429). Please wait 15 minutes before retrying.');
        console.log('⏰ Rate limit will reset at:', new Date(this.rateLimitUntil).toLocaleTimeString());
        throw new Error('Rate limit exceeded. Please wait 15 minutes and try again.');
      }

      if (!response.ok) {
        console.warn(`NearBlocks API error: ${response.status} ${response.statusText}`);
        return { transactions: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      
      // NearBlocks API response structure
      const txns = data.txns || [];
      
      console.log('🔍 Raw NearBlocks data sample:', txns[0]); // Debug first transaction
      
      const transactions: Transaction[] = txns.map((tx: any) => {
        // Parse the transaction data carefully
        const from = tx.signer_account_id || tx.predecessor_account_id || tx.sender || 'Unknown';
        const to = tx.receiver_account_id || tx.receiver || 'Unknown';
        
        // Get deposit amount from actions
        let depositAmount = '0';
        if (tx.actions && Array.isArray(tx.actions)) {
          const transferAction = tx.actions.find((a: any) => 
            a.action === 'TRANSFER' || a.action_kind === 'TRANSFER'
          );
          if (transferAction) {
            depositAmount = transferAction.args?.deposit || 
                          transferAction.deposit || 
                          tx.actions_agg?.deposit || '0';
          }
        } else if (tx.actions_agg?.deposit) {
          depositAmount = tx.actions_agg.deposit;
        }
        
        // Determine status
        let status: 'success' | 'failed' | 'pending' = 'pending';
        if (tx.outcomes?.status === true || tx.outcomes_agg?.status === 'SUCCESS_VALUE' || tx.status === 'success') {
          status = 'success';
        } else if (tx.outcomes?.status === false || tx.outcomes_agg?.status === 'FAILURE' || tx.status === 'failed') {
          status = 'failed';
        }
        
        return {
          hash: tx.transaction_hash || tx.hash,
          from,
          to,
          value: this.formatAmount(depositAmount),
          type: this.determineTransactionType(tx.actions),
          status,
          timestamp: Math.floor(tx.block_timestamp / 1000000), // Convert nanoseconds to milliseconds
          blockHeight: tx.block_height || 0,
          gasUsed: this.formatGas(tx.outcomes_agg?.gas_used || 0),
          fee: this.formatAmount(tx.outcomes_agg?.transaction_fee || '0'),
          explorerUrl: getExplorerUrl(tx.transaction_hash, this.network),
          method: tx.actions?.[0]?.method || undefined,
          args: tx.actions?.[0]?.args || undefined,
        };
      });
      
      console.log('✅ Parsed transactions sample:', transactions[0]); // Debug first parsed transaction

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
   * Fetch from NEAR RPC using account changes (WORKING FALLBACK)
   */
  private async fetchFromNEARRPC(accountId: string, limit: number): Promise<TransactionHistoryResponse> {
    // Validate accountId
    if (!accountId || accountId === 'undefined' || accountId === 'null') {
      console.error('❌ Invalid accountId for NEAR RPC:', accountId);
      return { transactions: [], total: 0, hasMore: false };
    }

    try {
      console.log('💡 Using NEAR RPC to fetch recent transactions...');
      
      // Get account's recent activity using experimental_tx_status
      // This is a workaround - fetch recent blocks and check for account activity
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'EXPERIMENTAL_changes',
          params: {
            changes_type: 'account_changes',
            account_ids: [accountId],
            block_id: 'optimistic',
          },
        }),
      });

      const data = await response.json();
      console.log('📊 RPC response:', data);
      
      // RPC method is limited, but we can at least show account is active
      // Return a helpful message transaction
      const helperTransaction: Transaction = {
        hash: 'rpc-fallback',
        from: accountId,
        to: 'Transaction History',
        value: '',
        type: 'contract_call',
        status: 'success',
        timestamp: Date.now(),
        blockHeight: 0,
        gasUsed: '',
        fee: '',
        explorerUrl: `https://testnet.nearblocks.io/address/${accountId}`,
        method: 'View Full History',
        args: undefined,
      };
      
      return {
        transactions: [helperTransaction],
        total: 1,
        hasMore: false,
      };

    } catch (error) {
      console.error('Error with NEAR RPC fallback:', error);
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
    
    // Check action type
    if (action.action === 'TRANSFER' || action.action_kind === 'TRANSFER') {
      return 'transfer';
    }
    
    if (action.action === 'FUNCTION_CALL' || action.action_kind === 'FUNCTION_CALL') {
      const method = action.method || action.args?.method_name || '';
      const receiverId = action.receiver_id || '';
      
      // Check if it's a swap (Ref Finance or other DEX)
      if (method.includes('swap') || 
          method.includes('exchange') || 
          method.includes('ft_transfer_call') ||
          receiverId.includes('ref-finance')) {
        return 'swap';
      }
      
      // Check if it's a stake operation
      if (method.includes('stake') || method.includes('deposit_and_stake')) {
        return 'stake';
      }
      
      // Check if it's a vault operation
      if (method.includes('deposit') || method.includes('withdraw')) {
        return 'contract_call';
      }
      
      return 'contract_call';
    }
    
    return 'transfer';
  }

  /**
   * Check if currently rate limited
   */
  isRateLimited(): { limited: boolean; minutesLeft: number; resetTime: Date | null } {
    const now = Date.now();
    if (now < this.rateLimitUntil) {
      const minutesLeft = Math.ceil((this.rateLimitUntil - now) / 60000);
      return {
        limited: true,
        minutesLeft,
        resetTime: new Date(this.rateLimitUntil)
      };
    }
    return { limited: false, minutesLeft: 0, resetTime: null };
  }

  /**
   * Clear rate limit (use after waiting or for testing)
   */
  clearRateLimit(): void {
    this.rateLimitUntil = 0;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nearblocks_rate_limit');
    }
    console.log('✅ Rate limit cleared');
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

