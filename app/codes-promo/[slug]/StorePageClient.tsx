'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FilterTabs from '@/components/FilterTabs';
import CouponCard from '@/components/CouponCard';
import CouponPopup from '@/components/CouponPopup';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { Store, Coupon } from '@/lib/supabase';
import { allSubpagesFor } from '@/lib/storeSubpages';
import AnswerBox from '@/components/AnswerBox';
import { storeFaqItems, storeAboutSections, storeTips, storeStats } from '@/lib/storeContent';

interface StorePageClientProps {
  store: Store;
  coupons: Coupon[];
}

function StoreFAQSection({ store, coupons }: { store: Store; coupons: Coupon[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Unique per-store FAQ (category-aware, live stats) — same generator feeds
  // the FAQPage JSON-LD in CouponSchema so schema always matches on-page text.
  const faqItems = storeFaqItems(store, coupons);

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
          Questions fréquentes sur les codes promo {store.name}
        </h2>
        <dl className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border overflow-hidden transition-all"
            >
              <dt>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="text-text-main text-[15px] md:text-[16px] font-semibold pr-4">
                    {item.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className={`shrink-0 text-muted transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                  >
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </dt>
              <dd
                className={`px-5 overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
                }`}
              >
                <p className="text-muted text-[14px] leading-relaxed">
                  {item.answer}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function StoreAboutSection({ store, coupons }: { store: Store; coupons: Coupon[] }) {
  const stats = storeStats(coupons);
  // Unique per-store editorial content: category-aware intro, buying guidance
  // and offer-type explainer built from this store's live data (thin-content fix).
  const aboutSections = storeAboutSections(store, coupons);

  return (
    <section className="bg-bg border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
            Codes promo {store.name} — {stats.month}
          </h2>
          <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-3">
            {aboutSections.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <h3 className="text-text-main text-[17px] font-bold mt-6 mb-2">{section.heading}</h3>
                )}
                <p>{section.text}</p>
              </div>
            ))}
            <p>
              Vous cherchez d&apos;autres bons plans ? Consultez le{' '}
              <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link>,
              notre <Link href="/guide-achat" className="text-primary hover:underline">guide d&apos;achat</Link>,
              ou parcourez <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StorePageClient({ store, coupons }: StorePageClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const subpages = allSubpagesFor(store.slug, store.name, coupons.length);
  const [popupCoupon, setPopupCoupon] = useState<Coupon | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const counts = {
    all: coupons.length,
    code: coupons.filter((c) => c.type === 'code').length,
    cashback: coupons.filter((c) => c.type === 'cashback').length,
    bon: coupons.filter((c) => c.type === 'bon').length,
  };

  const filtered =
    activeFilter === 'all'
      ? coupons
      : coupons.filter((c) => c.type === activeFilter);

  const openPopup = useCallback((coupon: Coupon) => {
    setPopupCoupon(coupon);
  }, []);

  const openBestOffer = useCallback(() => {
    const best = coupons.find((c) => c.is_best);
    if (best) setPopupCoupon(best);
  }, [coupons]);

  const handleCopy = useCallback(() => {
    setToastVisible(true);
  }, []);

  return (
    <>
      <Navbar />

      <main>
        <HeroSection store={store} coupons={coupons} onOpenBest={openBestOffer} />

        {/* Freshness signal */}
        <div className="max-w-[1200px] mx-auto px-4 pt-4 flex items-center gap-4 flex-wrap">
          <p className="text-muted text-[13px]">✅ Vérifié le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-muted text-[13px]">📊 {coupons.length} offres actives</p>
          <p className="text-muted text-[13px]">🔥 {coupons.reduce((s, c) => s + (c.usage_count || 0), 0).toLocaleString('fr-FR')} utilisations</p>
        </div>

        {/* Answer-first block — dated, self-contained, AI-search quotable */}
        <AnswerBox store={store} coupons={coupons} />

        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

        {/* Coupon list */}
        <section className="max-w-[1200px] mx-auto px-4 py-6" aria-label={`Codes promo ${store.name}`}>
          <div className="flex flex-col gap-4" role="list" aria-label={`${filtered.length} offres ${store.name}`}>
            {filtered.map((coupon) => (
              <div key={coupon.id} role="listitem">
                <CouponCard coupon={coupon} onOpenPopup={openPopup} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-[16px]">Aucun coupon trouvé dans cette catégorie.</p>
            </div>
          )}
        </section>

        {/* How-to steps */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
              Comment utiliser un code promo {store.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔍', title: '1. Choisissez votre code', desc: `Parcourez les ${coupons.length} offres ${store.name} ci-dessus et trouvez celle qui correspond à vos achats.` },
                { icon: '📋', title: '2. Copiez le code', desc: `Cliquez sur "Voir le code" pour le révéler. Il est automatiquement copié dans votre presse-papier.` },
                { icon: '✅', title: '3. Profitez de la réduction', desc: `Rendez-vous sur ${store.name}, remplissez votre panier et collez le code au moment du paiement.` },
              ].map((step, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-5 text-center">
                  <div className="text-[32px] mb-3">{step.icon}</div>
                  <h3 className="text-text-main text-[15px] font-bold mb-2">{step.title}</h3>
                  <p className="text-muted text-[13px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips section — category-aware, varies per store */}
        <section className="bg-bg border-t border-border">
          <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
                Astuces pour économiser chez {store.name}
              </h2>
              <div className="space-y-4">
                {storeTips(store, coupons).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-border rounded-xl p-4">
                    <span className="text-[24px] shrink-0">{item.icon}</span>
                    <p className="text-muted text-[14px] leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Store-specific subpages — SEO silo hub (manual + programmatic intents) */}
        {subpages.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-4 py-8" aria-label={`Offres ${store.name} par catégorie`}>
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
                Toutes les offres {store.name} par catégorie
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subpages.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="bg-white border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="text-[28px] mb-2">{sub.icon}</div>
                    <h3 className="text-text-main text-[15px] font-bold mb-1.5 group-hover:text-primary transition-colors">
                      {sub.title}
                    </h3>
                    <p className="text-muted text-[13px] leading-relaxed">{sub.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO content sections */}
        <StoreAboutSection store={store} coupons={coupons} />
        <StoreFAQSection store={store} coupons={coupons} />

        {/* Internal links */}
        <nav aria-label="Pages utiles" className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/guide-achat" className="text-primary text-[13px] font-semibold hover:underline">📖 Guide d&apos;achat</Link>
            <span className="text-muted">•</span>
            <Link href="/top-codes-promo" className="text-primary text-[13px] font-semibold hover:underline">🏆 Top codes promo</Link>
            <span className="text-muted">•</span>
            <Link href="/boutiques" className="text-primary text-[13px] font-semibold hover:underline">🏪 Toutes les boutiques</Link>
            <span className="text-muted">•</span>
            <Link href="/blog" className="text-primary text-[13px] font-semibold hover:underline">📝 Blog</Link>
          </div>
        </nav>
      </main>

      <Footer />

      {/* Popup */}
      <CouponPopup
        coupon={popupCoupon}
        store={store}
        onClose={() => setPopupCoupon(null)}
        onCopy={handleCopy}
      />

      {/* Toast */}
      <Toast
        message="Code copié dans le presse-papiers !"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
