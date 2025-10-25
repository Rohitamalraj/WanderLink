/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Suppress handlebars warning
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Ignore handlebars warnings
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars\/lib\/index\.js/ },
      /require\.extensions/,
    ];
    
    return config;
  },
};

export default nextConfig;
