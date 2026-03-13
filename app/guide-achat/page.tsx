import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import { getAllStores } from '@/lib/supabase';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guide d'achat — Conseils pour économiser | LockCoupon",
  description: "Retrouvez nos guides d'achat par catégorie pour économiser sur vos achats en ligne. Mode, tech, sport, beauté, voyage et plus.",
};

const CATEGORIES = [
  {
    name: 'Mode & Vêtements',
    emoji: '👗',
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
    emoji: '💻',
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
    emoji: '⚽',
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
    emoji: '💄',
    color: '#9C27B0',
    description: 'Sephora, Yves Rocher, Nocibé et plus',
    slugs: ['sephora', 'nocibe', 'yves-rocher', 'marionnaud', 'aroma-zone'],
    tips: [
      "Les coffrets cadeaux offrent un meilleur rapport qualité/prix",
      "Profitez des échantillons gratuits à chaque commande",
      "Les ventes privées beauté offrent jusqu'à 30% de réduction",
    ],
  },
  {
    name: 'Voyage & Hôtels',
    emoji: '✈️',
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
    emoji: '🏠',
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
    emoji: '🛒',
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
    emoji: '👜',
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

  return (
    <>
      <Navbar />

      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="text-white/40 text-[13px] mb-4">Accueil &rsaquo; Guide d&apos;achat</div>
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
              <div key={cat.name} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                {/* Header */}
                <div className="px-6 py-5 flex items-center gap-4" style={{ borderBottom: `3px solid ${cat.color}` }}>
                  <span className="text-[36px]">{cat.emoji}</span>
                  <div>
                    <h2 className="text-text-main text-[20px] font-extrabold">{cat.name}</h2>
                    <p className="text-muted text-[13px]">{cat.description}</p>
                  </div>
                </div>

                {/* Store logos */}
                <div className="px-6 py-4 flex flex-wrap gap-3">
                  {catStores.slice(0, 6).map((store) => (
                    <Link key={store.id} href={`/codes-promo/${store.slug}`} className="group" title={store.name}>
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-contain border border-border group-hover:scale-110 transition-transform" />
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
                  <h3 className="text-text-main text-[14px] font-bold mb-2">💡 Astuces pour économiser</h3>
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
              </div>
            );
          })}
        </div>
      </section>

      <FAQ />
      <Footer />
    </>
  );
}
