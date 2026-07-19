'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Store } from '@/lib/supabase';

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Store[]>([]);
  const [showResults, setShowResults] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(6);
      if (data) { setResults(data); setShowResults(true); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length === 1) { router.push(`/codes-promo/${results[0].slug}`); return; }
    router.push(query ? `/boutiques?q=${encodeURIComponent(query)}` : '/boutiques');
  };

  return (
    <div className="relative w-full max-w-[560px] min-w-0" ref={boxRef}>
      <form
        onSubmit={submit}
        role="search"
        aria-label="Rechercher une boutique"
        className="hero-search relative flex items-center w-full max-w-full bg-white rounded-full p-1.5 pl-4 sm:pl-5"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#999" strokeWidth="1.8" aria-hidden className="shrink-0">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          placeholder="Rechercher une boutique (ex: Shein, Temu, Amazon...)"
          aria-label="Rechercher une boutique"
          size={1}
          className="w-0 flex-1 bg-transparent px-2.5 sm:px-3 py-2.5 text-[15px] text-text-main outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-2 whitespace-nowrap bg-gradient-to-b from-[#e2503c] to-[#a72c1e] hover:from-[#e85a46] hover:to-[#b23223] text-white text-[14px] font-bold rounded-full px-4 sm:px-6 py-2.5 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" strokeLinecap="round" />
          </svg>
          Rechercher
        </button>
      </form>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[60] text-left">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-muted text-[14px]">Aucune boutique trouvée</div>
          ) : (
            results.map((store) => (
              <Link
                key={store.id}
                href={`/codes-promo/${store.slug}`}
                onClick={() => { setShowResults(false); setQuery(''); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px] font-bold"
                    style={{ backgroundColor: store.logo_color || '#C0392B' }}
                  >
                    {store.logo_letter || store.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-text-main text-[14px] font-semibold">{store.name}</p>
                  <p className="text-muted text-[11px] line-clamp-1">{store.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
