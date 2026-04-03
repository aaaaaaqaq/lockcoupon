'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: "Qu'est-ce qu'un code promo ?",
    answer: "Un code promo est une combinaison de lettres et/ou de chiffres que vous pouvez saisir lors de votre achat en ligne pour bénéficier d'une réduction. Il peut s'agir d'un pourcentage de remise, d'un montant fixe offert, de la livraison gratuite ou d'un cadeau avec votre commande.",
  },
  {
    question: "Comment utiliser un code promo sur LockCoupon ?",
    answer: "C'est très simple ! Trouvez la boutique qui vous intéresse, cliquez sur \"Voir le code\" pour révéler le code promo. Il est automatiquement copié dans votre presse-papiers. Rendez-vous ensuite sur le site de la boutique, ajoutez vos articles au panier, et collez le code dans le champ prévu lors du paiement.",
  },
  {
    question: "Les codes promo sont-ils vraiment gratuits ?",
    answer: "Oui, 100% gratuit ! LockCoupon est un service entièrement gratuit. Vous n'avez rien à payer pour accéder à nos codes promo et réductions. Nous nous rémunérons grâce à des commissions versées par les boutiques partenaires, sans aucun surcoût pour vous.",
  },
  {
    question: "Comment savoir si un code promo fonctionne ?",
    answer: "Tous nos codes sont vérifiés régulièrement par notre équipe. Vous pouvez repérer les codes fonctionnels grâce au badge \"Vérifié\" affiché sur chaque offre. Nous affichons également le taux de succès et le nombre d'utilisations récentes pour vous aider à choisir le meilleur code.",
  },
  {
    question: "Puis-je utiliser plusieurs codes promo en même temps ?",
    answer: "En général, la plupart des boutiques n'acceptent qu'un seul code promo par commande. Cependant, vous pouvez souvent cumuler un code promo avec les soldes ou les promotions en cours sur le site. Nous vous conseillons de tester le code qui offre la meilleure réduction.",
  },
  {
    question: "À quelle fréquence les codes promo sont-ils mis à jour ?",
    answer: "Notre équipe met à jour les codes promo quotidiennement. Nous ajoutons de nouvelles offres chaque jour et supprimons les codes expirés pour vous garantir des réductions toujours valides. Inscrivez-vous à notre newsletter pour recevoir les meilleurs bons plans directement dans votre boîte mail.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="bg-primary-light/50 border-t border-border">
      <div className="max-w-[800px] mx-auto px-4 py-10 md:py-14">
        <h2 className="text-text-main text-[24px] md:text-[30px] font-extrabold text-center mb-8">
          Questions fréquentes
        </h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-text-main text-[15px] md:text-[16px] font-semibold pr-4">
                  {item.question}
                </span>
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

              {/* Always render answer in DOM for SEO, toggle visibility with CSS */}
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

      {/* FAQPage structured data for homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
