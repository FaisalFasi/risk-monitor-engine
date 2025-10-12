'use client';

import React from 'react';
import { TransferTokens } from '@/components/TransferTokens';
import { Header } from '@/components/Header';
import Link from 'next/link';

export default function TransferPage() {
  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl overflow-visible">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4" style={{ color: '#0f172a' }}>
            Transfer Tokens
          </h1>
          <p className="text-sm md:text-lg max-w-2xl mx-auto px-4" style={{ color: '#475569' }}>
            Send NEAR and tokens to any account on the NEAR blockchain
          </p>
          
          {/* Navigation Tabs */}
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/near-intents/swap"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Swap
            </Link>
            <Link
              href="/near-intents/vault"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Vault
            </Link>
            <Link
              href="/near-intents/transfer"
              className="px-6 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white shadow-lg"
            >
              Transfer
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <TransferTokens />
        </div>
      </main>
    </div>
  );
}

