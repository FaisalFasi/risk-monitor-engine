'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useResponsive } from '@/hooks/useResponsive';
import { useNearWallet } from '@/hooks/useNearWallet';
import { Moon, Sun, Menu, X, Wallet } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { account, isConnected, connect, disconnect } = useNearWallet();

  useEffect(() => {
    // Check for saved dark mode preference (only in browser)
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const shouldUseDark = savedDarkMode || savedTheme === 'dark' || (!savedTheme && !localStorage.getItem('darkMode') && prefersDark);
      
      setIsDarkMode(shouldUseDark);
       
      if (shouldUseDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop, isMobileMenuOpen]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', newDarkMode.toString());
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <header style={{ backgroundColor: 'hsla(0, 0%, 100%, 0.95)' }} className="border-b border-[#e2e8f0] dark:border-slate-700 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`flex items-center justify-center rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover-lift ${
              isMobile ? 'w-full' : isTablet ? 'w-full h-11' : 'w-full h-12'
            }`}>
              <Image 
                src="/logo/bod.png" 
                alt="Bond Credit Logo" 
                width={100}
                height={100}
                // width={isMobile ? 100 : isTablet ? 44 : 48}
                // height={isMobile ? 36 : isTablet ? 44 : 48}
                className="w-full h-full object-contain p-2"
                priority
              />
            </div>
            <span className={`font-bold tracking-tight ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`} style={{ color: '#0f172a' }}>
            </span>
          </div>
 
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link href="/" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/agents" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Agents
            </Link>
            <Link href="/risk" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Risk
            </Link>
            <Link href="/credit" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Credit
            </Link>
            <Link href="/verification" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Verify
            </Link>
            <Link href="/analytics" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Analytics
            </Link>
            <Link href="/near-intents" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              NEAR Intents
            </Link>
            <Link href="/vault" className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap">
              Vault
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            {/* <button
              onClick={toggleDarkMode}
              className={`rounded-lg bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E2E8F0] dark:hover:bg-slate-700 transition-all duration-200 hover-scale focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 flex items-center justify-center ${
                isMobile ? 'p-1.5' : 'p-2'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
              ) : (
                <Moon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-slate-600 dark:text-slate-300`} />
              )}
            </button> */}

            {/* Connect Wallet Button - Desktop */}
            {!isConnected ? (
              <button 
                onClick={handleConnectWallet}
                style={{ backgroundColor: '#2c5bff' }}
                className={`hidden md:block text-white font-semibold transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2 ${
                  isTablet ? 'px-5 py-2 rounded-lg text-sm' : 'px-6 py-2.5 rounded-lg text-base'
                }`}
              >
                <span className="hidden lg:inline">Connect Wallet</span>
                <span className="lg:hidden">Connect</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-4 py-2 bg-[#D1FAE5] dark:bg-green-900/30 rounded-lg border border-[#10B981]/20">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse-subtle"></div>
                  <span className="text-[#065F46] dark:text-green-300 text-sm font-semibold">
                    {account?.accountId?.slice(0, 8)}...
                  </span>
                </div>
                {/* <button 
                  onClick={handleDisconnectWallet}
                  className="px-3 py-2 text-[#475569] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-slate-100 text-sm font-medium transition-colors rounded-lg hover:bg-[#F8F9FA]"
                >
                  Disconnect
                </button> */}
              </div>
            )}

            {/* Connect Wallet Button - Mobile */}
            {!isConnected ? (
              <button 
                onClick={handleConnectWallet}
                style={{ backgroundColor: '#2c5bff' }}
                className={`md:hidden text-white font-semibold transition-all duration-200 hover:opacity-90 focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2 ${
                  isMobile ? 'px-3 py-1.5 rounded-lg text-xs' : 'px-4 py-2 rounded-lg text-sm'
                }`}
              >
                Connect
              </button>
            ) : (
              <div className="md:hidden flex items-center space-x-1">
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#D1FAE5] dark:bg-green-900/30 rounded-lg border border-[#10B981]/20">
                  <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse-subtle"></div>
                  <span className="text-[#065F46] dark:text-green-300 text-xs font-semibold">
                    {account?.accountId?.slice(0, 6)}...
                  </span>
                </div>
                <button 
                  onClick={handleDisconnectWallet}
                  className="px-2 py-1.5 text-[#475569] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-slate-100 text-xs font-medium transition-colors rounded hover:bg-[#F8F9FA]"
                >
                  ×
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden rounded-lg bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#E2E8F0] dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
                isMobile ? 'p-1.5' : 'p-2'
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>


        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-[#e2e8f0] dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-4">
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/agents"
                onClick={closeMobileMenu}
              >
                Agents
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/risk"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Risk Monitor</span>
                <span className="sm:hidden">Risk</span>
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/credit"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Credit Vaults</span>
                <span className="sm:hidden">Credit</span>
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/verification"
                onClick={closeMobileMenu}
              >
                <span className="hidden sm:inline">Verification</span>
                <span className="sm:hidden">Verify</span>
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/analytics"
                onClick={closeMobileMenu}
              >
                Analytics
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/near-intents"
                onClick={closeMobileMenu}
              >
                NEAR Intents
              </Link>
              <Link 
                className="text-[#475569] dark:text-slate-200 hover:text-[#2c5bff] dark:hover:text-blue-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 px-3 py-3 rounded-lg text-sm font-medium transition-all text-center focus:ring-2 focus:ring-[#2c5bff] focus:ring-offset-2" 
                href="/vault"
                onClick={closeMobileMenu}
              >
                Vault
              </Link>
            </nav>
          </div>
        )}
        
      </div>
    </header>
  );
}