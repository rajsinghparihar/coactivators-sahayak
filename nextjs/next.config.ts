import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { // Note: In newer Next.js versions, serverActions might not require 'experimental'
    serverActions: {
      bodySizeLimit: '10mb', // Set your desired limit, e.g., '5mb', '100kb'
    },
  },
};

export default nextConfig;
