'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNearWallet } from '@/hooks/useNearWallet';
import { 
  sendNEAR, 
  sendFungibleToken, 
  getTransactionHistory, 
  formatNearAmount,
  getTokenContractId 
} from '@/services/nearTransferService';
import { 
  Send,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Coins,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface TransferTokensProps {
  className?: string;
}

interface Transfer {
  id: string;
  recipient: string;
  token: 'NEAR' | 'WNEAR' | 'USDC' | 'USDT';
  amount: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
}

export const TransferTokens: React.FC<TransferTokensProps> = ({ className }) => {
  const { account, isConnected, executeTransaction } = useNearWallet();
  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState<'NEAR' | 'WNEAR' | 'USDC' | 'USDT'>('NEAR');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const [tokenBalances, setTokenBalances] = useState({
    NEAR: '0.00',
    WNEAR: '0.00',
    USDC: '0.00',
    USDT: '0.00',
  });

  // Fetch real transaction history when account connects
  useEffect(() => {
    if (account && isConnected) {
      fetchTransactionHistory();
      fetchBalances();
    }
  }, [account, isConnected]);

  const fetchTransactionHistory = async () => {
    if (!account) {
      console.log('⚠️ No account connected, skipping history fetch');
      return;
    }
    
    setIsFetchingHistory(true);
    console.log('📊 Fetching transaction history for:', account.accountId);
    
    try {
      const history = await getTransactionHistory(account.accountId, 10);
      console.log('📥 Received history data:', history);
      
      if (!history || history.length === 0) {
        console.log('ℹ️ No transaction history found');
        setTransfers([]);
        return;
      }
      
      // Convert to our format
      const formattedTransfers: Transfer[] = history
        .filter((tx: any) => {
          // Filter for transfers FROM this account
          const isFromThisAccount = tx.from === account.accountId || tx.signer_account_id === account.accountId;
          console.log('Transaction:', tx.hash?.substring(0, 10), 'From:', tx.from, 'IsFromThisAccount:', isFromThisAccount);
          return isFromThisAccount;
        })
        .map((tx: any) => {
          const transfer = {
            id: tx.hash || Date.now().toString(),
            recipient: tx.to || tx.receiver_account_id || 'Unknown',
            token: 'NEAR',
            amount: tx.amount ? formatNearAmount(tx.amount) : '0.0000',
            timestamp: tx.timestamp || Date.now(),
            status: (tx.status === 'success' || tx.status === 'SuccessValue') ? 'success' as const : 'failed' as const,
            txHash: tx.hash || ''
          };
          console.log('Formatted transfer:', transfer);
          return transfer;
        });
      
      setTransfers(formattedTransfers);
      console.log(`✅ Loaded ${formattedTransfers.length} transactions`);
    } catch (error) {
      console.error('❌ Failed to fetch transaction history:', error);
      setTransfers([]);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const fetchBalances = async () => {
    if (!account) return;
    
    try {
      // Use the balance from the account object (already available)
      const nearBalance = account.balance || '0';
      
      // Get token balances from account.tokens array
      const updatedBalances = {
        NEAR: parseFloat(nearBalance).toFixed(2),
        WNEAR: '0.00',
        USDC: '0.00',
        USDT: '0.00',
      };
      
      // Update with actual token balances if available
      if (account.tokens && account.tokens.length > 0) {
        account.tokens.forEach(token => {
          if (token.token === 'wNEAR') {
            updatedBalances.WNEAR = token.balance;
          } else if (token.token === 'USDC') {
            updatedBalances.USDC = token.balance;
          } else if (token.token === 'USDT') {
            updatedBalances.USDT = token.balance;
          }
        });
      }
      
      setTokenBalances(updatedBalances);
      
      console.log('✅ Transfer page balances updated:', updatedBalances);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      // Fallback to showing the account balance from the hook
      if (account.balance) {
        setTokenBalances(prev => ({
          ...prev,
          NEAR: parseFloat(account.balance).toFixed(2),
        }));
      }
    }
  };

  const validateAddress = (address: string): boolean => {
    // Basic NEAR address validation
    if (!address) return false;
    
    // Check for .near or .testnet suffix
    const validSuffixes = ['.near', '.testnet'];
    const hasValidSuffix = validSuffixes.some(suffix => address.endsWith(suffix));
    
    // Or check if it's an implicit account (64 char hex)
    const isImplicitAccount = /^[a-f0-9]{64}$/.test(address);
    
    return hasValidSuffix || isImplicitAccount;
  };

  const handleTransfer = async () => {
    // Validation
    if (!recipient || !validateAddress(recipient)) {
      setError('Please enter a valid NEAR address (e.g., user.near or user.testnet)');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balance = parseFloat(tokenBalances[selectedToken].replace(/,/g, ''));
    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    if (recipient.toLowerCase() === account?.accountId.toLowerCase()) {
      setError('Cannot send to yourself');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('💸 Sending REAL transaction on blockchain...');
      console.log('📊 Details:', { from: account.accountId, to: recipient, token: selectedToken, amount });
      
      if (!account || !account.accountId) {
        throw new Error('Wallet not connected properly.');
      }
      
      let transaction;
      
      if (selectedToken === 'NEAR') {
        // REAL NEAR transfer using wallet selector
        console.log('🚀 Creating NEAR transfer transaction...');
        
        // Convert NEAR to yoctoNEAR properly (avoid scientific notation!)
        const amountNum = parseFloat(amount);
        const yoctoMultiplier = '1000000000000000000000000'; // 10^24
        const amountInYocto = Math.floor(amountNum * 1000000).toString() + '000000000000000000'; // Multiply by 10^24 without scientific notation
        
        console.log('Amount:', amount, 'NEAR');
        console.log('Amount in yoctoNEAR:', amountInYocto);
        
        // Correct transaction format for wallet selector
        transaction = {
          receiverId: recipient,
          actions: [{
            type: 'Transfer',
            params: {
              deposit: amountInYocto
            }
          }]
        };
        
      } else {
        // REAL fungible token transfer
        console.log('🚀 Creating fungible token transfer transaction...');
        const tokenContract = getTokenContractId(selectedToken);
        
        // Convert amount properly (avoid scientific notation!)
        const amountNum = parseFloat(amount);
        const amountInYocto = Math.floor(amountNum * 1000000).toString() + '000000000000000000';
        
        console.log('Amount:', amount, selectedToken);
        console.log('Amount in yocto:', amountInYocto);
        
        // Correct transaction format for wallet selector
        transaction = {
          receiverId: tokenContract,
          actions: [{
            type: 'FunctionCall',
            params: {
              methodName: 'ft_transfer',
              args: {
                receiver_id: recipient,
                amount: amountInYocto,
                memo: memo || null
              },
              gas: '30000000000000',
              deposit: '1' // 1 yoctoNEAR for security
            }
          }]
        };
      }
      
      console.log('📤 Sending transaction to blockchain...', transaction);
      
      // SEND THE REAL TRANSACTION!
      const result = await executeTransaction(transaction);
      
      console.log('✅ Transaction confirmed!', result);
      
      // Extract transaction hash from result
      const txHash = result?.transaction?.hash || 
                     result?.transaction_outcome?.id || 
                     result?.hash ||
                     'See wallet for details';
      
      setSuccessMessage(
        `✅ Successfully sent ${amount} ${selectedToken} to ${recipient}!\nTransaction: ${txHash.substring(0, 20)}...`
      );
      
      // Clear form
      setRecipient('');
      setAmount('');
      setMemo('');
      
      // Refresh data after transaction
      setTimeout(() => {
        fetchTransactionHistory();
        fetchBalances();
      }, 3000); // Wait 3 seconds for blockchain confirmation
      
    } catch (err) {
      console.error('❌ Transfer failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Connect Your Wallet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Connect your NEAR wallet to send tokens to other accounts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Balances Overview */}
      <Card className="border-2 border-purple-100 dark:border-purple-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Available Balances</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your token balances available for transfer
              </CardDescription>
            </div>
            <Coins className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tokenBalances).map(([token, balance]) => (
              <div key={token} className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">{token}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{balance}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-slate-900 dark:text-slate-100">Send Tokens</CardTitle>
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Transfer tokens to another NEAR account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipient */}
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Recipient Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="user.near or user.testnet"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                disabled={isLoading}
              />
            </div>
            {recipient && !validateAddress(recipient) && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Invalid NEAR address format
              </p>
            )}
          </div>

          {/* Token Selection */}
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Select Token
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['NEAR', 'WNEAR', 'USDC', 'USDT'] as const).map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedToken === token
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-lg font-medium"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {selectedToken}
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Available: {tokenBalances[selectedToken]} {selectedToken}
              </p>
              <button
                onClick={() => setAmount(tokenBalances[selectedToken].replace(/,/g, ''))}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Memo (Optional) */}
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Memo (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={isLoading}
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Send Button */}
          <Button 
            onClick={handleTransfer} 
            disabled={isLoading || !recipient || !amount || !validateAddress(recipient)}
            className="w-full py-3 text-base font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Send {selectedToken}
              </span>
            )}
          </Button>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-1">
                  How Token Transfers Work
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>NEAR tokens:</strong> Direct blockchain transfer (~1 second, ~$0.0001 fee)<br/>
                  <strong>Fungible tokens (WNEAR, USDC, USDT):</strong> Smart contract call to token contract
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card className="border-2 border-purple-100 dark:border-purple-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                Transfer History
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Tokens you sent to other accounts
              </CardDescription>
            </div>
            <a
              href={`https://testnet.nearblocks.io/address/${account?.accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Open in Explorer →
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {isFetchingHistory ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Loading from blockchain indexer...
              </p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="text-center space-y-4">
                <div className="text-4xl mb-2">📭</div>
                <div>
                  <p className="font-medium mb-2" style={{ color: '#0f172a' }}>
                    No transfer history loaded
                  </p>
                  <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                    API indexers may be rate limited or slow to index
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchTransactionHistory}
                    disabled={isFetchingHistory}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Loading Again
                  </Button>
                  
                  <span className="text-sm text-slate-400">or</span>
                  
                  <a
                    href={`https://testnet.nearblocks.io/address/${account?.accountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    View on Explorer →
                  </a>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                  💡 All your transfers are safely recorded on the blockchain
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transfer.status === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {transfer.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        To: {transfer.recipient || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatTimestamp(transfer.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {transfer.amount} {transfer.token}
                    </p>
                    {transfer.txHash && transfer.txHash !== 'unknown' && (
                      <a
                        href={`https://testnet.nearblocks.io/txns/${transfer.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 justify-end"
                      >
                        View TX
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

