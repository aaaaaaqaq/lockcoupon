'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FilterTabs from '@/components/FilterTabs';
import CouponCard from '@/components/CouponCard';
import CouponPopup from '@/components/CouponPopup';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { Store, Coupon } from '@/lib/supabase';

interface StorePageClientProps {
  store: Store;
  coupons: Coupon[];
}

function StoreFAQSection({ store, coupons }: { store: Store; coupons: Coupon[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const codeCoupons = coupons.filter((c) => c.type === 'code');
  const bestDiscount = coupons.reduce((max, c) => {
    const val = c.discount_value ? parseInt(c.discount_value) : 0;
    return val > max ? val : max;
  }, 0);

  const faqItems = [
    {
      question: `Comment utiliser un code promo ${store.name} ?`,
      answer: `Pour utiliser un code promo ${store.name}, trouvez l'offre qui vous intéresse sur LockCoupon et cliquez sur "Voir le code". Le code est automatiquement copié. Rendez-vous ensuite sur le site ${store.name}, ajoutez vos articles au panier, puis collez le code promo dans le champ dédié lors de l'étape de paiement. La réduction s'applique instantanément à votre commande.`,
    },
    {
      question: `Combien de codes promo ${store.name} sont disponibles en ${month} ?`,
      answer: `En ${month}, nous avons ${coupons.length} offres ${store.name} vérifiées sur LockCoupon, dont ${codeCoupons.length} codes promo actifs. Notre équipe vérifie et met à jour ces offres quotidiennement pour vous garantir des réductions valides.`,
    },
    {
      question: `Quelle est la meilleure réduction ${store.name} en ce moment ?`,
      answer: bestDiscount > 0
        ? `La meilleure réduction ${store.name} actuellement disponible sur LockCoupon peut atteindre jusqu'à ${bestDiscount}%. Consultez la liste ci-dessus pour voir toutes les offres classées par pertinence et vérifiez les conditions de chaque code promo.`
        : `Plusieurs bons plans ${store.name} sont actuellement disponibles sur LockCoupon. Consultez la liste ci-dessus pour découvrir toutes les réductions en cours, incluant la livraison gratuite et les offres spéciales.`,
    },
    {
      question: `Les codes promo ${store.name} sur LockCoupon sont-ils fiables ?`,
      answer: `Oui, tous les codes promo ${store.name} référencés sur LockCoupon sont vérifiés par notre équipe. Chaque offre affiche un badge "Vérifié" ainsi que le nombre d'utilisations récentes, ce qui vous permet de choisir en toute confiance. Les codes expirés sont retirés automatiquement.`,
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
          Questions fréquentes sur les codes promo {store.name}
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <h3 className="text-text-main text-[15px] md:text-[16px] font-semibold pr-4">
                  {item.question}
                </h3>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`shrink-0 text-muted transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                >
                  <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Always in DOM for SEO crawlers */}
              <div
                className={`px-5 overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
                }`}
              >
                <p className="text-muted text-[14px] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreAboutSection({ store, coupons }: { store: Store; coupons: Coupon[] }) {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <section className="bg-bg border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
            Codes promo {store.name} — {month}
          </h2>
          <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-3">
            <p>
              Retrouvez sur cette page toutes les réductions et codes promo {store.name} vérifiés par l&apos;équipe LockCoupon. 
              Nous proposons actuellement <strong>{coupons.length} offres actives</strong> pour {store.name}, 
              {totalUsage > 0 && <> utilisées par plus de <strong>{totalUsage.toLocaleString('fr-FR')} personnes</strong></>}. 
              Chaque code est testé régulièrement pour garantir son fonctionnement.
            </p>
            <p>
              Pour profiter d&apos;une réduction {store.name}, il vous suffit de copier le code promo de votre choix, 
              de vous rendre sur le site officiel {store.name}, d&apos;ajouter vos articles au panier et de coller le code 
              dans le champ prévu lors du paiement. La remise s&apos;applique immédiatement. Pensez à vérifier les conditions 
              d&apos;utilisation de chaque offre (montant minimum, catégories éligibles, date d&apos;expiration).
            </p>
            {store.description && (
              <p>
                <strong>À propos de {store.name} :</strong> {store.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StorePageClient({ store, coupons }: StorePageClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
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
      <HeroSection store={store} coupons={coupons} onOpenBest={openBestOffer} />
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      {/* Coupon list */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} onOpenPopup={openPopup} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-[16px]">Aucun coupon trouvé dans cette catégorie.</p>
          </div>
        )}
      </section>

      {/* SEO content sections */}
      <StoreAboutSection store={store} coupons={coupons} />
      <StoreFAQSection store={store} coupons={coupons} />

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
