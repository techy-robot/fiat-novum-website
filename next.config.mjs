/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@keystar/ui',
    '@keystatic/core',
    '@react-stately/combobox'
  ],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
};

export default nextConfig;
