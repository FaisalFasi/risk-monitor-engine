import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isVercel = process.env.VERCEL === '1';

// Only use basePath/assetPrefix for GitHub Pages
// Vercel, Netlify, and local dev don't need them
const githubConfig = isGithubActions ? {
  basePath: '/risk-monitor-engine',
  assetPrefix: '/risk-monitor-engine',
  trailingSlash: true,
} : {};

const nextConfig: NextConfig = {
  // Core settings
  reactStrictMode: true,
  
  // Conditionally apply GitHub Pages config (empty for Vercel)
  ...githubConfig,
  
  // Image optimization
  images: {
    unoptimized: true,
    domains: [],
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