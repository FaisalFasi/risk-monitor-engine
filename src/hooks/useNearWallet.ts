'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createWalletSelector, createWalletSelectorModal } from '@/lib/wallet-selector-config';

export interface NearAccount {
  accountId: string;
  balance: string;
  isSignedIn: boolean;
  tokens?: Array<{token: string, balance: string, contract: string}>;
}

export interface NearWalletState {
  account: NearAccount | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  selector: any;
  modal: any;
}

export interface NearWalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  executeTransaction: (transaction: any) => Promise<any>;
  refreshBalance: () => Promise<void>;
}

export function useNearWallet(): NearWalletState & NearWalletActions {
  const [account, setAccount] = useState<NearAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selector, setSelector] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);
  
  const selectorRef = useRef<any>(null);
  const modalRef = useRef<any>(null);

  // Initialize wallet selector on component mount
  useEffect(() => {
    initializeWalletSelector();
  }, []);

  const initializeWalletSelector = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing NEAR Wallet Selector...');
      
      // Create wallet selector
      const walletSelector = await createWalletSelector();
      console.log('Wallet selector created with network:', walletSelector.options?.network);
      selectorRef.current = walletSelector;
      setSelector(walletSelector);
      
      // Create modal
      const walletModal = await createWalletSelectorModal(walletSelector);
      console.log('Wallet modal created');
      modalRef.current = walletModal;
      setModal(walletModal);
      
      // Check if already signed in
      const signedInAccount = walletSelector.store.getState().accounts[0];
      if (signedInAccount) {
        console.log('Found signed in account:', signedInAccount);
        await handleAccountChange(signedInAccount);
      }
      
      // Listen for account changes
      const subscription = walletSelector.store.observable
        .subscribe((state: any) => {
          const accounts = state.accounts;
          if (accounts.length > 0) {
            handleAccountChange(accounts[0]);
          } else {
            handleAccountChange(null);
          }
        });
      
      console.log('Wallet selector initialized successfully');
      
    } catch (err) {
      console.error('Error initializing wallet selector:', err);
      setError(`Failed to initialize wallet connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAccountChange = useCallback(async (account: any) => {
    if (!account || !account.accountId) {
      console.log('No account or invalid account object:', account);
      setAccount(null);
      setIsConnected(false);
      return;
    }

    try {
      console.log('Handling account change for:', account.accountId);
      
      // Validate account object
      if (typeof account.accountId !== 'string' || !account.accountId) {
        throw new Error('Invalid account ID');
      }
      
      console.log('Fetching real blockchain data for:', account.accountId);
      
      // Get account balance and tokens
      const [balance, tokens] = await Promise.all([
        getAccountBalance(account.accountId),
        getAccountTokens(account.accountId)
      ]);
      
      console.log('Real balance:', balance, 'Tokens:', tokens);
      
      const nearAccount: NearAccount = {
        accountId: account.accountId,
        balance: balance || '0',
        isSignedIn: true,
        tokens: tokens || [],
      };
      
      setAccount(nearAccount);
      setIsConnected(true);
      setError(null);
      
      // Store in localStorage for persistence
      localStorage.setItem('near-wallet-account', JSON.stringify(nearAccount));
      
    } catch (err) {
      console.error('Error handling account change:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('signer')) {
        setError('Wallet signer error. Please refresh the page and try reconnecting.');
      } else {
        setError('Failed to load account information. Please try reconnecting.');
      }
    }
  }, []);

  const getAccountBalance = async (accountId: string): Promise<string> => {
    try {
      // Use alternative RPC endpoints with CORS support
      const rpcEndpoints = [
        'https://test.rpc.fastnear.com',
        'https://rpc.testnet.near.org',
      ];
      
      for (const nodeUrl of rpcEndpoints) {
        try {
          console.log('Fetching balance from:', nodeUrl);
          
          const response = await fetch(nodeUrl, {
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
          
          if (!response.ok) {
            console.log(`RPC ${nodeUrl} failed with status ${response.status}, trying next...`);
            continue;
          }
          
          const data = await response.json();
          const balance = data.result?.amount || '0';
          const balanceFormatted = (parseFloat(balance) / 1e24).toFixed(4);
          console.log(`✅ Balance fetched from ${nodeUrl}:`, balanceFormatted, 'NEAR');
          return balanceFormatted;
        } catch (err) {
          console.log(`RPC ${nodeUrl} failed, trying next...`);
          continue;
        }
      }
      
      console.error('All RPC endpoints failed');
      return '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const getAccountTokens = async (accountId: string): Promise<Array<{token: string, balance: string, contract: string}>> => {
    try {
      // Use alternative RPC endpoints with better CORS support
      const rpcEndpoints = [
        'https://test.rpc.fastnear.com',
        'https://rpc.testnet.near.org',
      ];
      
      // Common token contracts on NEAR testnet
      const tokenContracts = [
        { token: 'wNEAR', contract: 'wrap.testnet', decimals: 24 },
        { token: 'USDC', contract: 'usdc.fakes.testnet', decimals: 6 },
        { token: 'USDT', contract: 'usdt.fakes.testnet', decimals: 6 },
        { token: 'DAI', contract: 'dai.fakes.testnet', decimals: 18 },
      ];
      
      console.log('🔍 Fetching balances for tokens:', tokenContracts.map(t => t.token).join(', '));

      const tokenBalances = [];
      
      for (const tokenInfo of tokenContracts) {
        let tokenFetched = false;
        
        // Try each RPC endpoint
        for (const nodeUrl of rpcEndpoints) {
          if (tokenFetched) break;
          
          try {
            console.log(`Trying to fetch ${tokenInfo.token} from ${nodeUrl}...`);
            
            const response = await fetch(nodeUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'dontcare',
                method: 'query',
                params: {
                  request_type: 'call_function',
                  finality: 'final',
                  account_id: tokenInfo.contract,
                  method_name: 'ft_balance_of',
                  args_base64: Buffer.from(JSON.stringify({ account_id: accountId })).toString('base64'),
                },
              }),
            });
            
            if (!response.ok) {
              console.log(`HTTP error for ${tokenInfo.token} on ${nodeUrl}! status: ${response.status}`);
              continue;
            }
            
            const data = await response.json();
            if (data.result?.result) {
              const balanceRaw = JSON.parse(Buffer.from(data.result.result, 'base64').toString());
              console.log(`✅ ${tokenInfo.token} raw balance:`, balanceRaw);
              
              // Convert from smallest unit to human-readable using token decimals
              const decimals = tokenInfo.decimals;
              const displayDecimals = decimals === 24 ? 4 : decimals === 18 ? 4 : 2;
              const balanceFormatted = (parseFloat(balanceRaw) / Math.pow(10, decimals)).toFixed(displayDecimals);
              
              if (balanceRaw && balanceRaw !== '0') {
                console.log(`✅ ${tokenInfo.token} formatted balance:`, balanceFormatted);
                tokenBalances.push({
                  token: tokenInfo.token,
                  balance: balanceFormatted,
                  contract: tokenInfo.contract,
                });
                tokenFetched = true;
              }
            }
          } catch (tokenError) {
            console.log(`Failed to fetch ${tokenInfo.token} from ${nodeUrl}:`, tokenError);
          }
        }
        
        if (!tokenFetched) {
          console.log(`⚠️ Could not fetch ${tokenInfo.token} from any RPC endpoint`);
        }
      }
      
      console.log(`📊 Total tokens fetched: ${tokenBalances.length}`, tokenBalances.map(t => t.token).join(', '));
      return tokenBalances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  };

  const connect = useCallback(async () => {
    const modal = modalRef.current;
    if (!modal) {
      setError('Wallet selector not initialized. Please refresh the page.');
      console.error('Modal not available:', modalRef.current);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Opening wallet selector modal...');
      // Show wallet selector modal
      modal.show();
      console.log('Wallet selector modal opened');
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      
      console.error('Wallet connection error details:', err);
      
      // Check for specific error types
      if (errorMessage.includes('signer')) {
        errorMessage = 'Wallet initialization error. Please try: 1) Refresh the page, 2) Clear browser cache, 3) Use a different browser';
        console.error('Signer error - wallet not properly initialized:', err);
      } else if (errorMessage.includes('does not have enough balance') || errorMessage.includes('balance 0')) {
        errorMessage = 'Insufficient testnet NEAR balance. Get free testnet tokens at: https://near-faucet.io/';
        console.error('Insufficient balance error:', err);
      } else {
        console.error('Generic wallet connection error:', err);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const selector = selectorRef.current;
    if (!selector) return;

    setIsLoading(true);
    
    try {
      // Sign out from wallet
      const wallet = await selector.wallet();
      await wallet.signOut();
      
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    // With real wallet selector, sign in happens automatically when connecting
    // This method is kept for compatibility but doesn't need to do anything
    console.log('Sign in is handled automatically by wallet selector');
  }, []);

  const signOut = useCallback(async () => {
    const selector = selectorRef.current;
    if (!selector) {
      console.log('Selector not available for signOut');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Signing out from wallet...');
      const wallet = await selector.wallet();
      await wallet.signOut();
      
      // Clear all state
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
      
      console.log('Signed out successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Sign out error:', err);
      
      // Even if there's an error, clear local state
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    const selector = selectorRef.current;
    if (!selector) {
      setError('Wallet selector not initialized');
      return null;
    }

    try {
      const wallet = await selector.wallet();
      const signature = await wallet.signMessage({
        message,
        recipient: account?.accountId || '',
      });
      
      return signature.signature;
    } catch (err) {
      console.error('Error signing message:', err);
      setError('Failed to sign message');
      return null;
    }
  }, [account]);

  const executeTransaction = useCallback(async (transaction: any): Promise<any> => {
    const selector = selectorRef.current;
    if (!selector) {
      console.error('Wallet selector not initialized');
      throw new Error('Wallet selector not initialized');
    }

    if (!account) {
      console.error('No account connected');
      throw new Error('Please connect your wallet first');
    }

    try {
      const wallet = await selector.wallet();
      
      // Check if this is a batch of transactions (array) or single transaction
      if (Array.isArray(transaction)) {
        console.log(`Executing ${transaction.length} transactions in batch`);
        
        // For batch transactions, use signAndSendTransactions (plural)
        const result = await wallet.signAndSendTransactions({ transactions: transaction });
        
        console.log('Batch transaction result:', result);
        return result;
      } else {
        console.log('Executing single transaction:', transaction);
        
        // For single transaction, use signAndSendTransaction (singular)
        const result = await wallet.signAndSendTransaction(transaction);
        
        console.log('Transaction result:', result);
        return result;
      }
      
    } catch (err) {
      console.error('Error executing transaction:', err);
      
      // Provide helpful error message for insufficient balance
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('does not have enough balance') || errorMessage.includes('balance 0')) {
        throw new Error('Insufficient testnet NEAR balance. Get free tokens at: https://near-faucet.io/');
      }
      
      throw err;
    }
  }, [account]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    // Get current account from state
    const currentAccount = selectorRef.current?.store?.getState()?.accounts[0];
    
    if (!currentAccount || !currentAccount.accountId) {
      console.log('⚠️ No account connected, cannot refresh balance');
      return;
    }

    try {
      console.log('🔄 Refreshing balance for:', currentAccount.accountId);
      
      // Get fresh balance from blockchain
      const [newBalance, tokens] = await Promise.all([
        getAccountBalance(currentAccount.accountId),
        getAccountTokens(currentAccount.accountId)
      ]);
      
      console.log('✅ Updated balance from blockchain:', newBalance, 'NEAR');
      console.log('✅ Updated tokens:', tokens);
      
      // Update account state with fresh data
      setAccount(prev => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          balance: newBalance,
          tokens: tokens || prev.tokens,
        };
        
        console.log('📊 Account state updated:', updated);
        
        // Also update localStorage
        localStorage.setItem('near-wallet-account', JSON.stringify(updated));
        
        return updated;
      });
      
    } catch (err) {
      console.error('❌ Error refreshing balance:', err);
      // Don't throw - just log the error
    }
  }, []); // No dependencies to avoid stale closure

  return {
    account,
    isLoading,
    error,
    isConnected,
    selector,
    modal,
    connect,
    disconnect,
    signIn,
    signOut,
    signMessage,
    executeTransaction,
    refreshBalance,
  };
}
