import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Audited 2026-07-06 (GSC "Bloquée par robots.txt"):
 * only genuinely private routes are disallowed —
 *   /admin         private back-office (also noindexed via X-Robots-Tag header)
 *   /api/          system/cron endpoints, never indexable
 *   /ajouter-code  user-submission form, intentionally kept out of the index
 *                  (its layout also sets metadata.robots noindex)
 * Every public page is crawlable, and the sitemap is declared with the
 * canonical https+www origin.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/ajouter-code'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
