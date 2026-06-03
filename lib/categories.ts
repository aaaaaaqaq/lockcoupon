export interface Category {
  slug: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  storeSlugs: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'mode',
    name: 'Mode',
    title: 'Codes Promo Mode — Vêtements & Chaussures',
    description: 'Codes promo mode vérifiés : réductions sur les vêtements, chaussures et accessoires. Nike, ASOS, Zara, Shein et plus.',
    emoji: '👗',
    storeSlugs: ['adidas', 'asos', 'bershka', 'boohoo', 'bonprix', 'blancheporte', 'calvin-klein', 'camaieu', 'celio', 'converse', 'courir', 'daxon', 'galeries-lafayette', 'h-and-m', 'jules', 'kiabi', 'la-halle', 'la-redoute', 'mango', 'new-balance', 'nike', 'puma', 'shein', 'trois-suisses', 'zalando', 'zara'],
  },
  {
    slug: 'high-tech',
    name: 'High-Tech',
    title: 'Codes Promo High-Tech & Électronique',
    description: 'Codes promo tech vérifiés : smartphones, PC, TV, audio. Amazon, Fnac, Darty, Boulanger, Back Market.',
    emoji: '💻',
    storeSlugs: ['amazon', 'apple', 'back-market', 'boulanger', 'cdiscount', 'darty', 'fnac', 'samsung', 'dell', 'hp'],
  },
  {
    slug: 'maison',
    name: 'Maison & Déco',
    title: 'Codes Promo Maison & Décoration',
    description: 'Codes promo maison vérifiés : meubles, déco, électroménager. IKEA, Conforama, BUT, Maisons du Monde.',
    emoji: '🏠',
    storeSlugs: ['but', 'conforama', 'ikea', 'maisons-du-monde', 'leroy-merlin', 'alinea', 'made-com'],
  },
  {
    slug: 'beaute',
    name: 'Beauté & Santé',
    title: 'Codes Promo Beauté & Parfums',
    description: 'Codes promo beauté vérifiés : maquillage, soins, parfums. Sephora, Yves Rocher, Nocibé, Marionnaud.',
    emoji: '💄',
    storeSlugs: ['aroma-zone', 'marionnaud', 'nocibe', 'sephora', 'yves-rocher', 'douglas'],
  },
  {
    slug: 'voyage',
    name: 'Voyages & Sorties',
    title: 'Codes Promo Voyage & Hôtels',
    description: 'Codes promo voyage vérifiés : vols, hôtels, locations. Booking, Airbnb, Expedia, SNCF.',
    emoji: '✈️',
    storeSlugs: ['airbnb', 'booking', 'expedia', 'sncf', 'lastminute', 'opodo', 'pierre-et-vacances'],
  },
  {
    slug: 'sport',
    name: 'Sport & Fitness',
    title: 'Codes Promo Sport & Fitness',
    description: 'Codes promo sport vérifiés : équipement, vêtements. Decathlon, Nike, Adidas, Intersport.',
    emoji: '⚽',
    storeSlugs: ['adidas', 'asics', 'decathlon', 'go-sport', 'intersport', 'nike', 'puma', 'new-balance'],
  },
  {
    slug: 'alimentation',
    name: 'Alimentation & Courses',
    title: 'Codes Promo Alimentation & Supermarchés',
    description: 'Codes promo courses vérifiés : supermarchés, livraison repas. Carrefour, Auchan, Picard.',
    emoji: '🛒',
    storeSlugs: ['auchan', 'carrefour', 'picard', 'uber-eats', 'deliveroo', 'just-eat'],
  },
  {
    slug: 'marketplace',
    name: 'Marketplaces',
    title: 'Codes Promo Marketplaces — Temu, AliExpress, Amazon',
    description: 'Codes promo marketplaces vérifiés : les meilleures offres sur Temu, AliExpress, Amazon, Cdiscount.',
    emoji: '🏪',
    storeSlugs: ['aliexpress', 'amazon', 'cdiscount', 'ebay', 'rakuten', 'shein', 'temu', 'wish'],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoriesForStore(storeSlug: string): Category[] {
  return CATEGORIES.filter((c) => c.storeSlugs.includes(storeSlug));
}
