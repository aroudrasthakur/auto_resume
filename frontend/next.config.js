const fs = require('fs')
const path = require('path')

// Load root .env file FIRST with override=true to ensure it takes precedence over any local .env files
// This makes the root .env the single source of truth
try {
  const rootEnvPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(rootEnvPath)) {
    // Load root .env with override=true so it overrides any values from Next.js default env files
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: rootEnvPath, override: true })
  }
} catch {
  // no-op - dotenv might not be available, but Next.js will still work
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_DEV_AUTH_BYPASS: ['true', '1', 'yes'].includes(String(process.env.DEV_AUTH_BYPASS || process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS || '').toLowerCase()) ? 'true' : '',
  },
}

module.exports = nextConfig

