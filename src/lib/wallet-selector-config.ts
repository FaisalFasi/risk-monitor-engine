import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { setupSender } from '@near-wallet-selector/sender';

// Import modal CSS
import '@near-wallet-selector/modal-ui/styles.css';

export interface WalletSelectorConfig {
  networkId: 'testnet' | 'mainnet';
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
}

// Network configuration - change this to switch between testnet and mainnet
// Using alternative RPC endpoints with better rate limits
const NETWORK_CONFIG = {
  testnet: {
    networkId: 'testnet' as const,
    // Using public.rpc.fastnear.com - better rate limits than official endpoint
    nodeUrl: 'https://test.rpc.fastnear.com',
    walletUrl: 'https://testnet.mynearwallet.com', // MyNearWallet for testnet
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
  },
  mainnet: {
    networkId: 'mainnet' as const,
    nodeUrl: 'https://free.rpc.fastnear.com',
    walletUrl: 'https://app.mynearwallet.com', // MyNearWallet for mainnet
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
  },
};

// Choose network: 'testnet' for development, 'mainnet' for production
const CURRENT_NETWORK = (process.env.NEXT_PUBLIC_NEAR_NETWORK_ID as 'testnet' | 'mainnet') || 'testnet';

// Helper function to get the appropriate node URL
function getNodeUrl(): string {
  // If running in development (localhost), use the proxy to avoid CORS issues
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const proxyUrl = `${window.location.origin}/api/near-rpc-proxy`;
    console.log('Using CORS proxy for NEAR RPC:', proxyUrl);
    return proxyUrl;
  }
  
  // In production or if NEXT_PUBLIC_NEAR_NODE_URL is set, use the direct URL
  return process.env.NEXT_PUBLIC_NEAR_NODE_URL || NETWORK_CONFIG[CURRENT_NETWORK].nodeUrl;
}

// Function to get config dynamically (called at runtime, not module load time)
export function getDefaultConfig(): WalletSelectorConfig {
  return {
    networkId: NETWORK_CONFIG[CURRENT_NETWORK].networkId,
    nodeUrl: getNodeUrl(),
    walletUrl: process.env.NEXT_PUBLIC_NEAR_WALLET_URL || NETWORK_CONFIG[CURRENT_NETWORK].walletUrl,
    helperUrl: NETWORK_CONFIG[CURRENT_NETWORK].helperUrl,
    explorerUrl: NETWORK_CONFIG[CURRENT_NETWORK].explorerUrl,
  };
}

// Legacy export for backwards compatibility
export const defaultConfig: WalletSelectorConfig = {
  networkId: NETWORK_CONFIG[CURRENT_NETWORK].networkId,
  nodeUrl: 'https://rpc.testnet.near.org', // Placeholder, will be overridden
  walletUrl: NETWORK_CONFIG[CURRENT_NETWORK].walletUrl,
  helperUrl: NETWORK_CONFIG[CURRENT_NETWORK].helperUrl,
  explorerUrl: NETWORK_CONFIG[CURRENT_NETWORK].explorerUrl,
};

export async function createWalletSelector(config?: WalletSelectorConfig) {
  try {
    // Always use dynamic config if none provided
    const finalConfig = config || getDefaultConfig();
    
    console.log('Creating wallet selector with config:', finalConfig);
    
    const selector = await setupWalletSelector({
      network: {
        networkId: finalConfig.networkId,
        nodeUrl: finalConfig.nodeUrl,
        walletUrl: finalConfig.walletUrl,
        helperUrl: finalConfig.helperUrl,
        explorerUrl: finalConfig.explorerUrl,
      },
      debug: process.env.NODE_ENV === 'development',
      modules: [
        setupMyNearWallet(),     // Popular wallet with account creation
        setupMeteorWallet(),     // Browser extension wallet
        setupBitteWallet(),      // Telegram wallet
        setupSender(),           // Multi-chain wallet
      ],
    });

    console.log('Wallet selector created successfully');
    console.log('Network:', finalConfig.networkId);
    console.log('Node URL:', finalConfig.nodeUrl);
    console.log('Wallet URL:', finalConfig.walletUrl);
    
    return selector;
  } catch (error) {
    console.error('Error creating wallet selector:', error);
    console.error('Config that failed:', config);
    throw error;
  }
}

export async function createWalletSelectorModal(selector: any) {
  const modal = setupModal(selector, {
    contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || 'test.near',
    methodNames: ['nft_mint', 'nft_transfer'],
  });

  return modal;
}
