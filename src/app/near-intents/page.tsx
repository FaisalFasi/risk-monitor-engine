'use client';

import React, { useState } from 'react';
import NearIntentsDashboardV2 from '@/components/NearIntentsDashboardV2';
import NearIntentsDashboard from '@/components/NearIntentsDashboard';
import { NearBlocksViewer } from '@/components/NearBlocksViewer';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';

export default function NearIntentsPage() {
  // Toggle between old and new dashboard for comparison
  const [useV2, setUseV2] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                NEAR Token Swaps & Transactions
              </h1>
              <p className="text-slate-800 dark:text-slate-300 mt-2">
                Swap tokens on NEAR Protocol and view your transaction history
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setUseV2(!useV2)}
            >
              {useV2 ? 'Show Legacy View' : 'Show New View'}
            </Button>
          </div>
        </div>
        <div className="space-y-8">
          {useV2 ? <NearIntentsDashboardV2 /> : <NearIntentsDashboard />}
        </div>
      </main>
    </div>
  );
}