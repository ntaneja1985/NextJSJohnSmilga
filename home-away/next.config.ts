import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: false,
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb' // Set desired value here
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: '"syymqgszlrsququpgcum.supabase.co"',
            },
        ],
    },


};

export default nextConfig;
