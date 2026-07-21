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
const PRIVATE = ['/admin', '/api/', '/ajouter-code'];

/**
 * AI/answer-engine crawlers, explicitly welcomed (GEO):
 * they power citations in ChatGPT, Claude, Perplexity, Gemini, Copilot,
 * Meta AI, DuckDuckGo AI… Explicit rules beat the wildcard when vendors
 * check for dedicated directives, and make the policy self-documenting.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'CCBot',
  'cohere-ai',
  'MistralAI-User',
  'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: PRIVATE,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
