'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Token, NEAR_TOKENS } from '@/types/tokens';
import { Circle, RefreshCw, DollarSign, Coins, Gem, Bitcoin } from 'lucide-react';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  label?: string;
  disabled?: boolean;
  excludeTokens?: string[]; // Token IDs to exclude
  allowedTokens?: string[]; // If provided, only these token IDs are allowed
  compact?: boolean;
}

// Token Icon Component with fallback
function TokenIcon({ token, size = 'md' }: { token: Token; size?: 'sm' | 'md' | 'lg' }) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: { container: 'w-6 h-6', icon: 'w-6 h-6', badge: 'w-2 h-2', badgeIcon: 'w-1.5 h-1.5' },
    md: { container: 'w-8 h-8', icon: 'w-8 h-8', badge: 'w-3 h-3', badgeIcon: 'w-2 h-2' },
    lg: { container: 'w-12 h-12', icon: 'w-12 h-12', badge: 'w-4 h-4', badgeIcon: 'w-2.5 h-2.5' }
  };
  
  const sizes = sizeClasses[size];
  
  const getFallbackIcon = (icon: string) => {
    const iconProps = { className: sizes.icon, strokeWidth: 2 };
    switch(icon) {
      case 'near': return <Circle {...iconProps} className={`${sizes.icon} text-blue-500`} />;
      case 'wnear': return <RefreshCw {...iconProps} className={`${sizes.icon} text-purple-500`} />;
      case 'usdc': return <DollarSign {...iconProps} className={`${sizes.icon} text-blue-600`} />;
      case 'usdt': return <DollarSign {...iconProps} className={`${sizes.icon} text-green-600`} />;
      case 'dai': return <Coins {...iconProps} className={`${sizes.icon} text-yellow-500`} />;
      case 'weth': return <Gem {...iconProps} className={`${sizes.icon} text-indigo-500`} />;
      case 'wbtc': return <Bitcoin {...iconProps} className={`${sizes.icon} text-orange-500`} />;
      default: return <Coins {...iconProps} />;
    }
  };

  if (token.iconUrl && !imageError) {
    return (
      <div className={`relative ${sizes.container} flex-shrink-0`}>
        <Image
          src={token.iconUrl}
          alt={token.name}
          width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          className="rounded-full"
          onError={() => setImageError(true)}
          unoptimized
        />
        {token.symbol === 'wNEAR' && (
          <div className={`absolute -bottom-0.5 -right-0.5 ${sizes.badge} bg-purple-500 rounded-full flex items-center justify-center`}>
            <RefreshCw className={`${sizes.badgeIcon} text-white`} strokeWidth={3} />
          </div>
        )}
      </div>
    );
  }

  return <div className="flex-shrink-0">{getFallbackIcon(token.icon)}</div>;
}

export function TokenSelector({ 
  selectedToken, 
  onSelectToken, 
  label = 'Select Token',
  disabled = false,
  excludeTokens = [],
  allowedTokens,
  compact = false
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableTokens = Object.values(NEAR_TOKENS).filter(token => {
    // If allowedTokens is specified, only show those tokens
    if (allowedTokens && allowedTokens.length > 0) {
      return allowedTokens.includes(token.id);
    }
    // Otherwise, show all tokens except excluded ones
    return !excludeTokens.includes(token.id);
  });

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (compact) {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center space-x-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-600 hover:border-[#2c5bff] dark:hover:border-blue-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <TokenIcon token={selectedToken} size="sm" />
          <span className="font-semibold" style={{ color: '#0f172a' }}>
            {selectedToken.symbol}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: '#64748b' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0  mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-slate-700 z-[100] max-h-96 overflow-visible">
            <div className="p-2 border-b border-[#e2e8f0] dark:border-slate-700">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                Select Token
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {availableTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleSelectToken(token)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    selectedToken.id === token.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-[#f8fafc] dark:hover:bg-blue-900/20'
                  }`}
                >
                  <TokenIcon token={token} size="md" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold" style={{ color: '#0f172a' }}>
                      {token.symbol}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b' }}>
                      {token.name}
                    </div>
                  </div>
                  {selectedToken.id === token.id && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium mb-2 block" style={{ color: '#0f172a' }}>
          {label}
        </label>
      )}
      
      {/* Selected Token Display */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-[#e2e8f0] dark:border-slate-600 rounded-xl hover:border-[#2c5bff] dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-3">
          <TokenIcon token={selectedToken} size="lg" />
          <div className="text-left">
            <div className="font-semibold text-lg" style={{ color: '#0f172a' }}>
              {selectedToken.symbol}
            </div>
            <div className="text-xs" style={{ color: '#64748b' }}>
              {selectedToken.name}
            </div>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ color: '#64748b' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-[#e2e8f0] dark:border-slate-700 z-[100] overflow-visible">
          <div className="p-3 border-b border-[#e2e8f0] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
              Select a token
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {availableTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleSelectToken(token)}
                type="button"
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all ${
                  selectedToken.id === token.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-[#f8fafc] dark:hover:bg-blue-900/20'
                }`}
              >
                <TokenIcon token={token} size="lg" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold" style={{ color: '#0f172a' }}>
                    {token.symbol}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#64748b' }}>
                    {token.name}
                  </div>
                </div>
                {selectedToken.id === token.id && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


