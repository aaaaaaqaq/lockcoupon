/**
 * Single source of truth for the canonical site origin.
 * Always https + www, never a trailing slash.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com').replace(/\/+$/, '');

/** Build a full absolute canonical URL from a path. Root → origin without trailing slash. */
export function absoluteUrl(path: string = '/'): string {
  const clean = path.replace(/\/+$/, '');
  if (!clean || clean === '/') return SITE_URL;
  return `${SITE_URL}${clean.startsWith('/') ? clean : `/${clean}`}`;
}
