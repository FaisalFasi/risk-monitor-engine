import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isNetlify = process.env.NETLIFY === 'true';
const isVercel = process.env.VERCEL === '1';

// Base path configuration
// Vercel and Netlify: No base path needed
// GitHub Actions: Use /risk-monitor-engine
const basePath = isGithubActions ? '/risk-monitor-engine' : '';
const assetPrefix = isGithubActions ? '/risk-monitor-engine' : '';

const nextConfig: NextConfig = {
  // Core settings
  reactStrictMode: true,
  basePath: basePath,
  assetPrefix: assetPrefix,
  trailingSlash: !isVercel, // Vercel doesn't need trailing slashes
  
  // Image optimization
  images: {
    unoptimized: true,
    domains: [],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubActions ? '/risk-monitor-engine' : '',
  },
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Compiler options
  compiler: {
    // Don't remove console logs to help with debugging
    removeConsole: false,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Add headers for CORS support
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // Disable X-Powered-By header
  poweredByHeader: false
};

export default nextConfig;