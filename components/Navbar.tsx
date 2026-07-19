'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Store } from '@/lib/supabase';

const NAV_LINKS: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: '/',
    label: 'Accueil',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: '/top-codes-promo',
    label: 'Codes promo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/boutiques',
    label: 'Boutiques',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M2 7h20v3a2 2 0 0 1-2 2c-.6 0-1.2-.2-1.6-.6a.7.7 0 0 0-.8 0 2.7 2.7 0 0 1-3.2 0 .7.7 0 0 0-.8 0 2.7 2.7 0 0 1-3.2 0 .7.7 0 0 0-.8 0 2.7 2.7 0 0 1-3.2 0 .7.7 0 0 0-.8 0c-.4.4-1 .6-1.6.6a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    href: '/guide-achat',
    label: "Guide d'achat",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Store[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(8);
      if (data) { setResults(data); setShowResults(true); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Close search results on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) { setErrorMsg('Veuillez entrer un email valide'); setStatus('error'); return; }
    setStatus('loading');
    const { error } = await supabase.from('subscribers').insert({ email });
    if (error) {
      setErrorMsg(error.code === '23505' ? 'Cet email est déjà inscrit !' : 'Une erreur est survenue.');
      setStatus('error');
    } else { setStatus('success'); setEmail(''); }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#a72c1e] via-primary to-[#a72c1e] text-white text-center py-2 px-3 text-[13px] font-medium tracking-wide">
        🔥 <span className="font-bold">TOP 20&nbsp;:</span> Nos meilleurs codes promo du moment
        <span className="hidden sm:inline"> &nbsp;|&nbsp; Économisez jusqu&apos;à -70%</span>
        &nbsp;&nbsp;
        <Link href="/top-codes-promo" className="underline underline-offset-2 font-bold hover:text-white/80">Voir les offres →</Link>
      </div>

      {/* Main header */}
      <header className="bg-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[64px] flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="1" width="6" height="4" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
                <rect x="3" y="5" width="10" height="10" rx="2" fill="white"/>
                <rect x="7" y="8" width="2" height="4" rx="1" fill="#C0392B"/>
              </svg>
            </div>
            <span className="text-[22px] font-extrabold tracking-tight">
              <span className="text-white">lock</span>
              <span className="text-primary">coupon</span>
            </span>
          </Link>

          {/* Nav links — desktop (homepage has its own hero search) */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-semibold rounded-full px-3 py-2 transition-colors ${
                    active
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-primary' : ''}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search bar — non-home pages only */}
          <div className={`${pathname === '/' ? 'hidden' : 'hidden sm:flex lg:hidden xl:flex'} flex-1 max-w-[360px] mx-4`} ref={searchRef} role="search" aria-label="Rechercher une boutique">
            <div className="relative w-full">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (results.length > 0) setShowResults(true); }}
                placeholder="Rechercher une boutique..."
                aria-label="Rechercher une boutique"
                className="w-full bg-white rounded-full pl-5 pr-12 py-2.5 text-[14px] text-text-main outline-none placeholder:text-muted"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#777" strokeWidth="2">
                  <circle cx="7" cy="7" r="5"/>
                  <path d="M11 11l3 3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Search results dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border overflow-hidden z-[60]">
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
                          <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-lg object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px] font-bold" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                            {store.logo_letter || store.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-text-main text-[14px] font-semibold">{store.name}</p>
                          <p className="text-muted text-[11px]">{store.description}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={() => { setShowModal(true); setStatus('idle'); setErrorMsg(''); }}
              className="flex items-center gap-2 whitespace-nowrap text-white/70 hover:text-white text-[14px] font-medium border border-white/20 hover:border-white/40 rounded-full px-5 py-2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Connexion ou inscription
            </button>
            <Link
              href="/ajouter-code"
              className="bg-primary hover:bg-primary-dark whitespace-nowrap text-white text-[14px] font-bold rounded-full px-5 py-2 transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1v12M1 7h12" strokeLinecap="round"/></svg>
              Ajouter un code
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-auto text-white p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#222] border-t border-white/10 px-4 py-4 space-y-3">
            <div className="sm:hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une boutique..."
                className="w-full bg-white/10 text-white rounded-full pl-4 pr-4 py-2.5 text-[14px] outline-none placeholder:text-white/40 border border-white/10"
              />
              {query.length > 0 && results.length > 0 && (
                <div className="mt-2 bg-white/10 rounded-xl overflow-hidden">
                  {results.map((store) => (
                    <Link
                      key={store.id}
                      href={`/codes-promo/${store.slug}`}
                      onClick={() => { setMenuOpen(false); setQuery(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-7 h-7 rounded-md object-contain" />
                      ) : (
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-bold" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                          {store.logo_letter || store.name[0]}
                        </div>
                      )}
                      <span className="text-white text-[14px]">{store.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-2.5 text-white/70 hover:text-white text-[15px] py-2" onClick={() => setMenuOpen(false)}>
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setShowModal(true); setStatus('idle'); setErrorMsg(''); setMenuOpen(false); }}
              className="w-full text-center bg-primary text-white font-semibold text-[14px] py-2.5 rounded-full mt-2"
            >
              S&apos;inscrire
            </button>
          </div>
        )}
      </header>

      {/* Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-scale-in">
            <div className="bg-primary px-6 py-5 text-center">
              <div className="text-[28px] mb-1">📬</div>
              <h2 className="text-white text-[20px] font-bold">Restez informé !</h2>
              <p className="text-white/70 text-[14px] mt-1">Recevez les meilleurs codes promo directement dans votre boîte mail.</p>
            </div>
            <div className="p-6">
              {status === 'success' ? (
                <div className="text-center py-4">
                  <div className="text-[40px] mb-3">✅</div>
                  <h3 className="text-text-main text-[18px] font-bold mb-1">Merci !</h3>
                  <p className="text-muted text-[14px]">Vous êtes maintenant inscrit à notre newsletter.</p>
                  <button onClick={() => setShowModal(false)} className="mt-5 bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors">Fermer</button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-text-main text-[13px] font-semibold mb-1.5">Votre email</label>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }} placeholder="exemple@email.com" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
                    {status === 'error' && <p className="text-red-500 text-[12px] mt-1.5">{errorMsg}</p>}
                  </div>
                  <button onClick={handleSubmit} disabled={status === 'loading'} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3 rounded-lg transition-colors disabled:opacity-60">
                    {status === 'loading' ? 'Inscription...' : "S'inscrire gratuitement"}
                  </button>
                  <p className="text-muted text-[11px] text-center mt-3">Pas de spam. Désabonnement en 1 clic.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
