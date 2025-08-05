/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: true },
  output: 'standalone',
  trustedHosts: ['payzhe.fit'],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
