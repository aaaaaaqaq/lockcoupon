import { MetadataRoute } from 'next';
import { getAllStores } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bonplan.ma';
  const stores = await getAllStores();

  const storeUrls = stores.map((store) => ({
    url: `${baseUrl}/codes-promo/${store.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...storeUrls,
  ];
}
