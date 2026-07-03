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
import { STORE_SUBPAGES } from '@/lib/storeSubpages';
import { bestDiscountLabel } from '@/lib/discount';

function frenchDate(): string {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface StorePageClientProps {
  store: Store;
  coupons: Coupon[];
}

function StoreFAQSection({ store, coupons }: { store: Store; coupons: Coupon[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const codeCoupons = coupons.filter((c) => c.type === 'code');
  const bestDiscount = bestDiscountLabel(coupons);

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
      answer: bestDiscount
        ? `La meilleure réduction ${store.name} actuellement disponible sur LockCoupon peut atteindre jusqu'à ${bestDiscount}. Consultez la liste ci-dessus pour voir toutes les offres classées par pertinence et vérifiez les conditions de chaque code promo.`
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
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
  const codeCoupons = coupons.filter((c) => c.type === 'code');
  const bestDiscount = bestDiscountLabel(coupons);

  return (
    <section className="bg-bg border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
            Codes promo {store.name} — {month}
          </h2>
          <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-3">
            {/* Unique stats intro — different for every store based on live data */}
            <p>
              En {month}, LockCoupon référence{' '}
              <strong>{coupons.length} offre{coupons.length !== 1 ? 's' : ''} active{coupons.length !== 1 ? 's' : ''}</strong>
              {' '}pour {store.name}
              {codeCoupons.length > 0 && (
                <>, dont <strong>{codeCoupons.length} code{codeCoupons.length !== 1 ? 's' : ''} promo</strong> à saisir au paiement</>
              )}
              {bestDiscount && (
                <> — avec des réductions allant jusqu&apos;à <strong>{bestDiscount}</strong></>
              )}
              {totalUsage > 0 && (
                <>, utilisées par plus de <strong>{totalUsage.toLocaleString('fr-FR')} personnes</strong></>
              )}
              . Toutes nos offres sont vérifiées et mises à jour quotidiennement.
            </p>

            {/* Store description as primary content when available, generic fallback otherwise */}
            {store.description ? (
              <p>{store.description}</p>
            ) : (
              <p>
                Retrouvez sur cette page toutes les réductions et codes promo {store.name} vérifiés par l&apos;équipe LockCoupon.
                Chaque code est testé régulièrement pour garantir son fonctionnement.
              </p>
            )}

            <p>
              Pour profiter d&apos;une réduction {store.name}, il vous suffit de copier le code promo de votre choix,
              de vous rendre sur le site officiel {store.name}, d&apos;ajouter vos articles au panier et de coller le code
              dans le champ prévu lors du paiement. La remise s&apos;applique immédiatement. Pensez à vérifier les conditions
              d&apos;utilisation de chaque offre (montant minimum, catégories éligibles, date d&apos;expiration).
            </p>

            <h3 className="text-text-main text-[17px] font-bold mt-6 mb-2">Types de codes promo {store.name} disponibles</h3>
            <p>
              Sur LockCoupon, vous trouverez différents types d&apos;offres {store.name} : des <strong>codes promo</strong> à saisir lors du paiement,
              des <strong>bons plans</strong> (réductions automatiques sans code), et parfois du <strong>cashback</strong> pour récupérer une partie de vos achats.
              Les codes promo sont les plus courants et offrent généralement les meilleures réductions.
            </p>

            <h3 className="text-text-main text-[17px] font-bold mt-6 mb-2">Quand utiliser un code promo {store.name} ?</h3>
            <p>
              Les meilleurs moments pour utiliser un code promo {store.name} sont pendant les périodes de soldes (janvier et juin),
              le Black Friday (fin novembre), le Cyber Monday, et les ventes privées. Cependant, LockCoupon propose des codes actifs toute l&apos;année.
              Pensez à vérifier cette page régulièrement pour ne pas manquer les dernières offres {store.name}.
            </p>

            <h3 className="text-text-main text-[17px] font-bold mt-6 mb-2">Garantie codes vérifiés</h3>
            <p>
              Chaque code promo {store.name} sur LockCoupon est vérifié par notre équipe. Nous testons les codes régulièrement et retirons ceux qui ne fonctionnent plus.
              Le nombre d&apos;utilisations affiché sur chaque code vous donne une indication de sa popularité et de sa fiabilité.
              Si un code ne fonctionne pas, essayez-en un autre — nous en avons toujours plusieurs actifs.
            </p>
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

        {/* Tips section */}
        <section className="bg-bg border-t border-border">
          <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
                Astuces pour économiser chez {store.name}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '📧', tip: `Inscrivez-vous à la newsletter ${store.name} pour recevoir des codes promo exclusifs directement dans votre boîte mail.` },
                  { icon: '🛒', tip: `Ajoutez vos articles au panier et attendez 24-48h avant de finaliser — ${store.name} envoie parfois un code de relance.` },
                  { icon: '📱', tip: `Téléchargez l'application ${store.name} si disponible : les promotions in-app sont souvent plus avantageuses.` },
                  { icon: '🔔', tip: `Revenez régulièrement sur LockCoupon — nos codes promo ${store.name} sont mis à jour chaque jour.` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-border rounded-xl p-4">
                    <span className="text-[24px] shrink-0">{item.icon}</span>
                    <p className="text-muted text-[14px] leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Store-specific subpages — SEO silo hub */}
        {STORE_SUBPAGES[store.slug] && (
          <section className="max-w-[1200px] mx-auto px-4 py-8" aria-label={`Offres ${store.name} par catégorie`}>
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
                Toutes les offres {store.name} par catégorie
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STORE_SUBPAGES[store.slug].map((sub) => (
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
