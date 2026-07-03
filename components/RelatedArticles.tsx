// Server component — links blog articles from store pages.
// Purpose: store pages are crawled daily; giving each one 4 article links
// creates crawl paths so Google discovers/indexes the blog corpus
// (fixes "Détectée, actuellement non indexée").
// Selection: articles matching the store first, then a deterministic
// per-store slice of the rest so the 98 stores collectively cover all posts.

import Link from 'next/link';
import { getPostsLight } from '@/lib/supabase';

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Props {
  storeName: string;
  storeSlug: string;
}

export default async function RelatedArticles({ storeName, storeSlug }: Props) {
  const posts = await getPostsLight();
  if (!posts || posts.length === 0) return null;

  const lower = storeName.toLowerCase();
  const matched = posts.filter(
    (p) => (p.title || '').toLowerCase().includes(lower) || (p.slug || '').includes(storeSlug)
  );
  const matchedSlugs = new Set(matched.map((p) => p.slug));
  const rest = posts.filter((p) => !matchedSlugs.has(p.slug));
  const offset = rest.length > 0 ? hashCode(storeSlug) % rest.length : 0;
  const fill = [...rest.slice(offset), ...rest.slice(0, offset)];
  const chosen = [...matched.slice(0, 4), ...fill].slice(0, 4);

  if (chosen.length === 0) return null;

  return (
    <section className="bg-bg border-t border-border" aria-label={`Articles liés à ${storeName}`}>
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-5">
            À lire sur le blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chosen.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <p className="text-text-main text-[14px] font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {p.title}
                </p>
                <p className="text-muted text-[12px] mt-1.5">
                  {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </Link>
            ))}
          </div>
          <p className="text-center mt-5">
            <Link href="/blog" className="text-primary text-[14px] font-semibold hover:underline">
              Voir tous les articles →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
