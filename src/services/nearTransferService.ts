/**
 * NEAR Transfer Service
 * 
 * This service handles REAL token transfers on NEAR blockchain
 */

import { utils } from 'near-api-js';
import type { Account } from 'near-api-js';

/**
 * Send NEAR tokens to another account (REAL blockchain transaction)
 * @param account - Sender's NEAR account
 * @param recipientId - Recipient's account ID
 * @param amount - Amount in NEAR (e.g., "1.5")
 * @param memo - Optional memo
 * @returns Transaction result
 */
export async function sendNEAR(
  account: Account,
  recipientId: string,
  amount: string,
  memo?: string
): Promise<any> {
  try {
    console.log(`💸 Sending ${amount} NEAR to ${recipientId}...`);
    
    // Convert NEAR amount to yoctoNEAR (smallest unit)
    const amountInYocto = utils.format.parseNearAmount(amount);
    
    if (!amountInYocto) {
      throw new Error('Invalid amount');
    }

    // THIS SENDS THE REAL TRANSACTION TO BLOCKCHAIN!
    const result = await account.sendMoney(
      recipientId,
      amountInYocto
    );

    console.log('✅ Transfer successful!', result);
    return result;
  } catch (error) {
    console.error('❌ Transfer failed:', error);
    throw error;
  }
}

/**
 * Get real transaction history for an account
 * @param accountId - Account to fetch history for
 * @param limit - Number of transactions to fetch
 * @returns Array of transactions
 */
export async function getTransactionHistory(
  accountId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    console.log(`📊 Fetching transaction history for ${accountId}...`);
    
    // Fetch from NEAR RPC via NearBlocks API
    const response = await fetch(
      `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns?page=1&per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch from NearBlocks, using fallback');
      return [];
    }

    const data = await response.json();
    console.log('✅ Fetched transaction history:', data);
    
    // Parse and return transactions
    if (data.txns && Array.isArray(data.txns)) {
      return data.txns.map((tx: any) => ({
        hash: tx.transaction_hash,
        from: tx.signer_account_id,
        to: tx.receiver_account_id,
        amount: tx.actions?.[0]?.args?.deposit || '0',
        timestamp: new Date(tx.block_timestamp / 1000000).getTime(), // Convert from nanoseconds
        status: tx.outcomes?.status ? 'success' : 'failed',
        type: tx.actions?.[0]?.action || 'Transfer',
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    return [];
  }
}

/**
 * Format amount from yoctoNEAR to NEAR
 * @param yoctoAmount - Amount in yoctoNEAR
 * @returns Formatted NEAR amount
 */
export function formatNearAmount(yoctoAmount: string): string {
  try {
    const formatted = utils.format.formatNearAmount(yoctoAmount);
    return parseFloat(formatted).toFixed(4);
  } catch {
    return '0.0000';
  }
}

/**
 * Send fungible tokens (WNEAR, USDC, USDT)
 * @param account - Sender's account
 * @param tokenContractId - Token contract address
 * @param recipientId - Recipient's account ID
 * @param amount - Amount in token's smallest unit
 * @param memo - Optional memo
 * @returns Transaction result
 */
export async function sendFungibleToken(
  account: Account,
  tokenContractId: string,
  recipientId: string,
  amount: string,
  memo?: string
): Promise<any> {
  try {
    console.log(`💸 Sending fungible token to ${recipientId}...`);
    console.log(`   Contract: ${tokenContractId}`);
    console.log(`   Amount: ${amount}`);

    // Call the ft_transfer function on the token contract
    const result = await account.functionCall({
      contractId: tokenContractId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: recipientId,
        amount: amount,
        memo: memo || null,
      },
      gas: '30000000000000', // 30 TGas
      attachedDeposit: '1', // 1 yoctoNEAR for security
    });

    console.log('✅ Fungible token transfer successful!', result);
    return result;
  } catch (error) {
    console.error('❌ Fungible token transfer failed:', error);
    throw error;
  }
}

/**
 * Get token contract ID based on token symbol
 */
export function getTokenContractId(token: string): string {
  const contracts: Record<string, string> = {
    'WNEAR': 'wrap.testnet',
    'USDC': 'usdc.fakes.testnet', // Testnet USDC
    'USDT': 'usdt.fakes.testnet', // Testnet USDT
  };
  
  return contracts[token] || '';
}

