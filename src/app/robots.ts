import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-arena.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes
          '/settings',       // Private user settings
          '/admin/',         // Admin panel
          '/projects/new',   // Create project page
          '/projects/*/edit',// Edit project pages
          '/projects/*/logs/new', // Add log pages
          '/*?*',            // Pages with query parameters (filters, etc.)
        ],
      },
      {
        userAgent: 'GPTBot',  // OpenAI crawler
        disallow: '/',        // Block AI training crawlers
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',   // Common Crawl
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
