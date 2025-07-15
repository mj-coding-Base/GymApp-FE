/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' if you're doing static export
  images: {
    unoptimized: true, // if you're having image optimization issues
  },
  experimental: {
    serverActions: {
      // New format required in Next.js 15.3.2
      allowedOrigins: ['https://gymapp-khetech.netlify.app'] // Add your domains or IPs
    }
  },
  transpilePackages: ['axios'] 
};

module.exports = nextConfig;
