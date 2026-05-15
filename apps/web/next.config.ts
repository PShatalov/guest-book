import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

/** Backend origin for `/api/*` rewrites (browser uses same-origin `/api` in E2E). */
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: monorepoRoot,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
