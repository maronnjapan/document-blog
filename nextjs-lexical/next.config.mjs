/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 5000,
      ignored: /node_modules/,
    }
    return config
  }
};

export default nextConfig;
