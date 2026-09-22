import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Comment nous vérifions les codes promo — Méthodologie LockCoupon',
  description:
    'Notre méthode de collecte, de contrôle et de retrait des codes promo : sources utilisées, file de relecture, dates de validité, liens affiliés et politique de correction.',
  alternates: { canonical: 'https://www.lockcoupon.com/comment-nous-verifions' },
};

const SOURCES = ['Dealabs', 'Ma-Reduc', 'Savoo', 'PlanReduc', 'Radins.com', 'iGraal', 'Poulpeo', 'eBuyClub'];

export default function MethodologyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Comment nous vérifions les codes promo',
    url: 'https://www.lockcoupon.com/comment-nous-verifions',
    description: metadata.description,
    publisher: { '@type': 'Organization', name: 'LockCoupon', url: 'https://www.lockcoupon.com' },
  };

  return (
    <>
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav aria-label="Fil d'Ariane" className="max-w-[800px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Comment nous vérifions</li>
          </ol>
        </nav>

        <article className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
          <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-4">Comment nous vérifions les codes promo</h1>
          <p className="text-muted text-[15px] mb-8">
            Cette page décrit précisément d&apos;où viennent les offres publiées sur LockCoupon, comment elles sont contrôlées,
            quand elles sont retirées, et comment nous gagnons de l&apos;argent. Dernière révision de cette politique : 22 septembre 2026.
          </p>

          <div className="text-muted text-[15px] leading-relaxed space-y-5">
            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">1. D&apos;où viennent les offres</h2>
            <p>
              Nous ne créons pas de codes. Chaque offre provient de l&apos;une de ces trois sources :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-text-main">Programmes officiels des marchands</strong> : codes de bienvenue et offres partenaires transmis par les boutiques ou leurs plateformes d&apos;affiliation (c&apos;est le cas, par exemple, des codes Temu de notre pool partenaire).</li>
              <li><strong className="text-text-main">Agrégateurs français reconnus</strong> : nos outils relèvent quotidiennement les codes publiés sur {SOURCES.slice(0, -1).join(', ')} et {SOURCES.at(-1)}. Un code relevé n&apos;est publié que si nous disposons de l&apos;URL exacte de la page où il a été vu.</li>
              <li><strong className="text-text-main">Contributions des visiteurs</strong> via <Link href="/ajouter-code" className="text-primary hover:underline">la page « Ajouter un code »</Link>, qui passent systématiquement par notre file de relecture.</li>
            </ul>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">2. Ce que signifie le badge « Vérifié »</h2>
            <p>
              Un code porte le badge <strong className="text-text-main">Vérifié</strong> lorsqu&apos;il a été retrouvé, à la date indiquée sur la fiche boutique,
              sur au moins une source de confiance avec une date de validité cohérente. Ce n&apos;est pas une garantie que le code
              fonctionnera sur votre panier : la plupart des codes ont des conditions (montant minimum, première commande, sélection de produits)
              que nous reportons dans la fiche « Détails et conditions » quand la source les indique.
            </p>
            <p>
              Un code trouvé <em>sans</em> URL source sur un site de confiance n&apos;est pas publié : il est placé dans une file de relecture et attend une décision humaine.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">3. Dates affichées</h2>
            <p>
              La mention « Dernière vérification le … » d&apos;une page boutique correspond à la date réelle du dernier ajout ou du dernier
              contrôle d&apos;une offre de cette boutique dans notre base — pas à la date du jour. Si une page n&apos;a pas bougé depuis une
              semaine, la date affichée a une semaine. Chaque offre affiche également sa date d&apos;expiration lorsqu&apos;elle est connue ;
              à défaut, nous appliquons une durée de validité par défaut de 21 jours, puis l&apos;offre est retirée si elle n&apos;a pas été retrouvée entre-temps.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">4. Retrait des offres</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Toute offre dont la date d&apos;expiration est dépassée est supprimée automatiquement chaque matin.</li>
              <li>Chaque boutique est plafonnée à 12 codes et 10 bons plans actifs : au-delà, les plus anciens sont retirés.</li>
              <li>Une boutique sans aucune offre active est retirée de nos plans de site et de nos pages « catégories » jusqu&apos;au retour d&apos;une offre, pour ne pas vous faire perdre de temps.</li>
              <li>Vous pouvez nous signaler un code qui ne fonctionne plus depuis la <Link href="/contact" className="text-primary hover:underline">page contact</Link> : nous le retirons ou le corrigeons sous 48 h ouvrées.</li>
            </ul>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">5. Rédaction et outils automatisés</h2>
            <p>
              Les descriptions d&apos;offres et une partie des guides du blog sont rédigés avec l&apos;aide d&apos;outils d&apos;intelligence artificielle,
              à partir des conditions relevées sur les sources citées ci-dessus, puis relus par notre équipe. Les fiches éditoriales des
              boutiques les plus consultées (Temu, Amazon, Shein, Zara, H&amp;M, Adidas, LDLC, Airbnb…) sont écrites à la main. Nous ne publions
              pas de compteur d&apos;utilisations ni de « nombre de personnes ayant utilisé ce code » : nous ne disposons pas de cette donnée.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">6. Comment nous gagnons de l&apos;argent</h2>
            <p>
              LockCoupon est gratuit. Certains liens « Voir le code » ou « Voir l&apos;offre » sont des liens d&apos;affiliation : si vous achetez
              après avoir cliqué, la boutique nous reverse une commission, sans surcoût pour vous. Cette rémunération ne modifie ni l&apos;ordre
              des offres (le meilleur pourcentage ou montant est affiché en premier) ni notre décision de publier ou retirer un code.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">7. Qui sommes-nous</h2>
            <p>
              LockCoupon est édité par une petite équipe indépendante basée en France, lancée en 2026. Nous ne sommes affiliés à aucun
              des marchands listés. Pour toute question, correction ou partenariat :{' '}
              <a href="mailto:partnerships@lockcoupon.com" className="text-primary hover:underline">partnerships@lockcoupon.com</a>.
            </p>
          </div>

          <nav aria-label="Pages associées" className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3 text-[13px]">
            <Link href="/a-propos" className="text-primary hover:underline font-semibold">→ À propos</Link>
            <Link href="/boutiques" className="text-primary hover:underline font-semibold">→ Toutes les boutiques</Link>
            <Link href="/contact" className="text-primary hover:underline font-semibold">→ Signaler un code</Link>
            <Link href="/politique-de-confidentialite" className="text-primary hover:underline font-semibold">→ Confidentialité</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
