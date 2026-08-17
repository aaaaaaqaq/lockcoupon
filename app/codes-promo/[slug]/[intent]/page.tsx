/**
 * Programmatic intent pages — /codes-promo/[store]/[intent]
 *
 * Owns long-tail intent queries ("code promo X première commande",
 * "livraison gratuite X", "soldes X 2026", "code promo X déjà client")
 * where Bing/AI-search ranks new pages within days. One unique, dated,
 * answer-first page per store × intent, generated from live coupon data
 * (lib/intentContent.ts) — same anti-thin-content machinery as store hubs.
 *
 * Hand-written static pages (e.g. /codes-promo/temu/nouveau-client) shadow
 * this dynamic route automatically; SUPPRESSED_INTENTS also keeps redundant
 * combos out of hub links and the sitemap.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnswerBox from '@/components/AnswerBox';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/site';
import {
  INTENTS,
  isSuppressed,
  intentAvailable,
  intentIndexable,
  intentTitle,
  intentDescription,
  intentAnswer,
  intentSections,
  intentFaqItems,
  splitCouponsByIntent,
} from '@/lib/intentContent';

export const revalidate = 300;

interface Props {
  params: { slug: string; intent: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const intent = INTENTS[params.intent];
  if (!intent || isSuppressed(params.slug, params.intent)) return {};

  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const coupons = await getCouponsByStoreId(store.id).catch(() => []);
  // Thin-page gate: <2 matching offers ⇒ page still renders (never 404 an
  // indexed URL) but flips to noindex,follow until offers come back.
  // Quality gate: template-content stores (no storeEditorial entry) keep
  // their intent pages noindexed — they rank pos 60-90 and only drag the
  // site average (GSC Aug 2026). See intentIndexable() for the rationale.
  const available = intentAvailable(coupons, intent) && intentIndexable(params.slug);
  const title = intentTitle(store, intent);
  const description = intentDescription(store, intent, coupons);
  const canonical = absoluteUrl(`/codes-promo/${params.slug}/${params.intent}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: available ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function IntentPage({ params }: Props) {
  const intent = INTENTS[params.intent];
  if (!intent || isSuppressed(params.slug, params.intent)) notFound();

  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();

  const coupons = await getCouponsByStoreId(store.id);
  // Thin-page gate: below 2 matching offers the page is noindexed (see
  // generateMetadata) but still renders — 404ing an already-indexed URL
  // throws away Google traffic (seen with /back-market/soldes trending in GSC).
  const { matched, others } = splitCouponsByIntent(coupons, intent);
  const ordered = [...matched, ...others];
  const sections = intentSections(store, intent, coupons);
  const faqItems = intentFaqItems(store, intent, coupons);
  const answer = intentAnswer(store, intent, coupons);
  const monthLabel = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const hubUrl = `/codes-promo/${store.slug}`;
  const pageUrl = absoluteUrl(`${hubUrl}/${intent.slug}`);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: store.name, item: absoluteUrl(hubUrl) },
      { '@type': 'ListItem', position: 3, name: intent.label, item: pageUrl },
    ],
  };

  const siblings = Object.values(INTENTS).filter(
    (i) => i.slug !== intent.slug && !isSuppressed(store.slug, i.slug)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-14 text-center">
            <nav className="text-white/40 text-[13px] mb-4" aria-label="Fil d'Ariane">
              <Link href="/" className="hover:text-white/60">Accueil</Link>
              {' → '}
              <Link href={hubUrl} className="hover:text-white/60">{store.name}</Link>
              {' → '}{intent.label}
            </nav>
            <h1 className="text-white text-[26px] sm:text-[34px] md:text-[42px] font-extrabold leading-tight mb-3">
              Code Promo <span className="text-primary">{store.name} {intent.label}</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              {intent.icon} Offres vérifiées — {monthLabel}
            </p>
          </div>
        </section>

        {/* Answer-first block (GEO/AI-quotable) */}
        <AnswerBox store={store} coupons={ordered} intentLabel={intent.label} answer={answer} />

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
          <div className="max-w-[800px] mx-auto">
            {/* Offers */}
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              {ordered.length > 0
                ? `${ordered.length} offre${ordered.length > 1 ? 's' : ''} ${store.name} en ${monthLabel}`
                : `Offres ${store.name} — ${monthLabel}`}
            </h2>
            {ordered.length > 0 ? (
              <div className="space-y-3 mb-6">
                {ordered.slice(0, 10).map((c, i) => (
                  <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-text-main text-[15px] font-semibold">
                        {c.title}
                        {i < matched.length && (
                          <span className="ml-2 inline-block align-middle text-[11px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            {intent.icon} {intent.label}
                          </span>
                        )}
                      </p>
                      {c.expiry_date && (
                        <p className="text-muted text-[12px] mt-1">
                          Expire le {new Date(c.expiry_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <Link
                      href={hubUrl}
                      className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0"
                    >
                      Voir le code
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-[14px] leading-relaxed mb-6">
                Aucune offre {store.name} n&apos;est active en {monthLabel}. Cette page est vérifiée
                plusieurs fois par jour — ajoutez-la à vos favoris pour profiter de la prochaine remise.
              </p>
            )}
            <div className="text-center mb-10">
              <Link
                href={hubUrl}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors"
              >
                Voir tous les codes {store.name} →
              </Link>
            </div>

            {/* Editorial sections (unique per store × intent) */}
            {sections.map((section, i) => (
              <div key={i} className={i === 0 ? '' : 'mt-8'}>
                {section.heading && (
                  <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
                    {section.heading}
                  </h2>
                )}
                <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* FAQ — mirrored in FAQPage JSON-LD above */}
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — {store.name} {intent.label.toLowerCase()}
            </h2>
            <div className="space-y-3 mb-8">
              {faqItems.map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">
                    {item.question}
                  </summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>

            {/* Interlinks: sibling intents + hub */}
            <p className="text-muted text-[14px] leading-relaxed">
              À voir aussi :{' '}
              {siblings.map((s, i) => (
                <span key={s.slug}>
                  <Link href={`${hubUrl}/${s.slug}`} className="text-primary hover:underline">
                    {store.name} {s.label.toLowerCase()}
                  </Link>
                  {i < siblings.length - 1 ? ', ' : ''}
                </span>
              ))}
              {siblings.length > 0 ? ', ' : ''}
              tous les <Link href={hubUrl} className="text-primary hover:underline">codes promo {store.name}</Link>,
              et <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
