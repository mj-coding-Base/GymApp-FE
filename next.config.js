// // next.config.mjs
// export default {
//   reactStrictMode: true,
//   output: "standalone"
// };
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // eslint: {
  //   // Warning: this will skip ALL ESLint checks during `next build`
  //   ignoreDuringBuilds: true,
  // },

  experimental: {
    serverActions: true,
  },

  output: 'standalone',
  trustedHosts: ['payzhe.fit'],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
