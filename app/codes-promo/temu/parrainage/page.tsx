import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Code Parrainage Temu — Juin 2026',
  description: 'Code parrainage Temu : parrainez vos amis et gagnez des crédits. Guide complet du programme de parrainage Temu.',
  alternates: { canonical: '/codes-promo/temu/parrainage' },
  openGraph: {
    title: 'Code Parrainage Temu',
    description: 'Programme de parrainage Temu : comment ça marche, combien vous gagnez.',
    url: '/codes-promo/temu/parrainage',
    siteName: 'LockCoupon',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function TemuParrainagePage() {
  const store = await getStoreBySlug('temu');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Comment fonctionne le parrainage Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Le parrain partage son lien ou code de parrainage avec ses amis. Quand un filleul s\'inscrit et passe sa première commande via ce lien, les deux parties reçoivent des récompenses (crédits, coupons ou réductions).' } },
      { '@type': 'Question', name: 'Combien peut-on gagner avec le parrainage Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Les récompenses varient selon les périodes. En général, le parrain reçoit entre 5€ et 20€ de crédits par filleul, et le filleul bénéficie d\'une réduction sur sa première commande.' } },
      { '@type': 'Question', name: 'Où trouver mon code de parrainage Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Ouvrez l\'application Temu, allez dans votre profil, puis cherchez la section "Inviter des amis" ou "Parrainage". Votre lien et code de parrainage personnalisé s\'y trouvent.' } },
      { '@type': 'Question', name: 'Y a-t-il une limite au nombre de parrainages Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Temu n\'impose pas de limite stricte au nombre de parrainages. Cependant, les conditions et récompenses peuvent évoluer. Consultez les conditions du programme dans l\'application.' } },
      { '@type': 'Question', name: 'Le parrainage Temu est-il cumulable avec les codes promo ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, les crédits de parrainage sont généralement cumulables avec les codes promo. Le filleul peut utiliser un code promo en plus de la réduction de parrainage sur sa première commande.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Temu', item: 'https://www.lockcoupon.com/codes-promo/temu' },
      { '@type': 'ListItem', position: 3, name: 'Parrainage', item: 'https://www.lockcoupon.com/codes-promo/temu/parrainage' },
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
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/temu" className="hover:text-white/60">Temu</Link> → Parrainage
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              Code Parrainage <span className="text-primary">Temu</span> — {m}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Invitez vos amis sur Temu et gagnez des crédits. Guide complet.
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Le parrainage Temu, c&apos;est quoi exactement ?
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Le programme de parrainage Temu permet de gagner des récompenses en invitant vos proches à rejoindre la plateforme. Le principe est simple : vous partagez votre lien ou code de parrainage, votre ami s&apos;inscrit et passe une commande, et vous recevez tous les deux des avantages. C&apos;est gagnant-gagnant.
              </p>
              <p>
                Concrètement, le parrain reçoit entre 5€ et 20€ de crédits par filleul (le montant varie selon les campagnes en cours). Le filleul, lui, bénéficie d&apos;une réduction spéciale sur sa première commande — souvent encore plus avantageuse qu&apos;un simple code promo. C&apos;est l&apos;un des meilleurs moyens d&apos;économiser sur Temu.
              </p>
              <p>
                Entre nous, Temu est extrêmement généreux sur le parrainage parce que c&apos;est leur principal canal d&apos;acquisition de nouveaux clients. Ils préfèrent vous payer vous plutôt que Facebook ou Google. Autant en profiter.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Comment parrainer sur Temu — Étape par étape
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { n: '1', title: 'Trouvez votre lien', desc: 'Ouvrez l\'app Temu → Profil → "Inviter des amis". Copiez votre lien personnel.' },
                { n: '2', title: 'Partagez-le', desc: 'Envoyez votre lien par WhatsApp, SMS, email ou réseaux sociaux à vos proches.' },
                { n: '3', title: 'Votre ami s\'inscrit', desc: 'Votre filleul clique sur le lien, crée son compte et passe sa première commande.' },
                { n: '4', title: 'Récoltez les récompenses', desc: 'Vous recevez vos crédits et votre ami profite de sa réduction de bienvenue.' },
              ].map((step) => (
                <div key={step.n} className="bg-white border border-border rounded-xl p-5 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 bg-primary text-white rounded-full flex items-center justify-center text-[18px] font-bold">{step.n}</div>
                  <h3 className="text-text-main text-[15px] font-bold mb-2">{step.title}</h3>
                  <p className="text-muted text-[13px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Combien peut-on gagner ?
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Les récompenses de parrainage Temu changent régulièrement. Voici ce qui est généralement proposé :
              </p>
              <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-semibold text-text-main">Pour le parrain</span>
                  <span className="text-primary font-bold">5€ à 20€ de crédits</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-semibold text-text-main">Pour le filleul</span>
                  <span className="text-primary font-bold">30% à 50% de réduction</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-semibold text-text-main">Bonus jeux in-app</span>
                  <span className="text-primary font-bold">Jusqu&apos;à 100€ de coupons</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-main">Limite de parrainages</span>
                  <span className="text-primary font-bold">Pas de limite</span>
                </div>
              </div>
              <p>
                Petit secret : les récompenses sont souvent plus élevées lors des périodes de forte promotion (11.11, Black Friday, soldes d&apos;été). Si vous comptez parrainer plusieurs personnes, attendez ces périodes pour maximiser vos gains.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Astuces pour maximiser vos gains de parrainage
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Combinez avec un code promo.</strong> Le filleul peut souvent utiliser un <Link href="/codes-promo/temu" className="text-primary hover:underline">code promo Temu</Link> en plus de la réduction de parrainage. Conseillez-lui de vérifier nos codes avant sa commande.
              </p>
              <p>
                <strong>Partagez au bon moment.</strong> Envoyez votre lien quand vos amis parlent de vouloir acheter quelque chose en ligne. Un conseil ciblé vaut mieux que du spam.
              </p>
              <p>
                <strong>Utilisez les réseaux sociaux.</strong> Partagez vos bonnes affaires Temu sur Instagram Stories ou TikTok avec votre lien de parrainage. Les gens achètent quand ils voient le produit en vrai.
              </p>
              <p>
                <strong>Participez aux événements in-app.</strong> Temu propose régulièrement des événements de parrainage avec des bonus supplémentaires (roue de la fortune, coupons bonus, etc.). Surveillez les notifications dans l&apos;app.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Codes promo Temu disponibles — {m}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 6).map((c) => (
                <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-text-main text-[15px] font-semibold">{c.title}</p>
                    <p className="text-muted text-[12px] mt-1">{c.usage_count || 0} utilisations</p>
                  </div>
                  <Link href="/codes-promo/temu" className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0">
                    Voir le code
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mb-10">
              <Link href="/codes-promo/temu" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                Tous les codes promo Temu →
              </Link>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Parrainage Temu
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'Comment fonctionne le parrainage Temu ?', a: 'Partagez votre lien, votre ami s\'inscrit et commande, vous recevez tous les deux des récompenses.' },
                { q: 'Combien gagne-t-on par parrainage ?', a: 'Entre 5€ et 20€ de crédits par filleul, selon les campagnes en cours.' },
                { q: 'Où trouver mon code de parrainage ?', a: 'Dans l\'app Temu : Profil → Inviter des amis. Votre lien personnalisé s\'y trouve.' },
                { q: 'Y a-t-il une limite de parrainages ?', a: 'Non, pas de limite stricte. Les conditions peuvent évoluer selon les campagnes.' },
                { q: 'C\'est cumulable avec les codes promo ?', a: 'Oui, les crédits de parrainage sont généralement cumulables avec les codes promo LockCoupon.' },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Voir aussi : <Link href="/codes-promo/temu/nouveau-client" className="text-primary hover:underline">codes promo Temu nouveau client</Link>,{' '}
              <Link href="/codes-promo/temu/livraison-gratuite" className="text-primary hover:underline">livraison gratuite Temu</Link>,{' '}
              <Link href="/blog" className="text-primary hover:underline">nos articles</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
