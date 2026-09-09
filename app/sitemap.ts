import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/cv';
import { works } from '@/lib/works';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_ORIGIN}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_ORIGIN}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...works.map((w) => ({ url: `${SITE_ORIGIN}/work/${w.slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.6 })),
    { url: `${SITE_ORIGIN}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
