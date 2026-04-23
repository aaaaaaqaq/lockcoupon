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
