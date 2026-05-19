/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      // ── Force indexing on every production page ──────────────────────
      // Overrides any X-Robots-Tag: noindex that Vercel may inject on
      // preview deployments or misrouted traffic.
      {
        source: '/((?!api|_next|_vercel).*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
      // ── Never index admin or API routes ─────────────────────────────
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/admin(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect non-www to www for canonical consistency (issue 4, 12)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lockcoupon.com' }],
        destination: 'https://www.lockcoupon.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
