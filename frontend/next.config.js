/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  trailingSlash: true,
  // Turbopack configuration for monorepo
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
}

module.exports = nextConfig
