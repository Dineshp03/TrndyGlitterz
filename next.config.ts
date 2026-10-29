import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ⚠️ DO NOT set unoptimized:true — that bypasses Next.js image compression
    // and causes massive egress from Supabase Storage.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 430, 768, 1024, 1280],
    imageSizes: [64, 128, 256, 320],
    minimumCacheTTL: 604800, // Cache optimized images for 7 days in browser
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
        hostname: 'zlouhiealaldfvqqjhop.supabase.co',
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
  compress: true,
};

export default nextConfig;
