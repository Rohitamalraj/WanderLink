/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed invalid serverActions and api keys for Next.js 15+
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem', 'ethers'],
  },
  images: {
    domains: ['api.WanderLink.xyz', 'lighthouse.storage'],
  },
  async rewrites() {
    return [
      {
        source: '/api/identity/verify-document',
        destination: 'http://localhost:4000/api/identity/verify-document',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Ignore optional dependencies that cause warnings
    config.ignoreWarnings = [
      { module: /@react-native-async-storage/ },
      { module: /pino-pretty/ },
      { module: /@walletconnect\/modal/ },
    ];

    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;

