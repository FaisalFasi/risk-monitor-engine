'use client';

import { useNearWallet } from '@/hooks/useNearWallet';
import { useState, useEffect } from 'react';

interface NearLoginButtonProps {
  className?: string;
  onLoginSuccess?: (accountId: string) => void;
}

export function NearLoginButton({ className = '', onLoginSuccess }: NearLoginButtonProps) {
  const { 
    account, 
    isLoading, 
    error, 
    isConnected, 
    connect, 
    disconnect, 
    signIn, 
    signOut,
    signMessage 
  } = useNearWallet();
  
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    await connect();
  };

  const handleSignIn = async () => {
    await signIn();
  };

  // Call onLoginSuccess when account changes
  useEffect(() => {
    if (account && onLoginSuccess) {
      onLoginSuccess(account.accountId);
    }
  }, [account, onLoginSuccess]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  if (isLoading) {
    return (
      <button 
        className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        disabled
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      </button>
    );
  }

  if (error) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-3">
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={handleConnect}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={className}>
        {/* Testnet Token Notice */}
        <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Need Testnet Tokens?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Get free NEAR tokens at{' '}
                <a 
                  href="https://near-faucet.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-100"
                >
                  near-faucet.io
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleConnect}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>Login with NEAR</span>
          </div>
        </button>
      </div>
    );
  }

  if (account && !account.isSignedIn) {
    return (
      <button 
        onClick={handleSignIn}
        className={`px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Sign In to {account.accountId}</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>{account?.accountId}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Account</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{account?.accountId}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Balance</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{account?.balance} NEAR</p>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
              
              <button 
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
