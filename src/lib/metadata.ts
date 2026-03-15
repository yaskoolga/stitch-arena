/**
 * SEO Metadata utilities for StitchArena
 * Generates dynamic metadata, Open Graph, and Twitter Cards
 */

import { Metadata } from 'next';

const SITE_NAME = 'StitchArena';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-arena.vercel.app';
const DEFAULT_DESCRIPTION = 'Track your cross-stitch projects with AI-powered stitch detection. Join the community, participate in challenges, and showcase your work.';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

interface MetadataParams {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  publishedTime,
  author,
  keywords = [],
}: MetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [
      'cross stitch',
      'embroidery',
      'needlework',
      'crafts',
      'tracking',
      'AI detection',
      ...keywords,
    ],
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };

  return metadata;
}

/**
 * Generate metadata for project page
 */
export function generateProjectMetadata({
  title,
  description,
  imageUrl,
  username,
  slug,
  completedPercentage,
  manufacturer,
}: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  username?: string;
  slug?: string;
  completedPercentage?: number;
  manufacturer?: string | null;
}): Metadata {
  const projectDescription = description || `${title} cross-stitch project by ${username || 'StitchArena user'}. ${completedPercentage ? `${completedPercentage}% complete.` : ''}`;
  const url = slug && username ? `${SITE_URL}/@${username}/${slug}` : undefined;

  const keywords = [
    'cross stitch project',
    title,
    manufacturer,
  ].filter(Boolean) as string[];

  return generatePageMetadata({
    title,
    description: projectDescription,
    image: imageUrl || undefined,
    url,
    type: 'article',
    author: username,
    keywords,
  });
}

/**
 * Generate metadata for user profile page
 */
export function generateUserMetadata({
  name,
  bio,
  avatarUrl,
  username,
  projectsCount,
  totalStitches,
}: {
  name?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  username?: string;
  projectsCount?: number;
  totalStitches?: number;
}): Metadata {
  const displayName = name || 'StitchArena User';
  const profileDescription = bio || `${displayName} on StitchArena. ${projectsCount ? `${projectsCount} projects` : ''} ${totalStitches ? `· ${totalStitches.toLocaleString()} stitches` : ''}`.trim();
  const url = username ? `${SITE_URL}/@${username}` : undefined;

  return generatePageMetadata({
    title: displayName,
    description: profileDescription,
    image: avatarUrl || undefined,
    url,
    type: 'profile',
    keywords: ['embroidery artist', 'cross stitch maker', displayName],
  });
}

/**
 * Generate metadata for challenge page
 */
export function generateChallengeMetadata({
  title,
  description,
  slug,
  participantsCount,
  targetValue,
  type,
}: {
  title: string;
  description?: string | null;
  slug?: string;
  participantsCount?: number;
  targetValue?: number;
  type?: string;
}): Metadata {
  const challengeDescription = description || `Join the ${title} challenge on StitchArena! ${participantsCount ? `${participantsCount} participants` : ''} ${targetValue ? `· Goal: ${targetValue.toLocaleString()} stitches` : ''}`.trim();
  const url = slug ? `${SITE_URL}/challenges/${slug}` : undefined;

  return generatePageMetadata({
    title,
    description: challengeDescription,
    url,
    type: 'article',
    keywords: ['cross stitch challenge', 'embroidery challenge', type, title].filter(Boolean) as string[],
  });
}

/**
 * Generate structured data (JSON-LD) for project
 */
export function generateProjectStructuredData({
  title,
  description,
  imageUrl,
  author,
  dateCreated,
  dateModified,
  url,
}: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  author?: { name?: string | null; url?: string };
  dateCreated: string;
  dateModified?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description: description || undefined,
    image: imageUrl || undefined,
    author: author?.name ? {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    } : undefined,
    dateCreated,
    dateModified: dateModified || dateCreated,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Generate structured data (JSON-LD) for user profile
 */
export function generatePersonStructuredData({
  name,
  description,
  image,
  url,
}: {
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: description || undefined,
    image: image || undefined,
    url,
    sameAs: [url],
  };
}

/**
 * Generate structured data (JSON-LD) for breadcrumbs
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
