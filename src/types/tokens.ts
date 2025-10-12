// Token types and configurations for NEAR blockchain

export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string; // Icon identifier for rendering
  iconUrl?: string; // CoinGecko CDN URL for token logo
  contractId: string; // NEAR contract address
  isNative?: boolean;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  usdValue?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
}

export interface SwapTransaction {
  hash: string;
  from: string;
  to: string;
  fromToken: Token;
  toToken: Token;
  amountIn: string;
  amountOut: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  gasUsed?: string;
  explorerUrl: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  type: 'transfer' | 'swap' | 'stake' | 'contract_call';
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  blockHeight: number;
  gasUsed: string;
  fee: string;
  explorerUrl: string;
  method?: string;
  args?: Record<string, unknown>;
}

// Popular tokens on NEAR testnet and mainnet
export const NEAR_TOKENS: Record<string, Token> = {
  NEAR: {
    id: 'near',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    decimals: 24,
    icon: 'near',
    iconUrl: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
    contractId: 'near',
    isNative: true,
  },
  WNEAR: {
    id: 'wnear',
    symbol: 'wNEAR',
    name: 'Wrapped NEAR',
    decimals: 24,
    icon: 'wnear',
    iconUrl: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
    contractId: 'wrap.testnet', // testnet
  },
  USDC: {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: 'usdc',
    iconUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    contractId: 'usdc.fakes.testnet', // testnet
  },
  USDT: {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: 'usdt',
    iconUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    contractId: 'usdt.fakes.testnet', // testnet
  },
  DAI: {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: 'dai',
    iconUrl: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
    contractId: 'dai.fakes.testnet', // testnet
  },
  WETH: {
    id: 'weth',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    icon: 'weth',
    iconUrl: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
    contractId: 'weth.fakes.testnet', // testnet
  },
  WBTC: {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: 'wbtc',
    iconUrl: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
    contractId: 'wbtc.fakes.testnet', // testnet
  },
};

// Mainnet token addresses (for production)
export const MAINNET_TOKENS: Record<string, string> = {
  NEAR: 'near',
  WNEAR: 'wrap.near',
  USDC: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
  USDT: 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
  DAI: '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
  WETH: 'aurora',
  WBTC: '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
};

// Helper function to get token by symbol
export function getTokenBySymbol(symbol: string, network: 'testnet' | 'mainnet' = 'testnet'): Token | undefined {
  const token = NEAR_TOKENS[symbol];
  if (!token) return undefined;

  // Update contract ID for mainnet
  if (network === 'mainnet' && MAINNET_TOKENS[symbol]) {
    return {
      ...token,
      contractId: MAINNET_TOKENS[symbol],
    };
  }

  return token;
}

// Helper function to format token amount
export function formatTokenAmount(amount: string, decimals: number): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.replace(/0+$/, '');
  
  return `${whole}.${trimmed}`;
}

// Helper function to parse token amount
export function parseTokenAmount(amount: string, decimals: number): string {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0');
  return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction)).toString();
}

// Helper to get explorer URL
export function getExplorerUrl(txHash: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet' 
    ? 'https://testnet.nearblocks.io/txns'
    : 'https://nearblocks.io/txns';
  return `${baseUrl}/${txHash}`;
}

