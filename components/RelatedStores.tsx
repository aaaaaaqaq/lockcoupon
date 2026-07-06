import Link from 'next/link';
import { getAllStores, type Store } from '@/lib/supabase';
import { getCategoriesForStore } from '@/lib/categories';

interface RelatedStoresProps {
  currentSlug: string;
  max?: number;
}

/** Deterministic per-store ordering so the link set is stable between
 *  renders/ISR revalidations (Google dislikes churning internal links). */
function stableOrder(slugs: Store[], seedStr: string): Store[] {
  let seed = 7;
  for (let i = 0; i < seedStr.length; i++) seed = ((seed * 31) + seedStr.charCodeAt(i)) >>> 0;
  return [...slugs].sort((a, b) => {
    const ha = (seed ^ (a.slug.length * 2654435761)) >>> 0;
    const hb = (seed ^ (b.slug.length * 2654435761)) >>> 0;
    return ha === hb ? a.slug.localeCompare(b.slug) : ha - hb;
  });
}

/**
 * Server component — internal-linking block for store pages.
 * Prioritizes stores from the SAME category (raises crawl priority for
 * "Détectée, actuellement non indexée" pages via topical internal links),
 * then fills up with other stores if the category is small.
 */
export default async function RelatedStores({ currentSlug, max = 6 }: RelatedStoresProps) {
  const all = await getAllStores();
  const others = all.filter((s) => s.slug && s.slug !== currentSlug);

  const categories = getCategoriesForStore(currentSlug);
  const primaryCategory = categories[0] ?? null;
  const sameCategorySlugs = new Set(categories.flatMap((c) => c.storeSlugs));

  const sameCategory = stableOrder(
    others.filter((s) => sameCategorySlugs.has(s.slug)),
    currentSlug
  );
  const rest = stableOrder(
    others.filter((s) => !sameCategorySlugs.has(s.slug)),
    currentSlug
  );

  const related: Store[] = [...sameCategory, ...rest].slice(0, max);

  return (
    <aside className="max-w-[1200px] mx-auto px-4 py-10 border-t border-border">
      <h2 className="text-text-main text-[22px] md:text-[26px] font-extrabold mb-5">
        {primaryCategory
          ? `Boutiques ${primaryCategory.name.toLowerCase()} similaires`
          : 'Boutiques similaires'}
      </h2>
      <nav aria-label="Boutiques similaires">
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {related.map((s) => (
            <li key={s.id}>
              <Link
                href={`/codes-promo/${s.slug}`}
                className="block px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-gray-50 text-[14px] font-semibold text-text-main transition"
              >
                Code promo {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-5 flex flex-wrap gap-3 text-[13px]">
        {primaryCategory && (
          <Link
            href={`/codes-promo/categorie/${primaryCategory.slug}`}
            className="text-primary hover:underline font-semibold"
          >
            → Tous les codes promo {primaryCategory.name.toLowerCase()}
          </Link>
        )}
        <Link href="/boutiques" className="text-primary hover:underline font-semibold">
          → Toutes les boutiques
        </Link>
        <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">
          → Top codes promo
        </Link>
        <Link href="/blog" className="text-primary hover:underline font-semibold">
          → Blog & guides
        </Link>
      </div>
    </aside>
  );
}
