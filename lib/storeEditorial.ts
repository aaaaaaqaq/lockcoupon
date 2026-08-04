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
  /* ────────────────────────────── ZARA ────────────────────────────── */
  zara: {
    intro: (s) =>
      `Disons-le franchement : Zara ne distribue quasiment jamais de codes promo — c'est une politique assumée de la marque, et les sites qui promettent « -30% sur tout Zara » recyclent des codes morts. Les vraies économies passent par d'autres leviers : les deux grandes périodes de démarques (janvier et fin juin) où les prix chutent de 50% et plus, les « special prices » permanents de l'application, et ${nbOffres(s)} vérifiée${s.offerCount > 1 ? 's' : ''} en ${s.month} sur cette page (livraison, retours, avantages nouveaux inscrits). Voici comment payer Zara au juste prix, sans courir après des codes fantômes.`,
    metaDescription: (s) =>
      `Zara ne fait presque jamais de codes promo : voici ce qui marche vraiment en ${s.month} — ${nbOffres(s)} vérifiée${s.offerCount > 1 ? 's' : ''}, dates des démarques, astuces app. Zéro code bidon.`,
    about: (s) => [
      {
        heading: 'Pourquoi il n\u2019y a (presque) jamais de code promo Zara',
        text: `Inditex, la maison mère de Zara, mise sur un modèle de rotation ultra-rapide des collections plutôt que sur les remises : les nouveautés partent en rayon toutes les deux semaines et se vendent à prix plein. Distribuer des codes casserait ce modèle. Les seules exceptions récurrentes : l'offre d'inscription à la newsletter quand elle est active (listée plus haut le cas échéant) et de rares opérations étudiantes. Toute page qui affiche dix « codes Zara -40% vérifiés aujourd'hui » vend du vent — nous préférons lister uniquement ce qui fonctionne réellement, même si c'est plus court.`,
      },
      {
        heading: 'Le vrai calendrier des remises Zara',
        text: `Deux rendez-vous concentrent l'essentiel : les soldes d'hiver (début janvier) et d'été (fin juin), avec des deuxièmes démarques 10 à 15 jours après le lancement qui font passer beaucoup de pièces sous -50%. Le stock s'évapore vite sur les tailles courantes : repérez vos articles avant le jour J et enregistrez-les en favoris dans l'application — Zara notifie quand un article favori passe en solde ou revient en stock. Entre les soldes, la section « Special Prices » du site regroupe les fins de série à prix réduit toute l'année.`,
      },
      {
        heading: 'Livraison, retours et Click & Collect : éviter tous les frais annexes',
        text: `La livraison à domicile devient gratuite dès 30€ d'achat ; en dessous, le retrait en magasin (Click & Collect) reste gratuit sans minimum — utile dans un pays où Zara a des boutiques partout. Les retours en magasin sont gratuits, alors que le retour par point relais est facturé sur la plupart des commandes : rapportez vos articles en boutique et l'achat Zara ne coûte jamais un centime de plus que le prix affiché.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Existe-t-il des codes promo Zara valides ?',
        answer: `Rarement, et c'est structurel : Zara ne fait pas de couponing, hors offre d'inscription occasionnelle et opérations très ponctuelles. Cette page liste uniquement les avantages réellement actifs (livraison, retours, offres d'inscription) — si un code Zara authentique apparaît, il sera publié ici le jour même. Méfiez-vous des sites qui en affichent des dizaines en permanence.`,
      },
      {
        question: 'Quand ont lieu les soldes Zara ?',
        answer: `Aux dates légales françaises : début janvier pour l'hiver, fin juin pour l'été, pendant 4 semaines. Les remises démarrent à -30/-40% et les deuxièmes démarques (10-15 jours plus tard) descendent sous -50%. L'application ouvre parfois l'accès aux soldes quelques heures avant le site : activez les notifications si vous visez des pièces populaires.`,
      },
      {
        question: 'Comment être prévenu quand un article Zara baisse de prix ?',
        answer: `Ajoutez l'article en favori dans l'application Zara : vous recevez une notification s'il passe en démarque ou revient en stock dans votre taille. C'est l'outil le plus efficace pour acheter Zara moins cher, bien plus fiable que la chasse aux codes.`,
      },
    ],
    tips: (s) => [
      { icon: '🗓️', tip: `Préparez vos soldes Zara à l'avance : favoris remplis fin décembre et mi-juin, notifications activées — les tailles courantes partent dans les 48 premières heures.` },
      { icon: '🏷️', tip: `Consultez la section « Special Prices » du site : des fins de série y sont remisées toute l'année, sans attendre les soldes.` },
      { icon: '🏬', tip: `Retournez toujours vos articles en boutique : c'est gratuit, alors que le retour par transporteur est facturé sur la plupart des commandes Zara.` },
      { icon: '📦', tip: `Panier sous 30€ ? Choisissez le retrait en magasin gratuit plutôt que de payer la livraison ou de gonfler artificiellement votre commande.` },
    ],
  },

  /* ────────────────────────────── LDLC ────────────────────────────── */
  ldlc: {
    intro: (s) =>
      `LDLC, c'est le spécialiste high-tech lyonnais historique — composants, PC montés, périphériques — avec une politique promo particulière : peu de codes « pourcentage sur tout », mais des offres ciblées par rayon (NAS, onduleurs, gamme Pro), des ventes flash quotidiennes et une livraison en point relais offerte qui change le calcul sur les petits accessoires. En ${s.month}, ${nbOffres(s)} LDLC ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} sur cette page${s.bestDiscount ? `, jusqu'à ${s.bestDiscount}` : ''}, chacune avec son périmètre exact.`,
    metaDescription: (s) =>
      `${nbOffres(s)} LDLC vérifiées en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''} : codes par rayon, livraison point relais offerte, ventes flash. Conditions exactes testées sur ldlc.com.`,
    about: (s) => [
      {
        heading: 'Comment LDLC structure ses promos (et où chercher)',
        text: `Contrairement aux marketplaces, LDLC remise par rayon : un code peut viser uniquement les NAS et onduleurs, un autre les périphériques d'une marque précise. Les ventes flash quotidiennes et l'espace « Bons plans » du site portent les vraies baisses sur les composants (CPU, GPU, SSD), catégories où les codes génériques sont rares car les marges sont serrées. Réflexe utile : vérifiez le périmètre indiqué sous chaque code de cette page avant de remplir le panier — un code « gamme Pro » ne passera pas sur une carte graphique grand public.`,
      },
      {
        heading: 'Livraison gratuite : le levier LDLC le plus rentable',
        text: `La livraison en point relais est offerte (offre permanente vérifiée plus haut) et la livraison à domicile devient gratuite dès 50€ — un seuil vite atteint en high-tech. Sur un câble, une souris ou un SSD, la livraison relais gratuite fait souvent gagner plus qu'un code aléatoire de 5%. LDLC dispose aussi de boutiques physiques dans toute la France : le retrait boutique est gratuit et permet de vérifier un produit coûteux à la remise du colis.`,
      },
      {
        heading: 'Quand acheter du matériel chez LDLC',
        text: `Le high-tech suit un calendrier précis : Black Friday (fin novembre) et French Days (printemps/automne) pour les remises les plus larges, puis les sorties de nouvelles générations de composants — chaque lancement NVIDIA, AMD ou Intel fait baisser la génération précédente de 15 à 30% dans les semaines qui suivent. Pour un PC complet, les configurations LDLC assemblées sont régulièrement remisées lors de ces événements ; hors événement, comparez avec le prix des composants séparés + montage.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Y a-t-il des codes promo LDLC sur les composants PC ?',
        answer: `Rarement sur les composants eux-mêmes (cartes graphiques, processeurs) où les marges sont faibles : les remises y passent par les ventes flash et l'espace Bons plans. Les codes LDLC actifs visent plus souvent les périphériques, le stockage, la gamme Pro (NAS, onduleurs) ou un seuil de panier. Chaque code de cette page précise son périmètre exact.`,
      },
      {
        question: 'La livraison LDLC est-elle gratuite ?',
        answer: `Oui en point relais (offre permanente), et à domicile dès 50€ d'achat. Le retrait dans les boutiques LDLC est également gratuit — pratique pour un composant coûteux qu'on préfère inspecter à la remise. Sur les petits accessoires, la livraison relais offerte est souvent l'économie la plus sûre.`,
      },
      {
        question: 'LDLC est-il plus cher que les marketplaces ?',
        answer: `Sur l'étiquette, parfois ; sur le coût total, pas forcément : garantie gérée en France, SAV réputé (élu Service Client de l'Année à de multiples reprises), retours simples et conseils réels en boutique. Pour un composant critique (alimentation, carte mère), l'écart de quelques euros s'amortit au premier incident. Nos codes et bons plans réduisent justement cet écart.`,
      },
    ],
    tips: (s) => [
      { icon: '🖥️', tip: `Surveillez les lancements de nouvelles générations (NVIDIA, AMD, Intel) : la génération précédente perd 15 à 30% chez LDLC dans les semaines qui suivent.` },
      { icon: '📦', tip: `Choisissez systématiquement le point relais ou le retrait boutique : c'est gratuit, et sur un petit accessoire ça bat n'importe quel code de 5%.` },
      { icon: '⚡', tip: `Passez par l'espace « Bons plans » et les ventes flash du jour avant de payer un composant au prix catalogue — les vraies baisses composants sont là, pas dans les codes.` },
      { icon: '🏢', tip: `Vous achetez pour une activité pro ? Les codes gamme Pro (NAS, onduleurs) de cette page s'ajoutent à la récupération de TVA — le cumul est vite significatif.` },
    ],
  },

  /* ─────────────────────────── OFFICE DEPOT ───────────────────────── */
  'office-depot': {
    intro: (s) =>
      `Office Depot est l'un des rares fournituristes où le couponing fonctionne vraiment — parce que sa clientèle est double : particuliers à la rentrée, mais surtout TPE, indépendants et associations qui commandent en volume toute l'année. Codes par marque (3M, Newell…), remise d'inscription à la newsletter, livraison offerte par palier : en ${s.month}, ${nbOffres(s)} ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} sur cette page${s.bestDiscount ? `, jusqu'à ${s.bestDiscount} de remise` : ''}. De quoi faire baisser la facture papeterie, encre et mobilier de bureau.`,
    metaDescription: (s) =>
      `${nbOffres(s)} Office Depot vérifiées en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''} : codes par marque, -25% newsletter, livraison dès 75€. Pour particuliers, TPE et assos.`,
    about: (s) => [
      {
        heading: 'Les codes Office Depot par marque : lisez bien le périmètre',
        text: `La plupart des codes Office Depot visent une marque ou une famille de produits — articles 3M (Post-it, Scotch), marques Newell (Paper Mate, Sharpie…), encres et toners d'un fabricant donné. Un code « -40% sur 3M » ne s'appliquera pas au reste du panier : groupez vos achats par marque pour maximiser chaque code, quitte à passer deux commandes si les paliers de livraison le permettent. Les offres de cette page indiquent le périmètre exact de chaque code.`,
      },
      {
        heading: 'Newsletter, paliers de livraison et achats groupés',
        text: `L'inscription à la newsletter déclenche la remise la plus simple à obtenir (jusqu'à -25% sur le premier achat quand l'offre est active — vérifiez en haut de page). La livraison devient gratuite dès 75€ HT, un palier pensé pour les commandes de bureau : sous ce seuil, mutualisez la commande avec des collègues ou complétez avec les consommables que vous rachèterez de toute façon (papier, encre). Pour les structures qui commandent régulièrement, le compte pro Office Depot ajoute des tarifs négociés par volume.`,
      },
      {
        heading: 'Le calendrier malin des fournitures de bureau',
        text: `Deux pics annuels : la rentrée scolaire (août-septembre), où les fournitures de base sont en concurrence frontale avec la grande distribution — c'est le moment des cartables et calculatrices — et janvier, quand les entreprises renouvellent contrats et équipements (mobilier, fauteuils, imprimantes remisés). L'encre et le toner, eux, ne connaissent pas de saison : c'est le poste où les codes par marque de cette page rapportent le plus sur l'année.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Comment obtenir -25% chez Office Depot ?',
        answer: `Via l'offre d'inscription à la newsletter, valable sur le premier achat (offre listée en haut de cette page quand elle est active). C'est la remise transversale la plus élevée chez Office Depot — les autres codes visent généralement une marque ou une famille de produits précise.`,
      },
      {
        question: 'La livraison Office Depot est-elle gratuite ?',
        answer: `Oui dès 75€ d'achat (offre vérifiée plus haut). Sous ce seuil, les frais grèvent vite une commande de papeterie : complétez avec des consommables récurrents (ramettes, encre) ou groupez la commande à plusieurs pour franchir le palier.`,
      },
      {
        question: 'Les codes Office Depot fonctionnent-ils pour les professionnels ?',
        answer: `Oui — les codes publics de cette page passent sur les comptes pro, et se cumulent avec les tarifs négociés volume pour les structures inscrites. Les indépendants et TPE récupèrent en plus la TVA : un code -20% sur un panier HT déjà détaxé rend l'écart avec la grande distribution très net.`,
      },
    ],
    tips: (s) => [
      { icon: '🗂️', tip: `Groupez vos achats par marque avant d'appliquer un code : la plupart des codes Office Depot visent une marque précise (3M, Newell…) et ignorent le reste du panier.` },
      { icon: '📬', tip: `Inscrivez-vous à la newsletter avant votre première commande : c'est la remise transversale la plus forte, et elle arrive en quelques minutes.` },
      { icon: '🖨️', tip: `Encre et toner sont le poste le plus rentable à optimiser : pas de saisonnalité, des codes par marque réguliers — stockez lors des remises.` },
      { icon: '🤝', tip: `Sous 75€ de panier, mutualisez la commande au bureau pour décrocher la livraison gratuite au lieu de payer les frais chacun de son côté.` },
    ],
  },

  /* ────────────────────────────── AIRBNB ──────────────────────────── */
  airbnb: {
    intro: (s) =>
      `Airbnb ne fonctionne pas au code promo classique — le champ « coupon » a quasiment disparu du paiement — mais cela ne veut pas dire qu'on paie plein tarif : crédits de parrainage, réductions automatiques à la semaine et au mois consenties par les hôtes, offres premier séjour et stratégies sur les frais de service permettent de réduire sérieusement la note. En ${s.month}, ${nbOffres(s)} ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} sur cette page, avec leurs conditions réelles — et surtout la méthode pour payer chaque séjour au juste prix.`,
    metaDescription: (s) =>
      `Pas de faux codes Airbnb ici : ${nbOffres(s)} vérifiée${s.offerCount > 1 ? 's' : ''} en ${s.month} (crédits parrainage, premier séjour) + les vraies remises hôtes à la semaine/au mois. Méthode testée.`,
    about: (s) => [
      {
        heading: 'Pourquoi les « codes promo Airbnb » que vous voyez ailleurs sont morts',
        text: `Airbnb a progressivement retiré les coupons publics : le programme de parrainage historique a été fermé puis rouvert par vagues selon les pays, et le champ code promo n'apparaît plus que pour des crédits déjà attachés à votre compte. Les sites qui affichent « code Airbnb -50€ vérifié aujourd'hui » recyclent des offres disparues. Cette page ne liste que les mécanismes réellement actifs — crédits de parrainage quand le programme est ouvert, offre premier séjour, gestes commerciaux — avec leur statut vérifié à chaque passage.`,
      },
      {
        heading: 'Les vraies remises : à la semaine, au mois, et hors saison',
        text: `La plus grosse économie Airbnb ne vient pas d'un code mais des remises hôtes automatiques : beaucoup de logements appliquent -10 à -20% dès 7 nuits et -20 à -50% sur les séjours d'un mois — la réduction s'affiche directement dans le prix total. Jouez aussi le calendrier : sur des dates flexibles, décaler d'une semaine hors vacances scolaires change le prix du même logement de 20 à 40%. La carte des prix par date dans la recherche Airbnb rend la comparaison immédiate.`,
      },
      {
        heading: 'Frais de service et frais de ménage : le vrai poste à optimiser',
        text: `Les frais de service voyageur (environ 14%) et les frais de ménage fixes transforment un logement « pas cher » en mauvaise affaire sur 2 nuits — et deviennent négligeables sur 10. Réflexe : comparez toujours le prix TOTAL affiché avant paiement, pas le prix par nuit ; sur un court séjour, un hôtel sans frais fixes gagne parfois. Astuce complémentaire : certains hôtes professionnels publient le même logement sur leur propre site sans commission — une recherche du nom du logement peut économiser les frais de service entiers.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Existe-t-il un code promo Airbnb valide en ce moment ?',
        answer: `Les coupons publics Airbnb n'existent quasiment plus : seuls des crédits attachés à votre compte (parrainage quand le programme est ouvert, gestes commerciaux du support) s'appliquent au paiement. Cette page vérifie en continu ce qui est réellement actif — tout « code -50€ » affiché ailleurs comme permanent est un leurre.`,
      },
      {
        question: 'Comment payer moins cher sur Airbnb sans code ?',
        answer: `Trois leviers cumulables : viser 7 nuits ou plus pour déclencher les remises hebdomadaires automatiques des hôtes (-10 à -20%), utiliser les dates flexibles pour éviter les pics (20 à 40% d'écart sur le même logement), et privilégier les séjours plus longs où les frais fixes (ménage, service) se diluent. Sur un mois, les remises hôtes atteignent -20 à -50%.`,
      },
      {
        question: 'Peut-on négocier le prix d\u2019un logement Airbnb ?',
        answer: `Oui, plus souvent qu'on ne le croit : contactez l'hôte avant de réserver, surtout pour un séjour long, une réservation de dernière minute ou des dates creuses. Beaucoup d'hôtes préfèrent remplir leur calendrier avec 10% de remise que laisser le logement vide — la demande spéciale d'offre se fait directement dans la messagerie Airbnb.`,
      },
    ],
    tips: (s) => [
      { icon: '📅', tip: `Activez les dates flexibles dans la recherche : le même logement varie de 20 à 40% selon la semaine — c'est la plus grosse « remise » Airbnb disponible.` },
      { icon: '🗓️', tip: `Visez 7 nuits minimum quand c'est possible : les remises hebdomadaires automatiques des hôtes (-10 à -20%) battent n'importe quel ancien coupon.` },
      { icon: '🧮', tip: `Comparez toujours le prix TOTAL (frais de service + ménage inclus), jamais le prix par nuit : sur 2 nuits, les frais fixes changent le classement des logements.` },
      { icon: '💬', tip: `Séjour long ou dates creuses ? Écrivez à l'hôte avant de réserver et demandez une offre spéciale — le taux de succès est étonnamment élevé.` },
    ],
  },

  /* ────────────────────────────── KIABI ────────────────────────────── */
  kiabi: {
    intro: (s) =>
      `Kiabi joue déjà la carte des petits prix, mais la marque nordiste garde plusieurs leviers que la plupart des clients n'utilisent jamais : le programme de fidélité Kiabi Community qui convertit chaque achat en euros de réduction, les ventes flash du mercredi, la seconde main en magasin et des codes exclusifs poussés par l'application. En ${s.month}, cette page regroupe ${nbOffres(s)} Kiabi vérifiée${s.offerCount > 1 ? 's' : ''}${s.bestDiscount ? ` — jusqu'à ${s.bestDiscount} de remise` : ''} — avec, pour chaque offre, la condition exacte (minimum d'achat, rayon concerné, web ou magasin).`,
    metaDescription: (s) =>
      `${s.codeCount > 0 ? `${s.codeCount} codes promo Kiabi` : `${nbOffres(s)} Kiabi`} testés en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''}. Fidélité Kiabi Community, ventes flash, retrait magasin gratuit : le guide pour payer moins.`,
    about: (s) => [
      {
        heading: 'Codes promo Kiabi : ce qui existe vraiment (et ce qui n\u2019existe pas)',
        text: `Kiabi n'inonde pas le marché de coupons : la marque préfère les prix bas permanents, les ventes flash et sa carte de fidélité. Les codes qui circulent sont donc peu nombreux mais réels — typiquement une remise de bienvenue newsletter, des codes appli exclusifs et des opérations ponctuelles (-20% sur un rayon, remise dès 60€ d'achat). ${s.codeCount > 0 ? `Les ${s.codeCount} codes de cette page indiquent leur périmètre exact : la plupart excluent les articles déjà soldés et la seconde main.` : `Quand aucun code public ne tourne, les offres listées ici (ventes flash, bons plans rayons) restent le meilleur point d'entrée.`} Méfiez-vous des sites qui promettent du « -50% Kiabi permanent » : ça n'existe tout simplement pas chez ce distributeur.`,
      },
      {
        heading: 'Kiabi Community : la remise que 80% des clients oublient',
        text: `Le programme de fidélité gratuit de Kiabi transforme chaque euro dépensé en points, convertis automatiquement en bons de réduction utilisables en ligne et en magasin. S'y ajoutent des avantages concrets : offre anniversaire, ventes privées membres avant les soldes, retouches et échanges facilités. Le bon réflexe : créer le compte AVANT votre première commande (les points ne sont pas rétroactifs) et cumuler le bon fidélité avec les ventes flash — Kiabi l'autorise, contrairement aux codes promo classiques qui ne se cumulent pas entre eux.`,
      },
      {
        heading: 'Livraison gratuite, retrait magasin et seconde main',
        text: `Le retrait en magasin Kiabi est gratuit dès le premier euro — c'est l'astuce n°1 pour les petits paniers, la livraison à domicile n'étant offerte qu'à partir d'un seuil de commande. Pensez aussi au rayon seconde main présent dans de nombreux magasins : des pièces enfant quasi neuves à -50/-70% du prix d'origine, idéal pour les vêtements portés trois mois. Enfin, surveillez les fins de série en ligne : la section « Bonnes affaires » descend régulièrement sous les prix soldés, sans attendre janvier ou juillet.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Pourquoi mon code promo Kiabi ne fonctionne pas ?',
        answer: `Trois causes classiques : le code exclut les articles soldés ou déjà remisés (le cas le plus fréquent chez Kiabi), il exige un minimum d'achat non atteint, ou il est réservé aux membres Kiabi Community connectés à leur compte. Vérifiez la condition affichée sous chaque code de cette page — et rappelez-vous que les codes Kiabi ne se cumulent jamais entre eux.`,
      },
      {
        question: 'La livraison Kiabi est-elle gratuite ?',
        answer: `Le retrait en magasin est gratuit sans minimum — c'est l'option la plus économique. La livraison en point relais et à domicile devient gratuite au-delà d'un seuil de panier (variable selon les opérations en cours) ; en dessous, comptez quelques euros. Sur un petit panier, le retrait magasin fait souvent gagner l'équivalent d'un code promo.`,
      },
      {
        question: 'Quand ont lieu les meilleures promos Kiabi ?',
        answer: `Quatre moments forts : les soldes (janvier et fin juin), les ventes privées membres Kiabi Community qui démarrent quelques jours avant, les ventes flash hebdomadaires en ligne, et la rentrée scolaire (août-septembre) où les lots et promos multi-pièces se multiplient. Entre deux, la section « Bonnes affaires » du site reste alimentée toute l'année.`,
      },
      {
        question: 'Peut-on utiliser un code promo Kiabi en magasin ?',
        answer: `La plupart des codes promo Kiabi sont réservés au site et à l'application. En magasin, ce sont les bons de fidélité Kiabi Community et les offres locales qui s'appliquent. L'inverse est aussi vrai : certains bons magasins ne passent pas en ligne — la condition est toujours précisée sur l'offre.`,
      },
    ],
    tips: (s) => [
      { icon: '🏬', tip: `Retrait magasin gratuit dès 1€ : sur un petit panier, c'est souvent plus rentable qu'un code promo appliqué à une commande livrée.` },
      { icon: '💳', tip: `Créez votre compte Kiabi Community AVANT de commander : les points fidélité ne sont pas rétroactifs et se cumulent avec les ventes flash.` },
      { icon: '📱', tip: `Installez l'application Kiabi : certains codes et ventes flash y sont exclusifs, et les membres voient les ventes privées avant tout le monde.` },
      { icon: '👖', tip: `Pour les vêtements enfants, passez par le rayon seconde main en magasin : -50 à -70% sur des pièces portées quelques mois.` },
    ],
  },

  /* ──────────────────────────── UBER EATS ───────────────────────────── */
  'uber-eats': {
    intro: (s) =>
      `Sur Uber Eats, le prix affiché sur la carte n'est que le début de l'addition : frais de livraison, frais de service et minimum de commande peuvent alourdir la note de 30%. La bonne nouvelle, c'est que la plateforme est aussi l'une des plus généreuses en promotions — codes premières commandes, offres restaurants (-30%, 1 acheté = 1 offert), livraison offerte via Uber One. En ${s.month}, ${nbOffres(s)} Uber Eats ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} sur cette page${s.bestDiscount ? `, avec jusqu'à ${s.bestDiscount} de réduction` : ''} — chaque offre précise si elle vise les nouveaux clients ou tous les comptes.`,
    metaDescription: (s) =>
      `${s.codeCount > 0 ? `${s.codeCount} codes promo Uber Eats` : `${nbOffres(s)} Uber Eats`} vérifiés en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''}. Première commande, Uber One, frais de livraison : les vraies astuces pour payer moins.`,
    about: (s) => [
      {
        heading: 'Codes promo Uber Eats : nouveaux clients vs comptes existants',
        text: `Uber Eats réserve ses codes les plus généreux aux premières commandes : typiquement une remise fixe (souvent autour de -10 à -20€) avec un minimum de panier, valable uniquement sur un compte qui n'a jamais commandé. Pour les comptes existants, les promos passent par d'autres canaux : offres restaurants directement dans l'application (-20/-30%, menus « 1 acheté = 1 offert »), codes de réactivation envoyés par e-mail aux clients inactifs, et opérations ponctuelles avec des partenaires bancaires ou mobiles. ${s.codeCount > 0 ? `Les ${s.codeCount} codes listés ici précisent leur public — inutile de tester un code « nouveau client » sur un compte qui a déjà commandé, il sera refusé systématiquement.` : ''}`,
      },
      {
        heading: 'Uber One : rentable ou pas ?',
        text: `L'abonnement Uber One offre la livraison à 0€ et une réduction des frais de service sur les commandes éligibles dépassant le minimum requis (généralement 15€ chez les restaurants partenaires). Le calcul est simple : si vous commandez plus de deux fois par mois, l'abonnement est presque toujours amorti — d'autant qu'Uber propose régulièrement le premier mois gratuit ou à prix réduit. Bonus souvent ignoré : les membres Uber One reçoivent des promos exclusives et des crédits de compensation renforcés en cas de livraison en retard. Pensez à résilier si votre rythme de commande baisse : l'abonnement se renouvelle automatiquement.`,
      },
      {
        heading: 'Réduire les frais : les leviers qui marchent vraiment',
        text: `À panier égal, l'addition Uber Eats varie fortement selon vos choix. Le retrait sur place (« à emporter ») supprime tous les frais de livraison et une partie des frais de service — sur une commande de 25€, l'économie dépasse souvent 5€. Les offres restaurants dans l'onglet « Promotions » de l'application se cumulent avec les avantages Uber One, mais rarement avec un code promo saisi manuellement. Enfin, commander directement le menu midi ou les formules du restaurant (souvent alignées sur les prix en salle) évite la majoration carte que certains établissements appliquent sur la plateforme.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Pourquoi mon code promo Uber Eats ne fonctionne pas ?',
        answer: `Les causes les plus fréquentes : le code est réservé aux nouveaux clients et votre compte a déjà commandé ; le minimum de commande n'est pas atteint (les frais de livraison ne comptent pas dans le minimum) ; le code est limité à certaines villes ou restaurants ; ou un autre avantage (offre restaurant, crédit Uber) est déjà appliqué — la plupart des promos Uber Eats ne se cumulent pas.`,
      },
      {
        question: 'Comment avoir la livraison gratuite sur Uber Eats ?',
        answer: `Trois options : l'abonnement Uber One (livraison à 0€ dès le minimum de commande atteint chez les partenaires, rentable dès 2 commandes/mois), les offres « livraison offerte » ponctuelles affichées sur certains restaurants dans l'application, et le retrait sur place qui supprime purement et simplement les frais. À défaut, grouper une commande à plusieurs dilue les frais fixes.`,
      },
      {
        question: 'Uber Eats propose-t-il un code pour les clients existants ?',
        answer: `Oui, mais par vagues : codes de réactivation envoyés par e-mail ou notification aux comptes inactifs depuis quelques semaines, offres partenaires (opérateurs, banques) et promotions restaurants dans l'application. Astuce contre-intuitive : espacer ses commandes déclenche souvent un code « on vous a manqué » de -20 à -50%. Les codes publics pour tous les comptes existent aussi ponctuellement — ils sont listés sur cette page dès qu'ils sont vérifiés.`,
      },
      {
        question: 'Les prix sur Uber Eats sont-ils les mêmes qu\u2019au restaurant ?',
        answer: `Pas toujours : de nombreux restaurants majorent leur carte de 10 à 30% sur la plateforme pour absorber la commission. S'y ajoutent les frais de livraison et de service. Pour comparer honnêtement, regardez le total au moment du paiement — et si le restaurant est proche, le retrait sur place via l'application garde les promos tout en supprimant les frais.`,
      },
    ],
    tips: (s) => [
      { icon: '🥡', tip: `Option « à emporter » : retirer la commande vous-même supprime les frais de livraison ET une partie des frais de service — jusqu'à 5-7€ d'économie par commande.` },
      { icon: '📬', tip: `Compte inactif = codes de réactivation : espacez vos commandes de quelques semaines et surveillez vos e-mails, Uber Eats relance avec des -20 à -50%.` },
      { icon: '🔁', tip: `Plus de 2 commandes par mois ? Uber One est quasi toujours rentable — profitez du premier mois offert, et résiliez si votre rythme baisse.` },
      { icon: '🏷️', tip: `Ouvrez l'onglet « Promotions » de l'appli avant de choisir le restaurant : les offres -30% et « 1 acheté = 1 offert » y sont souvent plus rentables qu'un code.` },
    ],
  },

  /* ───────────────────────────── BETCLIC ────────────────────────────── */
  betclic: {
    intro: (s) =>
      `Betclic ne fonctionne pas comme une boutique classique : ici, pas de « -20% sur le panier », mais une offre de bienvenue sous forme de premier pari remboursé en paris gratuits, des boosts de cotes quotidiens et des missions dans l'application. En ${s.month}, cette page vérifie ${nbOffres(s)} Betclic active${s.offerCount > 1 ? 's' : ''} — avec les conditions réelles de chaque offre (mise minimale, délais d'utilisation des freebets) expliquées sans le jargon. Réservé aux plus de 18 ans : les jeux d'argent comportent des risques.`,
    metaDescription: (s) =>
      `Offre Betclic vérifiée en ${s.month} : premier pari remboursé en paris gratuits, boosts de cotes, missions appli. Conditions réelles expliquées. 18+, jouez responsable.`,
    about: (s) => [
      {
        heading: 'Comment fonctionne l\u2019offre de bienvenue Betclic',
        text: `L'offre nouveau client de Betclic suit toujours la même mécanique : votre premier pari est remboursé s'il est perdant, sous forme de paris gratuits (freebets), jusqu'à un plafond défini par l'opération en cours. Points à connaître avant de se lancer : le remboursement couvre le premier pari uniquement (d'où l'intérêt de ne pas le « gaspiller » sur une petite mise), les freebets doivent être utilisés dans un délai limité, et les gains issus d'un freebet sont versés hors mise initiale. Un code promo Betclic se saisit au moment de l'inscription — pas après — et l'offre est strictement réservée aux nouveaux comptes vérifiés (identité + RIB), conformément à la réglementation ANJ.`,
      },
      {
        heading: 'Au-delà du bonus : boosts de cotes, missions et MyBetclic',
        text: `Une fois l'offre de bienvenue consommée, Betclic reste l'un des opérateurs français les plus actifs en promotions récurrentes : cotes boostées quotidiennes sur les grandes affiches (Ligue 1, Ligue des Champions, tennis), missions dans l'application qui débloquent des freebets, et opérations spéciales pendant les grands tournois. Le programme MyBetclic centralise ces avantages personnalisés. Réflexe utile : consulter l'onglet promotions avant chaque gros événement sportif — c'est là que les offres les plus intéressantes tombent, souvent pour 24 à 48h seulement.`,
      },
      {
        heading: 'Jeu responsable : les règles du jeu en France',
        text: `Betclic est un opérateur agréé par l'Autorité Nationale des Jeux (ANJ) : inscription réservée aux majeurs, vérification d'identité obligatoire avant tout retrait, et outils de modération intégrés — limites de dépôt, auto-exclusion, historique des mises. Aucune offre listée sur cette page ne transforme les paris en « argent facile » : un bonus rembourse au mieux une partie du risque, jamais la totalité. Fixez un budget avant de parier et tenez-vous-y. Besoin d'aide ? Joueurs Info Service : 09 74 75 13 13 (appel non surtaxé).`,
      },
    ],
    faq: (s) => [
      {
        question: 'Comment utiliser un code promo Betclic ?',
        answer: `Le code se saisit dans le champ dédié du formulaire d'inscription, avant la création du compte — il est impossible de l'ajouter après coup. Une fois le compte vérifié (identité et coordonnées bancaires, exigées par la réglementation française), l'offre de bienvenue s'active sur votre premier pari.`,
      },
      {
        question: 'Comment fonctionnent les freebets Betclic ?',
        answer: `Un freebet est un pari gratuit : si vous misez un freebet de 10€ à une cote de 3,00, vous recevez 20€ de gains réels (les gains sont versés hors mise). Les freebets ont une durée de validité limitée — souvent quelques jours — et ne sont généralement pas fractionnables. Ils ne peuvent pas être retirés directement : il faut les jouer.`,
      },
      {
        question: 'L\u2019offre de bienvenue Betclic est-elle cumulable ?',
        answer: `Non : une seule offre de bienvenue par personne (et par foyer, selon les conditions), sur un premier compte uniquement. Créer plusieurs comptes viole les conditions de Betclic et la réglementation ANJ — les comptes multiples sont fermés et les gains annulés. Après le bonus de bienvenue, ce sont les promotions récurrentes (boosts, missions) qui prennent le relais.`,
      },
      {
        question: 'Betclic est-il légal et fiable en France ?',
        answer: `Oui : Betclic est agréé par l'Autorité Nationale des Jeux (ANJ) pour les paris sportifs, hippiques et le poker en France. Les fonds des joueurs sont cantonnés, les retraits exigent une vérification d'identité complète, et l'opérateur applique les outils de jeu responsable imposés par la loi (limites, auto-exclusion). L'inscription est réservée aux personnes majeures résidant en France.`,
      },
    ],
    tips: (s) => [
      { icon: '📝', tip: `Le code promo se saisit À L'INSCRIPTION uniquement : impossible de l'ajouter après création du compte — vérifiez le champ avant de valider.` },
      { icon: '🎯', tip: `Ne gaspillez pas l'offre de bienvenue sur une petite mise : le remboursement couvre uniquement le premier pari, jusqu'au plafond de l'offre en cours.` },
      { icon: '⏳', tip: `Les freebets expirent vite (souvent sous quelques jours) : utilisez-les dès réception, et rappelez-vous que les gains sont versés hors mise.` },
      { icon: '🛡️', tip: `Fixez vos limites de dépôt dès l'inscription dans les paramètres du compte : c'est l'outil jeu responsable le plus efficace. 18+, jouer comporte des risques.` },
    ],
  },
};

export function getEditorial(slug: string): StoreEditorial | null {
  return EDITORIAL[slug] ?? null;
}
