'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NearIntentsPage() {
  const router = useRouter();
  
  // Redirect to /near-intents/swap by default
  useEffect(() => {
    router.push('/near-intents/swap');
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#2c5bff', borderTopColor: 'transparent' }}></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to swap...</p>
      </div>
    </div>
  );
}
