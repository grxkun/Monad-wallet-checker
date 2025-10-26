/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false // Use pages directory
  },
  env: {
    MONAD_RPC: 'https://monad-testnet.drpc.org',
    CHAIN_ID: '10143'
  }
}

module.exports = nextConfig