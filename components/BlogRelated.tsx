import Link from 'next/link';
import { getPostsLight, getAllStores } from '@/lib/supabase';

interface Props {
  currentSlug: string;
}

// Adds internal links to blog posts: related articles + popular stores.
// Uses the light post index (no full `content` HTML) — previously this pulled
// getPublishedPosts() which fetched the entire content of all ~300 posts on
// every blog render, the main cause of >30s cold-ISR latency under load.
export default async function BlogRelated({ currentSlug }: Props) {
  const [posts, stores] = await Promise.all([getPostsLight(), getAllStores()]);

  const relatedPosts = posts.filter((p) => p.slug && p.slug !== currentSlug).slice(0, 4);
  const popularStores = stores.filter((s) => s.slug).slice(0, 8);

  return (
    <aside className="max-w-[800px] mx-auto px-4 py-10 border-t border-border">
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
