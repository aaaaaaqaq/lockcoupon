import { Store } from '@/lib/supabase';

interface HowToSchemaProps {
  store: Store;
}

export default function HowToSchema({ store }: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Comment utiliser un code promo ${store.name}`,
    description: `Guide étape par étape pour utiliser un code promo ${store.name} et économiser sur vos achats en ligne.`,
    totalTime: 'PT2M',
    step: [
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
