import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';

export const revalidate = 60;

const month = () => new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

function monthYearCap(): string {
  const s = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateMetadata(): Metadata {
  return {
    title: `Amazon Prime Day 2026 — Bons Plans & Codes Promo`,
    description: `Amazon Prime Day 2026 en France : dates, meilleures offres, astuces pour en profiter sans rien payer de plus. Codes promo Amazon vérifiés en ${monthYearCap()}.`,
    alternates: { canonical: 'https://www.lockcoupon.com/codes-promo/amazon/prime-day' },
    openGraph: {
      title: 'Amazon Prime Day 2026 — Bons Plans & Codes Promo',
      description: 'Dates, offres et astuces pour le Prime Day Amazon en France. Guide complet.',
      url: '/codes-promo/amazon/prime-day',
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export default async function AmazonPrimeDayPage() {
  const store = await getStoreBySlug('amazon');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = month();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: "C'est quand le Prime Day Amazon 2026 ?", acceptedAnswer: { '@type': 'Answer', text: "Le Prime Day Amazon a lieu chaque année à la mi-juillet et dure généralement 2 à 4 jours. Les dates officielles sont annoncées par Amazon quelques semaines avant l'événement. Consultez cette page régulièrement : nous la mettons à jour dès que les dates sont confirmées." } },
      { '@type': 'Question', name: 'Faut-il être membre Prime pour profiter du Prime Day ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, les offres Prime Day sont réservées aux membres Amazon Prime. Astuce : l'essai gratuit de 30 jours donne accès à toutes les offres Prime Day. Vous pouvez vous inscrire juste avant l'événement et résilier ensuite sans frais." } },
      { '@type': 'Question', name: 'Peut-on utiliser un code promo Amazon pendant le Prime Day ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, certains codes promo et coupons Amazon restent cumulables avec les offres Prime Day, notamment les coupons à cocher sur les fiches produits et les offres de remise au premier abonnement de services Amazon." } },
      { '@type': 'Question', name: 'Comment repérer les vraies bonnes affaires du Prime Day ?', acceptedAnswer: { '@type': 'Answer', text: "Vérifiez l'historique de prix avec un comparateur (Keepa, CamelCamelCamel), méfiez-vous des prix barrés artificiels, et concentrez-vous sur les produits Amazon (Echo, Kindle, Fire TV) qui affichent les remises les plus fortes, souvent -50% et plus." } },
      { '@type': 'Question', name: 'Les ventes flash Prime Day sont-elles limitées ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, les ventes flash ont un stock limité et expirent en quelques heures. Ajoutez les produits qui vous intéressent à votre liste d'envies avant l'événement et activez les notifications de l'application Amazon pour être alerté." } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Amazon', item: 'https://www.lockcoupon.com/codes-promo/amazon' },
      { '@type': 'ListItem', position: 3, name: 'Prime Day', item: 'https://www.lockcoupon.com/codes-promo/amazon/prime-day' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-16 text-center">
            <nav className="text-white/40 text-[13px] mb-4">
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/amazon" className="hover:text-white/60">Amazon</Link> → Prime Day
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              Amazon <span className="text-primary">Prime Day 2026</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Dates, bons plans et astuces pour en profiter au maximum — {m}
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Prime Day 2026 : ce qu&apos;il faut savoir
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Le Prime Day est le plus gros événement promotionnel d&apos;Amazon, devant même le Black Friday sur certaines catégories.
                Il a lieu chaque année à la <strong>mi-juillet</strong> et dure de 2 à 4 jours. Pendant l&apos;événement, des dizaines de milliers
                de produits passent en promotion, avec des remises qui atteignent régulièrement <strong>-50% à -70%</strong> sur les appareils Amazon
                (Echo, Kindle, Fire TV, Ring) et de fortes réductions sur la tech, l&apos;électroménager et la mode.
              </p>
              <p>
                Condition indispensable : être membre <strong>Amazon Prime</strong>. Si vous ne l&apos;êtes pas, l&apos;essai gratuit de 30 jours
                donne accès à toutes les offres — inscrivez-vous quelques jours avant l&apos;événement, profitez des promos, et résiliez ensuite
                si l&apos;abonnement ne vous intéresse pas. C&apos;est autorisé et sans frais.
              </p>
              <p>
                Notre équipe <Link href="/" className="text-primary hover:underline">LockCoupon</Link> suit les offres Amazon toute l&apos;année.
                Cette page est mise à jour en continu pendant la période du Prime Day.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              {coupons.length > 0 ? `${coupons.length} offres Amazon disponibles en ${m}` : `Offres Amazon en ${m}`}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 8).map((c) => (
                <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-text-main text-[15px] font-semibold">{c.title}</p>
                    {c.expiry_date && <p className="text-muted text-[12px] mt-1">Expire le {new Date(c.expiry_date).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <Link href="/codes-promo/amazon" className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0">
                    Voir le code
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mb-10">
              <Link href="/codes-promo/amazon" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                Voir tous les codes Amazon →
              </Link>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              5 astuces pour maximiser le Prime Day
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>1. Préparez votre liste d&apos;envies.</strong> Ajoutez dès maintenant les produits qui vous intéressent.
                Pendant l&apos;événement, l&apos;application Amazon vous alerte quand un article de votre liste passe en promotion.
              </p>
              <p>
                <strong>2. Vérifiez l&apos;historique des prix.</strong> Certains « prix barrés » sont gonflés artificiellement avant l&apos;événement.
                Des outils gratuits comme Keepa ou CamelCamelCamel affichent l&apos;évolution réelle du prix sur 12 mois.
              </p>
              <p>
                <strong>3. Ciblez les appareils Amazon.</strong> Echo Dot, Kindle, Fire TV Stick, Ring : ce sont systématiquement
                les remises les plus fortes du Prime Day, souvent au prix le plus bas de l&apos;année.
              </p>
              <p>
                <strong>4. Surveillez les ventes flash.</strong> Les meilleures offres partent en quelques heures.
                Consultez la page des ventes flash plusieurs fois par jour pendant l&apos;événement.
              </p>
              <p>
                <strong>5. Cumulez avec les coupons.</strong> De nombreuses fiches produits Amazon proposent des coupons à cocher,
                cumulables avec les prix Prime Day. Consultez aussi nos <Link href="/codes-promo/amazon" className="text-primary hover:underline">codes promo Amazon</Link> avant de finaliser votre commande.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Prime Day 2026
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: "C'est quand le Prime Day 2026 ?", a: "Les mardi 14 et mercredi 15 juillet 2026, de 00h01 à 23h59. Certaines offres avant-première sur les appareils Amazon démarrent quelques jours avant pour les membres Prime." },
                { q: 'Faut-il être membre Prime ?', a: "Oui, mais l'essai gratuit de 30 jours suffit pour accéder à toutes les offres. Résiliation possible sans frais." },
                { q: 'Peut-on utiliser un code promo pendant le Prime Day ?', a: 'Oui, les coupons à cocher sur les fiches produits et certaines offres de services Amazon restent cumulables.' },
                { q: 'Comment éviter les fausses promos ?', a: "Vérifiez l'historique de prix avec Keepa ou CamelCamelCamel avant d'acheter." },
                { q: 'Les stocks sont-ils limités ?', a: "Oui, surtout les ventes flash. Utilisez la liste d'envies et les notifications de l'app Amazon pour ne rien rater." },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Pour aller plus loin, lisez notre guide complet : <Link href="/blog/prime-day-amazon-2026-dates-offres-astuces" className="text-primary hover:underline font-semibold">Prime Day Amazon 2026 : dates, meilleures offres et astuces</Link>.
              Retrouvez aussi tous nos <Link href="/codes-promo/amazon" className="text-primary hover:underline">codes promo Amazon</Link>,
              le <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link> du moment,
              et parcourez <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link> pour d&apos;autres bons plans.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
