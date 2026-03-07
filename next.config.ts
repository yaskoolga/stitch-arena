import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default bundleAnalyzer(withNextIntl(withPWA(nextConfig)));
