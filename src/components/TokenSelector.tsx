'use client';

import React, { useState } from 'react';
import { Token, NEAR_TOKENS } from '@/types/tokens';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  label?: string;
  disabled?: boolean;
  excludeTokens?: string[]; // Token IDs to exclude
}

export function TokenSelector({ 
  selectedToken, 
  onSelectToken, 
  label = 'Select Token',
  disabled = false,
  excludeTokens = []
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableTokens = Object.values(NEAR_TOKENS).filter(
    token => !excludeTokens.includes(token.id)
  );

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-slate-800 dark:text-slate-300 mb-2 block">
        {label}
      </label>
      
      {/* Selected Token Display */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{selectedToken.icon}</span>
          <div className="text-left">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {selectedToken.symbol}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedToken.name}
            </div>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Token List */}
          <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-xl">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                Select a token
              </div>
              
              {availableTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleSelectToken(token)}
                  className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{token.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {token.name}
                    </div>
                  </div>
                  {selectedToken.id === token.id && (
                    <svg 
                      className="w-5 h-5 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// Compact version for inline use
export function TokenSelectorCompact({ 
  selectedToken, 
  onSelectToken, 
  disabled = false,
  excludeTokens = []
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableTokens = Object.values(NEAR_TOKENS).filter(
    token => !excludeTokens.includes(token.id)
  );

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xl">{selectedToken.icon}</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {selectedToken.symbol}
        </span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="absolute z-50 right-0 mt-2 w-64 max-h-80 overflow-y-auto shadow-xl">
            <div className="p-2">
              {availableTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleSelectToken(token)}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="text-xl">{token.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {token.symbol}
                    </div>
                  </div>
                  {selectedToken.id === token.id && (
                    <svg 
                      className="w-4 h-4 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

