/**
 * Hand-written editorial content for priority stores.
 *
 * Why this exists (GSC July 2026): the template-variant generator in
 * storeContent.ts shares each phrasing variant across ~20 stores, which is
 * still too close to boilerplate for Google on high-competition queries.
 * The pages that collapsed (temu -64%, shein -99%, hm -99% impressions)
 * need content no other coupon site — and no other LockCoupon page — has.
 *
 * Every block below is written specifically for ONE store, describes that
 * store's real promo mechanics (coupon bundles, member programs, points,
 * cashback…), and interpolates live Supabase stats so the copy stays fresh
 * between ISR revalidations.
 *
 * Stores present here override the generated content in storeContent.ts;
 * all other stores keep the generator. Pure TS, importable from server and
 * client components. Type-only import from storeContent → no runtime cycle.
 */

import type { StoreStats, FaqItem, AboutSection } from './storeContent';

export interface StoreEditorial {
  /** Hero/about lead paragraph — must interpolate live stats. */
  intro: (s: StoreStats) => string;
  /** Custom meta description (CTR rescue) — keep ≤ 160 chars if possible. */
  metaDescription: (s: StoreStats) => string;
  /** Store-specific body sections (rendered after intro + DB description). */
  about: (s: StoreStats) => AboutSection[];
  /** Store-specific FAQ items (stat-driven generated items are appended). */
  faq: (s: StoreStats) => FaqItem[];
  /** Optional replacement for the generated tips block. */
  tips?: (s: StoreStats) => { icon: string; tip: string }[];
}

const nbOffres = (s: StoreStats) =>
  `${s.offerCount} offre${s.offerCount > 1 ? 's' : ''}`;

export const EDITORIAL: Record<string, StoreEditorial> = {
  /* ────────────────────────────── TEMU ────────────────────────────── */
  temu: {
    intro: (s) =>
      `Temu ne fonctionne comme aucune autre boutique : les remises y tombent par vagues — packs de coupons de 100€ fractionnés par paliers, roue à coupons dans l'application, codes réservés aux nouveaux comptes et offres éclair renouvelées plusieurs fois par jour. Résultat : la moitié des codes qui circulent sur les réseaux sont expirés ou liés à un profil précis. Sur cette page, notre équipe maintient ${nbOffres(s)} Temu réellement actives en ${s.month}${s.bestDiscount ? `, avec une remise maximale vérifiée de ${s.bestDiscount}` : ''} — chaque code indique s'il vise les nouveaux clients, les clients existants ou l'application uniquement.`,
    metaDescription: (s) =>
      `${s.codeCount > 0 ? `${s.codeCount} codes promo Temu` : `${s.offerCount} offres Temu`} testés en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''}. Nouveaux clients, packs coupons 100€, astuces appli : le tri est fait, copiez le bon code.`,
    about: (s) => [
      {
        heading: 'Comment fonctionnent vraiment les codes promo Temu',
        text: `Temu distingue trois familles de remises, et c'est la source de 90% des codes « qui ne marchent pas ». D'abord les offres nouveaux clients : les plus généreuses (jusqu'à -50% sur le premier panier), mais elles ne s'appliquent qu'à un compte fraîchement créé, jamais utilisé pour commander. Ensuite les packs de coupons — les fameux « 100€ de coupons Temu » : il ne s'agit pas de 100€ déduits d'un coup, mais d'un lot de bons fractionnés (par exemple -10€ dès 50€, -25€ dès 120€…) à consommer sur plusieurs commandes. Enfin les codes clients existants, plus rares, souvent poussés par notification dans l'application. ${s.codeCount > 0 ? `Les ${s.codeCount} codes listés ici précisent leur famille — vérifiez que la vôtre correspond avant de conclure qu'un code est mort.` : ''}`,
      },
      {
        heading: 'Application ou site web : où sont les meilleures remises Temu ?',
        text: `L'application mobile, sans discussion. Temu y réserve la roue à coupons de bienvenue, les ventes flash horaires et une partie des packs de coupons ; le site web n'en affiche qu'une fraction. Notre protocole de test : repérer l'offre sur cette page, copier le code, puis finaliser la commande dans l'application avec le code collé au moment du paiement. Les prix étant identiques entre site et appli, seul l'accès aux coupons change. Attention également aux horaires : les ventes flash Temu les plus agressives tombent entre 8h et 10h puis 14h et 16h, heure française.`,
      },
      {
        heading: 'Les pièges à éviter avec les promos Temu',
        text: `Les prix barrés de Temu sont souvent théâtraux : un « -80% » calculé sur un prix de référence gonflé peut cacher une remise réelle de 20%. Avant de valider, comparez le prix final avec la même référence ailleurs (AliExpress ou Amazon Marketplace vendent parfois le même article). Méfiez-vous aussi des codes « influenceurs » partagés en masse sur TikTok : la plupart sont des liens de parrainage déguisés qui ne réduisent rien du tout. Les codes de cette page sont testés en caisse, sur un vrai panier, avant publication — et retirés dès qu'ils expirent.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Pourquoi mon code promo Temu ne fonctionne pas ?',
        answer: `Trois causes couvrent presque tous les cas : le code est réservé aux nouveaux clients et votre compte a déjà commandé ; le code appartient à un pack de coupons avec minimum d'achat par palier (ex. -25€ valable seulement dès 120€ de panier) ; ou le code est exclusif à l'application et vous commandez depuis le navigateur. Vérifiez la mention affichée sous chaque code de cette page — elle précise la condition exacte.`,
      },
      {
        question: 'Les packs « 100€ de coupons Temu » sont-ils réels ?',
        answer: `Oui, mais pas comme la publicité le laisse croire : c'est un lot de bons fractionnés à utiliser sur plusieurs commandes, chacun avec son minimum d'achat. Personne ne déduit 100€ d'un panier de 110€. Bien utilisés (paniers groupés juste au-dessus de chaque palier), ils restent l'un des meilleurs plans Temu pour un gros achat réparti en deux ou trois commandes.`,
      },
      {
        question: 'Temu livre-t-il gratuitement en France ?',
        answer: `La livraison standard est gratuite sur la quasi-totalité des commandes, sans minimum la plupart du temps, en 6 à 11 jours ouvrés. Temu crédite même un bon de compensation si le colis dépasse la date annoncée. La livraison express, plus rapide, devient gratuite au-delà d'un seuil de panier variable selon les périodes.`,
      },
      {
        question: 'Faut-il créer un nouveau compte pour profiter des offres Temu ?',
        answer: `Les remises de bienvenue (roue à coupons, premier panier jusqu'à -50%) exigent effectivement un compte neuf. En revanche, multiplier les comptes sur le même appareil ou la même adresse viole les conditions de Temu et fait sauter les coupons. La bonne approche : épuiser les offres nouveau client, puis basculer sur les codes clients existants de cette page, réapprovisionnés à chaque mise à jour.`,
      },
    ],
    tips: (s) => [
      { icon: '🎡', tip: `Ouvrez l'application Temu avant de payer : la roue à coupons et les offres éclair in-app se cumulent souvent avec ${s.codeCount > 0 ? 'les codes de cette page' : 'les promos affichées'}.` },
      { icon: '🛒', tip: `Technique du panier abandonné : laissez votre panier Temu 24 à 48h sans valider — l'algorithme relance très fréquemment avec un coupon de rattrapage.` },
      { icon: '📦', tip: `Avec un pack de coupons fractionné, groupez vos achats juste au-dessus de chaque palier (ex. panier à 52€ pour un bon « -10€ dès 50€ ») : c'est là que le rendement est maximal.` },
      { icon: '⏰', tip: `Les ventes flash Temu les plus intéressantes tombent entre 8h-10h et 14h-16h heure française, et le dimanche soir pour les liquidations de fin de semaine.` },
    ],
  },

  /* ────────────────────────────── SHEIN ───────────────────────────── */
  shein: {
    intro: (s) =>
      `Chez SHEIN, le code promo n'est que la moitié de l'équation : la plateforme superpose points de fidélité, ventes flash triquotidiennes, remises app-exclusives et cashback — et la plupart de ces leviers se cumulent au même paiement. En ${s.month}, cette page suit ${nbOffres(s)} SHEIN vérifiée${s.offerCount > 1 ? 's' : ''}${s.bestDiscount ? ` (jusqu'à ${s.bestDiscount})` : ''}, du bon d'inscription au cashback permanent, avec les conditions exactes de chacune. Objectif : que vous ne payiez jamais le prix affiché sur shein.com.`,
    metaDescription: (s) =>
      `${nbOffres(s)} SHEIN vérifiées en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''} : codes, points cumulables, cashback et livraison offerte dès 29€. Conditions réelles testées, sans codes morts.`,
    about: (s) => [
      {
        heading: 'Codes SHEIN + points fidélité : le cumul que presque personne n\u2019utilise',
        text: `SHEIN crédite des points sur chaque commande, chaque avis déposé (avec photo, le bonus grimpe) et via les check-ins quotidiens dans l'application. 100 points = 1€, déductibles en caisse EN PLUS d'un code promo : c'est l'un des rares e-commerçants où le cumul code + fidélité est officiellement autorisé. Un panier de 60€ avec un code -10%${s.bestDiscount && s.bestDiscount !== '10%' ? ` (ou mieux : jusqu'à ${s.bestDiscount} selon les offres du moment)` : ''} et 800 points descend à 46€. Déposez systématiquement vos avis photo après chaque commande : c'est 10 à 15€ de points récupérés par an pour un client régulier.`,
      },
      {
        heading: 'Quand SHEIN casse vraiment les prix',
        text: `Trois rendez-vous dominent le calendrier SHEIN : l'anniversaire de la marque (fin mai-juin, les remises les plus profondes de l'année), le 11.11 et le Black Friday. Entre ces pics, les ventes flash quotidiennes tournent par créneaux — matin, midi et soir — avec des remises réelles de 50 à 70% sur des sélections courtes. Les codes génériques (type -15% dès X€ d'achat) fonctionnent toute l'année mais leurs paliers changent : ceux publiés ici sont re-testés à chaque passage de vérification.`,
      },
      {
        heading: 'Tailles, retours et frais : ce qu\u2019il faut savoir avant de commander',
        text: `La livraison SHEIN devient gratuite dès 29€ d'achat (offre listée plus haut quand elle est active) — en dessous, comptez environ 4€. Le premier retour de chaque commande est gratuit sous 35 jours, les suivants sont facturés : groupez vos renvois en un seul colis. Côté tailles, fiez-vous au tableau de mensurations propre à chaque article plutôt qu'à votre taille habituelle : les coupes varient fortement d'un fabricant à l'autre, et les avis clients avec photos signalent presque toujours si un modèle taille petit.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Comment obtenir -15% ou plus sur SHEIN ?',
        answer: `Trois pistes fiables : les codes génériques vérifiés de cette page (paliers type -15% dès 29€), l'offre d'inscription à la newsletter pour la première commande, et le programme étudiant (via vérification du statut) qui accorde une remise permanente. Les codes qui promettent -40% sur tout le site sans condition sont, eux, presque toujours faux ou expirés.`,
      },
      {
        question: 'Peut-on cumuler un code promo SHEIN avec les points fidélité ?',
        answer: `Oui — c'est même la meilleure stratégie SHEIN : appliquez d'abord le code promo, puis déduisez vos points (100 points = 1€) sur le même paiement. Les points se gagnent via les commandes, les avis avec photo et les check-ins quotidiens dans l'application. Seule limite : un seul code promo par commande.`,
      },
      {
        question: 'Le cashback SHEIN, comment ça marche ?',
        answer: `Le cashback (autour de 5%) passe par des plateformes partenaires : vous activez le tracking avant d'ouvrir shein.com, commandez normalement, et le pourcentage est crédité après validation de la commande. Il se cumule avec un code promo appliqué en caisse, mais peut être refusé si vous passez par une autre extension de coupons au même moment — n'activez qu'un seul tracker.`,
      },
      {
        question: 'Les ventes flash SHEIN sont-elles de vraies remises ?',
        answer: `Majoritairement oui, car elles portent sur des sélections courtes et tournent plusieurs fois par jour — mais le prix barré peut être ancien. Réflexe utile : la remise flash s'ajoute rarement aux codes promo ; comparez le prix flash sans code au prix normal avec code avant de choisir. Sur les basiques, le code générique gagne souvent.`,
      },
    ],
    tips: (s) => [
      { icon: '📸', tip: `Déposez un avis photo après chaque commande SHEIN : les points crédités (100 pts = 1€) se déduisent en caisse en plus des codes promo.` },
      { icon: '📱', tip: `Faites le check-in quotidien dans l'application quelques jours avant une grosse commande : les points et coupons in-app s'accumulent vite.` },
      { icon: '📏', tip: `Vérifiez le tableau de mensurations de chaque article (pas votre taille habituelle) et les photos d'avis clients : c'est le meilleur antidote aux retours payants.` },
      { icon: '🗓️', tip: `Gardez vos gros paniers pour l'anniversaire SHEIN (fin mai-juin), le 11.11 et le Black Friday — les remises y dépassent nettement les codes du reste de l'année.` },
    ],
  },

  /* ─────────────────────────────── H&M ────────────────────────────── */
  hm: {
    intro: (s) =>
      `La vraie mécanique promo de H&M ne ressemble pas à celle des autres enseignes de mode : l'essentiel des avantages passe par le programme membre gratuit — remise de bienvenue, livraison offerte dès 20€, bons d'anniversaire, ventes privées — et par le recyclage en magasin qui rapporte des bons d'achat. En ${s.month}, ${nbOffres(s)} H&M ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} sur cette page${s.bestDiscount ? `, jusqu'à ${s.bestDiscount} de remise` : ''}, chacune avec sa condition exacte (membre, panier minimum, première commande).`,
    metaDescription: (s) =>
      `${nbOffres(s)} H&M vérifiées en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''} : -10% membre, livraison dès 20€, bon 5€ recyclage. Le programme membre décrypté, conditions réelles.`,
    about: (s) => [
      {
        heading: 'Le programme membre H&M : la clé de presque toutes les remises',
        text: `Gratuit et immédiat, le statut membre H&M déclenche à lui seul la majorité des offres de cette page : -10% sur la première commande, livraison offerte dès 20€ (contre un seuil bien plus haut sinon), retours gratuits, bons d'anniversaire et accès anticipé aux soldes. Les points accumulés (1 point par euro) se transforment en bons de réduction par paliers. Concrètement : créer son compte membre avant de commander est plus rentable que la plupart des codes promo H&M qui circulent — et les deux se combinent quand une offre chiffrée est active${s.bestDiscount ? ` (jusqu'à ${s.bestDiscount} actuellement)` : ''}.`,
      },
      {
        heading: 'Recyclage en magasin : 5€ de bon contre un sac de vêtements',
        text: `Le programme « H&M Take Care / Let's Close the Loop » échange chaque sac de textiles déposé en caisse — toutes marques, tout état — contre un bon de réduction (5€ dès 25€ d'achat en général, le format exact varie selon les campagnes). C'est cumulable avec le statut membre, répétable, et cela reste l'astuce H&M la plus sous-utilisée en France : deux sacs par an couvrent quasiment une tenue.`,
      },
      {
        heading: 'Quand acheter chez H&M pour payer le juste prix',
        text: `H&M pratique un rythme de démarques très lisible : soldes réglementaires (janvier et fin juin) avec des deuxièmes et troisièmes démarques agressives, ventes mid-season réservées aux membres (avril et octobre), et une section « Offres » en ligne alimentée toute l'année. Les basiques (t-shirts, jeans, sous-vêtements) passent rarement sous -30%, mais les pièces de collection perdent 50 à 70% en fin de saison. Si un article vous plaît sans urgence, placez-le en favori : l'application notifie les baisses de prix des membres.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Comment obtenir -10% chez H&M ?',
        answer: `Devenez membre H&M (gratuit, deux minutes) : la remise de bienvenue de 10% s'applique à votre première commande en ligne, et s'ajoute à la livraison offerte dès 20€ réservée aux membres. L'offre correspondante figure en tête de cette page quand elle est active — aucun code à taper, la remise se déclenche via le compte.`,
      },
      {
        question: 'La livraison H&M est-elle gratuite ?',
        answer: `Pour les membres, oui dès 20€ d'achat (offre vérifiée sur cette page). Sans compte membre, le seuil est nettement plus élevé — raison de plus pour créer le compte gratuit avant de commander. Le retrait en magasin est gratuit sans minimum, et les retours en boutique ne coûtent rien.`,
      },
      {
        question: 'Peut-on utiliser un code promo H&M en magasin ?',
        answer: `Les codes « web » ne passent pas en caisse physique, mais les bons membres (anniversaire, paliers de points, bons recyclage) s'utilisent en magasin via l'application H&M, section Membre. Le bon de 5€ contre un sac de vêtements recyclés se remet directement en caisse, lui, sans passer par l'appli.`,
      },
      {
        question: 'Le cashback fonctionne-t-il chez H&M ?',
        answer: `Oui, un cashback d'environ 3% est régulièrement disponible via les plateformes partenaires (offre listée plus haut quand elle est active). Il se cumule avec le statut membre et les bons H&M : activez le tracking avant d'ouvrir hm.com, puis payez normalement. Les crédits apparaissent après expédition de la commande.`,
      },
    ],
    tips: (s) => [
      { icon: '👤', tip: `Créez le compte membre H&M avant toute commande : -10% de bienvenue + livraison dès 20€ + retours gratuits, c'est la base de toutes les économies chez H&M.` },
      { icon: '♻️', tip: `Déposez un sac de vêtements usagés (toutes marques) en caisse : bon de 5€ à valoir dès 25€ — répétable et cumulable avec votre statut membre.` },
      { icon: '❤️', tip: `Mettez vos articles en favoris dans l'application : H&M notifie les membres quand le prix baisse, très efficace en période de démarques successives.` },
      { icon: '🏷️', tip: `Visez les ventes mid-season membres (avril/octobre) et les 2e démarques des soldes : les pièces de collection y perdent 50 à 70%, bien plus qu'avec n'importe quel code.` },
    ],
  },
};

export function getEditorial(slug: string): StoreEditorial | null {
  return EDITORIAL[slug] ?? null;
}
