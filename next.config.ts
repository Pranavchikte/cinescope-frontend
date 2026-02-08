import type { NextConfig } from "next";

// frontend/next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    unoptimized: true,  // ADD THIS - stops timeouts
  },
};

export default nextConfig;