/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' if you're doing static export
  images: {
    unoptimized: true, // if you're having image optimization issues
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
