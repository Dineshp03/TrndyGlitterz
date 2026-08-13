import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 430, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 128, 160, 200, 256, 320],
    minimumCacheTTL: 604800, // Cache images for 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      }
    ],
  },
  devIndicators: false,
  // Enable compression for all responses
  compress: true,
};

export default nextConfig;
