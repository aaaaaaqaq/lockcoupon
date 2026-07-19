import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import { getAllStores } from '@/lib/supabase';
import { IconShirt, IconLaptop, IconDumbbell, IconSparkles, IconPlane, IconHome, IconCart, IconBag, IconBulb } from '@/components/icons';

export const revalidate = 60;


export const metadata: Metadata = {
  title: "Guide d'Achat par Catégorie",
  description: "Nos guides d'achat par catégorie : mode, tech, sport, beauté, voyage et maison. Conseils pratiques et astuces pour économiser sur chaque achat.",
  alternates: {
    canonical: 'https://www.lockcoupon.com/guide-achat',
  },
  openGraph: {
    title: "Guide d'Achat par Catégorie",
    description: "Nos guides d'achat par catégorie : mode, tech, sport, beauté, voyage et maison. Conseils pratiques et astuces pour économiser sur chaque achat.",
    url: '/guide-achat',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

const CATEGORIES = [
  {
    name: 'Mode & Vêtements',
    icon: <IconShirt size={30} />,
    color: '#E91E63',
    description: 'Shein, Zara, H&M, ASOS et plus',
    slugs: ['shein', 'zara', 'hm', 'asos', 'mango', 'boohoo', 'prettylittlething', 'zalando', 'la-redoute', 'kiabi', 'uniqlo', 'bershka', 'pull-and-bear', 'stradivarius', 'etam'],
    tips: [
      "Inscrivez-vous aux newsletters pour recevoir 10-15% de réduction",
      "Achetez pendant les soldes et le Black Friday pour les meilleures offres",
      "Utilisez les programmes fidélité pour cumuler des points",
    ],
  },
  {
    name: 'High-Tech & Électronique',
    icon: <IconLaptop size={30} />,
    color: '#2196F3',
    description: 'Samsung, Apple, Fnac, Darty et plus',
    slugs: ['samsung', 'apple', 'xiaomi', 'fnac', 'darty', 'boulanger', 'ldlc', 'back-market', 'cdiscount', 'rue-du-commerce'],
    tips: [
      "Comparez les prix entre les sites avant d'acheter",
      "Le reconditionné (Back Market) offre jusqu'à 70% d'économie",
      "Attendez les French Days et le Black Friday pour le high-tech",
    ],
  },
  {
    name: 'Sport & Outdoor',
    icon: <IconDumbbell size={30} />,
    color: '#4CAF50',
    description: 'Nike, Adidas, Decathlon, Puma et plus',
    slugs: ['nike', 'adidas', 'puma', 'decathlon', 'new-balance', 'foot-locker', 'jd-sports', 'reebok', 'asics', 'the-north-face', 'timberland'],
    tips: [
      "Les outlets en ligne offrent jusqu'à 50% sur les collections précédentes",
      "Les réductions étudiants sont disponibles chez Nike et Adidas",
      "Inscrivez-vous aux programmes membres pour des offres exclusives",
    ],
  },
  {
    name: 'Beauté & Parfums',
    icon: <IconSparkles size={30} />,
    color: '#9C27B0',
    description: 'Sephora, Yves Rocher, Nocibé et plus',
    slugs: ['sephora', 'nocibe-fr', 'yves-rocher', 'marionnaud', 'aroma-zone'],
    tips: [
      "Les coffrets cadeaux offrent un meilleur rapport qualité/prix",
      "Profitez des échantillons gratuits à chaque commande",
      "Les ventes privées beauté offrent jusqu'à 30% de réduction",
    ],
  },
  {
    name: 'Voyage & Hôtels',
    icon: <IconPlane size={30} />,
    color: '#FF9800',
    description: 'Booking, Expedia, Airbnb et plus',
    slugs: ['booking', 'expedia', 'airbnb', 'lastminute'],
    tips: [
      "Réservez à l'avance pour les meilleurs tarifs",
      "Utilisez le mode incognito pour éviter les hausses de prix",
      "Les programmes fidélité (Genius, etc.) offrent 10-20% de réduction",
    ],
  },
  {
    name: 'Maison & Déco',
    icon: <IconHome size={30} />,
    color: '#795548',
    description: 'IKEA, Leroy Merlin, Maisons du Monde et plus',
    slugs: ['ikea', 'leroy-merlin', 'castorama', 'conforama', 'maisons-du-monde', 'but'],
    tips: [
      "Les coins bonnes affaires en magasin cachent de vraies pépites",
      "Le mobilier d'exposition est souvent soldé à -30%",
      "Comparez les prix en ligne avant de vous déplacer en magasin",
    ],
  },
  {
    name: 'Marketplace & Généraliste',
    icon: <IconCart size={30} />,
    color: '#F44336',
    description: 'Amazon, Temu, AliExpress, eBay et plus',
    slugs: ['amazon', 'temu', 'aliexpress', 'ebay', 'cdiscount', 'rakuten'],
    tips: [
      "Utilisez les comparateurs de prix pour trouver le meilleur deal",
      "Les abonnements premium (Prime, CDAV) rentabilisent dès 3-4 commandes/an",
      "Vérifiez les avis avant d'acheter sur les marketplaces",
    ],
  },
  {
    name: 'Luxe & Premium',
    icon: <IconBag size={30} />,
    color: '#000000',
    description: 'Galeries Lafayette, Lacoste, Ralph Lauren et plus',
    slugs: ['galeries-lafayette', 'printemps', 'lacoste', 'ralph-lauren', 'tommy-hilfiger', 'calvin-klein', 'massimo-dutti'],
    tips: [
      "Les ventes privées offrent les meilleures réductions sur le luxe",
      "Les outlets proposent les collections précédentes à -40%",
      "Achetez hors saison pour les meilleurs prix",
    ],
  },
];

export default async function GuideAchatPage() {
  const stores = await getAllStores();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: "Guide d'achat", item: 'https://www.lockcoupon.com/guide-achat' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12">
            <nav aria-label="Fil d'Ariane" className="mb-4">
              <ol className="flex items-center gap-1.5 text-[13px] text-white/40">
                <li><Link href="/" className="hover:text-white/70">Accueil</Link></li>
                <li aria-hidden="true">›</li>
                <li className="text-white/80">Guide d&apos;achat</li>
              </ol>
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-3">
              Guide d&apos;achat <span className="text-primary">LockCoupon</span>
            </h1>
            <p className="text-white/50 text-[15px] max-w-2xl">
              Nos conseils et astuces pour économiser dans chaque catégorie. Trouvez les meilleurs bons plans et apprenez à utiliser vos codes promo efficacement.
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map((cat) => {
              const catStores = stores.filter(s => cat.slugs.includes(s.slug));
              return (
                <article key={cat.name} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                  {/* Header */}
                  <div className="px-6 py-5 flex items-center gap-4" style={{ borderBottom: `3px solid ${cat.color}` }}>
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl shrink-0" style={{ color: cat.color, backgroundColor: `${cat.color}1A` }}>{cat.icon}</span>
                    <div>
                      <h2 className="text-text-main text-[20px] font-extrabold">{cat.name}</h2>
                      <p className="text-muted text-[13px]">{cat.description}</p>
                    </div>
                  </div>

                  {/* Store logos */}
                  <div className="px-6 py-4 flex flex-wrap gap-3">
                    {catStores.slice(0, 6).map((store) => (
                      <Link key={store.id} href={`/codes-promo/${store.slug}`} className="group" title={`Code promo ${store.name}`}>
                        {store.logo_url ? (
                          <Image src={store.logo_url} alt={`Logo ${store.name}`} width={40} height={40} className="w-10 h-10 rounded-lg object-contain border border-border group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[14px] font-bold group-hover:scale-110 transition-transform" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                            {store.logo_letter || store.name[0]}
                          </div>
                        )}
                      </Link>
                    ))}
                    {catStores.length > 6 && (
                      <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center text-muted text-[12px] font-bold">
                        +{catStores.length - 6}
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  <div className="px-6 pb-5">
                    <h3 className="flex items-center gap-1.5 text-text-main text-[14px] font-bold mb-2"><IconBulb size={15} className="text-amber-500" /> Astuces pour économiser</h3>
                    <ul className="space-y-1.5">
                      {cat.tips.map((tip, i) => (
                        <li key={i} className="text-muted text-[13px] flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-5">
                    <Link
                      href="/boutiques"
                      className="inline-flex items-center gap-1 text-primary text-[13px] font-bold hover:underline"
                    >
                      Voir toutes les boutiques {cat.name.toLowerCase()} →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SEO content (issue 7) + cross-links (issue 8) */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Comment bien utiliser nos guides d&apos;achat ?
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Nos guides d&apos;achat sont organisés par catégorie pour vous aider à trouver rapidement les meilleures offres
                dans votre domaine d&apos;intérêt. Chaque catégorie inclut les boutiques partenaires les plus populaires, ainsi
                que des astuces concrètes testées par notre équipe pour maximiser vos économies. Pensez à combiner ces
                conseils avec nos <Link href="/top-codes-promo" className="text-primary hover:underline">codes promo du moment</Link>.
              </p>
              <p>
                Retrouvez toutes nos boutiques sur la <Link href="/boutiques" className="text-primary hover:underline">page boutiques</Link>,
                ou consultez le <Link href="/blog" className="text-primary hover:underline">blog LockCoupon</Link> pour des articles détaillés
                sur les meilleures stratégies d&apos;achat en ligne.
              </p>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
