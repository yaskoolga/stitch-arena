import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-arena.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/challenges`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Public projects (only public projects should be indexed)
    const projects = await prisma.project.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5000, // Limit to prevent huge sitemaps
    });

    const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.id}`,
      lastModified: project.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Active challenges
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: { startDate: 'desc' },
      take: 100,
    });

    const challengePages: MetadataRoute.Sitemap = challenges.map((challenge) => ({
      url: `${SITE_URL}/challenges/${challenge.id}`,
      lastModified: challenge.createdAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // User profiles (only users with public projects)
    const users = await prisma.user.findMany({
      where: {
        projects: {
          some: { isPublic: true },
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000,
    });

    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${SITE_URL}/dashboard/${user.id}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...projectPages, ...challengePages, ...userPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database query fails
    return staticPages;
  }
}
