import { Store } from '@/lib/supabase';

interface HowToSchemaProps {
  store: Store;
  /** Editorial store-specific steps ({title, desc}); falls back to the
   *  generic 3 steps. Must mirror the visible how-to section. */
  steps?: { title: string; desc: string }[];
}

export default function HowToSchema({ store, steps }: HowToSchemaProps) {
  const customSteps = steps && steps.length >= 3
    ? steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        // Editorial titles carry a "1. " prefix for the visible cards — strip it here.
        name: s.title.replace(/^\d+\.\s*/, ''),
        text: s.desc,
        ...(i === 0 ? { url: `https://www.lockcoupon.com/codes-promo/${store.slug}` } : {}),
      }))
    : null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Comment utiliser un code promo ${store.name}`,
    description: `Guide étape par étape pour utiliser un code promo ${store.name} et économiser sur vos achats en ligne.`,
    totalTime: 'PT2M',
    step: customSteps || [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Trouvez votre code promo',
        text: `Rendez-vous sur la page ${store.name} de LockCoupon et parcourez les codes promo disponibles. Choisissez l'offre qui correspond le mieux à vos achats.`,
        url: `https://www.lockcoupon.com/codes-promo/${store.slug}`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Copiez le code',
        text: `Cliquez sur "Voir le code" pour révéler et copier automatiquement le code promo ${store.name} dans votre presse-papier.`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Appliquez la réduction',
        text: `Rendez-vous sur ${store.name}, ajoutez vos articles au panier, puis collez le code promo dans le champ dédié lors du paiement. La réduction s'applique instantanément.`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
