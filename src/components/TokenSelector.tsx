'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Token, NEAR_TOKENS } from '@/types/tokens';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  label?: string;
  disabled?: boolean;
  excludeTokens?: string[]; // Token IDs to exclude
  compact?: boolean;
}

export function TokenSelector({ 
  selectedToken, 
  onSelectToken, 
  label = 'Select Token',
  disabled = false,
  excludeTokens = [],
  compact = false
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableTokens = Object.values(NEAR_TOKENS).filter(
    token => !excludeTokens.includes(token.id)
  );

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
          <span className="text-2xl">{selectedToken.icon}</span>
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
                  <span className="text-3xl">{token.icon}</span>
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
          <span className="text-3xl">{selectedToken.icon}</span>
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
                <span className="text-3xl flex-shrink-0">{token.icon}</span>
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


