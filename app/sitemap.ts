import { MetadataRoute } from 'next';
import { getAllStores } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lockcoupon.com';
  const stores = await getAllStores();

  const storeUrls = stores.map((store) => ({
    url: `${baseUrl}/codes-promo/${store.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/conditions-utilisation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...storeUrls,
  ];
}
