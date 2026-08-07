import Link from 'next/link';
import { getPostsLight, getAllStores } from '@/lib/supabase';
import { CATEGORIES, getCategoriesForStore, type Category } from '@/lib/categories';

interface Props {
  currentSlug: string;
}

/* ── helpers ───────────────────────────────────────────────────── */

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const STOPWORDS = new Set([
  'code', 'codes', 'promo', 'promos', 'reduction', 'reductions', 'pour',
  'avec', 'sans', 'les', 'des', 'une', 'votre', 'vos', 'comment', 'quel',
  'quels', 'quelle', 'quelles', 'meilleur', 'meilleurs', 'meilleure',
  'meilleures', 'astuce', 'astuces', 'guide', 'bon', 'bons', 'plan', 'plans',
  'tout', 'tous', 'toute', 'toutes', ' 2026', 'sur', 'chez', 'dans', 'plus',
]);

function tokens(title: string): Set<string> {
  return new Set(
    normalize(title)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3 && !STOPWORDS.has(t))
  );
}

/* ── component ─────────────────────────────────────────────────── */

// Internal-link block on every blog article (SEMrush weak-internal-links fix,
// Aug 2026). Every post now links to: its related STORE page (exact-match
// anchor), 2-3 topically related articles (title-token overlap, not just the
// most recent posts), and one CATEGORY hub page.
// Uses the light post index (no full `content` HTML) — previously this pulled
// getPublishedPosts() which fetched the entire content of all ~300 posts on
// every blog render, the main cause of >30s cold-ISR latency under load.
export default async function BlogRelated({ currentSlug }: Props) {
  const [posts, stores] = await Promise.all([getPostsLight(), getAllStores()]);

  const current = posts.find((p) => p.slug === currentSlug);
  const currentTitle = current?.title ?? '';
  const normTitle = normalize(currentTitle);
  const normSlug = normalize(currentSlug);

  // ── Detect the store this article is about (longest name match wins:
  //    "go sport" must not lose to "go", "nocibe-fr" matches via slug too).
  const matchedStore = stores
    .filter((s) => s.slug && s.name)
    .filter((s) => {
      const n = normalize(s.name);
      return n.length >= 3 && (normTitle.includes(n) || normSlug.includes(normalize(s.slug).replace(/-fr$/, '')));
    })
    .sort((a, b) => b.name.length - a.name.length)[0] ?? null;

  // ── One category hub link: the store's own category, else keyword scan.
  let category: Category | null = matchedStore ? getCategoriesForStore(matchedStore.slug)[0] ?? null : null;
  if (!category) {
    category = CATEGORIES.find((c) =>
      normTitle.includes(normalize(c.name)) || c.storeSlugs.some((s) => normTitle.includes(normalize(s.replace(/-/g, ' '))))
    ) ?? CATEGORIES.find((c) => c.slug === 'marketplace') ?? null;
  }

  // ── 3 topically related articles: score by title-token overlap instead of
  //    recency, so "livraison Temu" links to other Temu guides, not to the
  //    4 newest unrelated posts.
  const currentTokens = tokens(currentTitle);
  const relatedPosts = posts
    .filter((p) => p.slug && p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      tokens(p.title).forEach((t) => { if (currentTokens.has(t)) score++; });
      if (matchedStore && normalize(p.title).includes(normalize(matchedStore.name))) score += 2;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime())
    .slice(0, 3)
    .map((r) => r.post);

  const popularStores = stores.filter((s) => s.slug).slice(0, 8);

  return (
    <aside className="max-w-[800px] mx-auto px-4 py-10 border-t border-border">
      {/* Exact-match anchor to the related store page + category hub */}
      {(matchedStore || category) && (
        <section className="mb-10">
          <h2 className="text-text-main text-[22px] font-extrabold mb-4">Pour aller plus loin</h2>
          <div className="flex flex-wrap gap-3">
            {matchedStore && (
              <Link
                href={`/codes-promo/${matchedStore.slug}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
              >
                Code promo {matchedStore.name} →
              </Link>
            )}
            {category && (
              <Link
                href={`/codes-promo/categorie/${category.slug}`}
                className="inline-flex items-center gap-2 bg-white border border-border hover:border-primary text-text-main text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
              >
                {category.emoji} Codes promo {category.name}
              </Link>
            )}
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-text-main text-[22px] font-extrabold mb-4">Articles similaires</h2>
          <ul className="space-y-2">
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-gray-50 text-[14px] font-semibold text-text-main transition"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-text-main text-[22px] font-extrabold mb-4">Codes promo populaires</h2>
        <nav aria-label="Codes promo populaires">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {popularStores.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/codes-promo/${s.slug}`}
                  className="block px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-gray-50 text-[13px] font-semibold text-text-main transition"
                >
                  Code promo {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
          <Link href="/boutiques" className="text-primary hover:underline font-semibold">→ Toutes les boutiques</Link>
          <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">→ Top codes promo</Link>
          <Link href="/blog" className="text-primary hover:underline font-semibold">→ Tous les articles</Link>
        </div>
      </section>
    </aside>
  );
}
