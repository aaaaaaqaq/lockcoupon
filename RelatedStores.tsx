import Link from 'next/link';
import { getAllStores, type Store } from '@/lib/supabase';

interface RelatedStoresProps {
  currentSlug: string;
  max?: number;
}

// Server component — renders 6 related store links for internal linking SEO
export default async function RelatedStores({ currentSlug, max = 8 }: RelatedStoresProps) {
  const all = await getAllStores();
  const others = all.filter((s) => s.slug && s.slug !== currentSlug);

  // Shuffle-lite: pick a pseudo-random stable slice based on slug length
  const seed = currentSlug.length % Math.max(others.length - max, 1);
  const related: Store[] = others.slice(seed, seed + max);
  if (related.length < max) {
    related.push(...others.slice(0, max - related.length));
  }

  return (
    <aside className="max-w-[1200px] mx-auto px-4 py-10 border-t border-border">
      <h2 className="text-text-main text-[22px] md:text-[26px] font-extrabold mb-5">
        Boutiques similaires
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
