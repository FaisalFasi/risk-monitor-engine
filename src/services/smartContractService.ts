/**
 * Smart Contract Service
 * 
 * This service provides functions to interact with NEAR smart contracts
 * including vault operations, token swaps, and more.
 */

import type { Account } from 'near-api-js';
import { Contract } from 'near-api-js';

// Contract addresses (testnet)
export const CONTRACTS = {
  VAULT: 'vault-contract.testnet',
  SIMPLE_VAULT: 'simple-vault-contract.testnet',
  OPPORTUNITY: 'opportunity-contract.testnet',
  REGISTRY: 'registry-contract.testnet',
} as const;

// Token types supported by the vault
export enum TokenType {
  WNEAR = 'WNEAR',
  USDC = 'USDC',
  USDT = 'USDT',
}

// Vault contract interface
export interface VaultContract {
  // View methods (read-only, no gas required)
  get_config: () => Promise<VaultConfig>;
  get_total_supply: () => Promise<string>;
  get_token_reserves: (args: { token_type: TokenType }) => Promise<string>;
  get_user_vault_shares: (args: { account_id: string; token_type: TokenType }) => Promise<string>;
  get_user_total_shares: (args: { account_id: string }) => Promise<string>;
  get_deposit_events: (args: { account_id: string; limit: number }) => Promise<DepositEvent[]>;
  get_withdraw_events: (args: { account_id: string; limit: number }) => Promise<WithdrawEvent[]>;

  // Change methods (require gas and transaction fees)
  deposit: (args: { token_type: TokenType; amount: string }) => Promise<string>;
  withdraw: (args: { token_type: TokenType; vault_shares_amount: string }) => Promise<string>;
}

// Contract data types
export interface VaultConfig {
  owner_id: string;
  wnear_contract: string;
  usdc_contract: string;
  usdt_contract: string;
  fee_percentage: number;
  is_paused: boolean;
}

export interface DepositEvent {
  account_id: string;
  token_type: TokenType;
  amount: string;
  vault_shares_minted: string;
  timestamp: string;
}

export interface WithdrawEvent {
  account_id: string;
  token_type: TokenType;
  amount: string;
  vault_shares_burned: string;
  timestamp: string;
}

/**
 * Initialize a vault contract instance
 * @param account - The user's NEAR account
 * @param contractId - The contract address
 * @returns Vault contract instance
 */
export function initVaultContract(account: Account, contractId: string = CONTRACTS.SIMPLE_VAULT): VaultContract {
  // Check if Contract is available (only in browser with wallet connected)
  if (typeof Contract !== 'undefined' && account) {
    try {
      // REAL IMPLEMENTATION - Connects to actual blockchain
      const contract = new Contract(
        account,
        contractId,
        {
          // View methods - read data (no gas cost)
          viewMethods: [
            'get_config',
            'get_total_supply', 
            'get_token_reserves',
            'get_user_vault_shares',
            'get_user_total_shares',
            'get_deposit_events',
            'get_withdraw_events',
          ],
          // Change methods - write data (costs gas, requires signing)
          changeMethods: [
            'deposit',    // ← This sends real messages to blockchain!
            'withdraw',   // ← This sends real messages to blockchain!
          ],
        }
      ) as VaultContract;
      
      console.log('✅ Real smart contract initialized:', contractId);
      return contract;
    } catch (error) {
      console.error('Failed to initialize real contract:', error);
      console.log('Falling back to mock implementation');
    }
  }
  
  // FALLBACK: Mock implementation for testing/demo
  console.log('⚠️ Using mock contract (not connected to blockchain)');
  const mockContract = {
    get_config: async () => {
      return {} as VaultConfig;
    },
    get_total_supply: async () => {
      return '0';
    },
    get_token_reserves: async (args: { token_type: TokenType }) => {
      return '0';
    },
    get_user_vault_shares: async (args: { account_id: string; token_type: TokenType }) => {
      return '0';
    },
    get_user_total_shares: async (args: { account_id: string }) => {
      return '0';
    },
    get_deposit_events: async (args: { account_id: string; limit: number }) => {
      return [] as DepositEvent[];
    },
    get_withdraw_events: async (args: { account_id: string; limit: number }) => {
      return [] as WithdrawEvent[];
    },
    deposit: async (args: { token_type: TokenType; amount: string }) => {
      console.log('📝 Mock deposit:', args);
      return args.amount;
    },
    withdraw: async (args: { token_type: TokenType; vault_shares_amount: string }) => {
      console.log('📝 Mock withdraw:', args);
      return args.vault_shares_amount;
    },
  } as VaultContract;

  return mockContract;
}

/**
 * Deposit tokens into the vault
 * @param contract - Vault contract instance
 * @param tokenType - Type of token to deposit
 * @param amount - Amount to deposit (in smallest unit)
 * @returns Transaction result
 * 
 * 🎯 THIS FUNCTION SENDS MESSAGES TO THE SMART CONTRACT!
 * When you call this function, it creates a transaction and sends it to the blockchain.
 * The user's wallet will popup asking for approval.
 */
export async function depositToVault(
  contract: VaultContract,
  tokenType: TokenType,
  amount: string
): Promise<string> {
  try {
    console.log(`💬 Sending message to smart contract:`);
    console.log(`   Function: deposit()`);
    console.log(`   Token: ${tokenType}`);
    console.log(`   Amount: ${amount}`);
    
    // ⭐ THIS LINE SENDS THE MESSAGE TO THE BLOCKCHAIN! ⭐
    // It will trigger a wallet popup for user approval
    const result = await contract.deposit({
      token_type: tokenType,
      amount,
    });

    console.log('✅ Message sent successfully! Transaction result:', result);
    return result;
  } catch (error) {
    console.error('❌ Message failed:', error);
    throw new Error(`Failed to deposit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Withdraw tokens from the vault
 * @param contract - Vault contract instance
 * @param tokenType - Type of token to withdraw
 * @param vaultSharesAmount - Amount of vault shares to burn
 * @returns Transaction result
 * 
 * 🎯 THIS FUNCTION SENDS MESSAGES TO THE SMART CONTRACT!
 * When you call this function, it creates a transaction and sends it to the blockchain.
 * The user's wallet will popup asking for approval.
 */
export async function withdrawFromVault(
  contract: VaultContract,
  tokenType: TokenType,
  vaultSharesAmount: string
): Promise<string> {
  try {
    console.log(`💬 Sending message to smart contract:`);
    console.log(`   Function: withdraw()`);
    console.log(`   Token: ${tokenType}`);
    console.log(`   Shares: ${vaultSharesAmount}`);
    
    // ⭐ THIS LINE SENDS THE MESSAGE TO THE BLOCKCHAIN! ⭐
    // It will trigger a wallet popup for user approval
    const result = await contract.withdraw({
      token_type: tokenType,
      vault_shares_amount: vaultSharesAmount,
    });

    console.log('✅ Message sent successfully! Transaction result:', result);
    return result;
  } catch (error) {
    console.error('❌ Message failed:', error);
    throw new Error(`Failed to withdraw: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's vault shares
 * @param contract - Vault contract instance
 * @param accountId - User's account ID
 * @param tokenType - Type of token
 * @returns Vault shares amount
 */
export async function getUserVaultShares(
  contract: VaultContract,
  accountId: string,
  tokenType: TokenType
): Promise<string> {
  try {
    const shares = await contract.get_user_vault_shares({
      account_id: accountId,
      token_type: tokenType,
    });

    return shares;
  } catch (error) {
    console.error('Failed to get vault shares:', error);
    return '0';
  }
}

/**
 * Get user's total vault shares across all tokens
 * @param contract - Vault contract instance
 * @param accountId - User's account ID
 * @returns Total vault shares
 */
export async function getUserTotalShares(
  contract: VaultContract,
  accountId: string
): Promise<string> {
  try {
    const totalShares = await contract.get_user_total_shares({
      account_id: accountId,
    });

    return totalShares;
  } catch (error) {
    console.error('Failed to get total vault shares:', error);
    return '0';
  }
}

/**
 * Get vault configuration
 * @param contract - Vault contract instance
 * @returns Vault configuration
 */
export async function getVaultConfig(contract: VaultContract): Promise<VaultConfig | null> {
  try {
    const config = await contract.get_config();
    return config;
  } catch (error) {
    console.error('Failed to get vault config:', error);
    return null;
  }
}

/**
 * Get user's deposit history
 * @param contract - Vault contract instance
 * @param accountId - User's account ID
 * @param limit - Number of events to fetch
 * @returns Array of deposit events
 */
export async function getDepositHistory(
  contract: VaultContract,
  accountId: string,
  limit: number = 10
): Promise<DepositEvent[]> {
  try {
    const events = await contract.get_deposit_events({
      account_id: accountId,
      limit,
    });

    return events;
  } catch (error) {
    console.error('Failed to get deposit history:', error);
    return [];
  }
}

/**
 * Get user's withdrawal history
 * @param contract - Vault contract instance
 * @param accountId - User's account ID
 * @param limit - Number of events to fetch
 * @returns Array of withdrawal events
 */
export async function getWithdrawHistory(
  contract: VaultContract,
  accountId: string,
  limit: number = 10
): Promise<WithdrawEvent[]> {
  try {
    const events = await contract.get_withdraw_events({
      account_id: accountId,
      limit,
    });

    return events;
  } catch (error) {
    console.error('Failed to get withdrawal history:', error);
    return [];
  }
}

/**
 * Get token reserves in the vault
 * @param contract - Vault contract instance
 * @param tokenType - Type of token
 * @returns Reserve amount
 */
export async function getTokenReserves(
  contract: VaultContract,
  tokenType: TokenType
): Promise<string> {
  try {
    const reserves = await contract.get_token_reserves({
      token_type: tokenType,
    });

    return reserves;
  } catch (error) {
    console.error('Failed to get token reserves:', error);
    return '0';
  }
}

/**
 * Format token amount for display
 * @param amount - Amount in smallest unit (yocto)
 * @param decimals - Number of decimals (default 24 for NEAR)
 * @returns Formatted amount
 */
export function formatTokenAmount(amount: string, decimals: number = 24): string {
  const num = parseFloat(amount) / Math.pow(10, decimals);
  return num.toFixed(4);
}

/**
 * Parse token amount from user input
 * @param amount - Human-readable amount
 * @param decimals - Number of decimals (default 24 for NEAR)
 * @returns Amount in smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number = 24): string {
  const num = parseFloat(amount) * Math.pow(10, decimals);
  return Math.floor(num).toString();
}

/**
 * Format timestamp for display
 * @param timestamp - Unix timestamp in nanoseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
  return date.toLocaleString();
}

