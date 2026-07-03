// Slug helpers — used to detect duplicate auto-generated articles.
// Generated slugs end with a base36 timestamp suffix (e.g. "-mpxs3pk2").

/** Strip a trailing base36 timestamp suffix (must contain at least one digit,
 *  so real French words like "-astuces" are never stripped). */
export function baseSlug(slug: string): string {
  const m = slug.match(/^(.*)-([a-z0-9]{7,10})$/);
  if (!m) return slug;
  const suffix = m[2];
  if (!/\d/.test(suffix)) return slug; // real word, not a timestamp
  return m[1];
}

/** Build the slug base from an article title (same transform as the cron). */
export function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 75);
}
