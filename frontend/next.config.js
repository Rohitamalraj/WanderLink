/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.WanderLink.xyz', 'lighthouse.storage'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AGENT_SERVICE_URL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK,
    NEXT_PUBLIC_POLYGON_NETWORK: process.env.NEXT_PUBLIC_POLYGON_NETWORK,
  },
};

module.exports = nextConfig;
