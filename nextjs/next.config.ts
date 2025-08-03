import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { // Note: In newer Next.js versions, serverActions might not require 'experimental'
    serverActions: {
      bodySizeLimit: '10mb', // Set your desired limit, e.g., '5mb', '100kb'
    },
  },
  // Configure static file serving
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
