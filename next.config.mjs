/** @type {import('next').NextConfig} */
import path from 'node:path';
const nextConfig = {
  experimental: { typedRoutes: true },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(); // project root
    return config;
  }
};
export default nextConfig;
