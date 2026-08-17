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
  /** Optional replacement for the generated <title> ladder (buildTitle in
   *  app/codes-promo/[slug]/page.tsx). Must stay ≤ 52 chars raw — the root
   *  layout appends " | LockCoupon" (+13) and Bing flags rendered titles
   *  > 65 chars. Used when a store ranks on queries the generic
   *  "Code Promo X" pattern doesn't cover (e.g. adidas → "adidas coupon"). */
  title?: (s: StoreStats) => string;
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
  /** Optional replacement for the generic 3-step how-to (store-specific,
   *  4-6 steps). Also feeds the HowTo JSON-LD so schema matches the page. */
  howToSteps?: (s: StoreStats) => { title: string; desc: string }[];
  /** Optional related-merchant links (descriptive French anchors), rendered
   *  at the end of the about block for internal linking. */
  relatedLinks?: { href: string; anchor: string }[];
}

const nbOffres = (s: StoreStats) =>
  `${s.offerCount} offre${s.offerCount > 1 ? 's' : ''}`;

export const EDITORIAL: Record<string, StoreEditorial> = {
  /* ───────────────────────────── AMAZON ───────────────────────────── */
  amazon: {
    intro: (s) =>
      `« Amazon code promo » est l'une des recherches shopping les plus tapées de France — et l'une de celles qui ramènent le plus de codes morts, recopiés de site en site depuis des mois. Cette page prend le contre-pied : nous suivons ${nbOffres(s)} Amazon réellement actives en ${s.month}${s.bestDiscount ? `, avec une remise maximale vérifiée de ${s.bestDiscount}` : ''}, entre codes promo à saisir au paiement, coupons à cocher sur les fiches produits et avantages réservés aux membres Prime. Chaque offre affiche ses conditions exactes — minimum d'achat, sélection concernée, Prime ou non — pour que votre code de remise Amazon fonctionne du premier coup.`,
    metaDescription: (s) =>
      `✅ ${s.offerCount} offre${s.offerCount > 1 ? 's' : ''} Amazon vérifiée${s.offerCount > 1 ? 's' : ''} en ${s.month} : codes promo actifs, coupons et remises Prime testés sur amazon.fr${s.bestDiscount ? ` · Jusqu'à ${s.bestDiscount} de réduction` : ''}.`,
    about: (s) => [
      {
        heading: 'Où Amazon cache vraiment ses réductions',
        text: `Contrairement aux boutiques classiques, Amazon distribue peu de codes publics : l'essentiel des remises passe par d'autres mécanismes. Les coupons Amazon d'abord — cette case à cocher sur certaines fiches produits, qui déduit la remise automatiquement au paiement, sans code à saisir. Les Ventes Flash ensuite, renouvelées plusieurs fois par jour. Viennent enfin Amazon Warehouse (produits retournés ou reconditionnés, remisés selon leur état), l'Outlet (fins de série) et « Abonnez-vous et économisez » sur les produits du quotidien. Les codes promo Amazon actifs, eux, sont presque toujours liés à une opération précise : première commande via l'application, retrait en point relais, catégorie ciblée… C'est exactement ce que recense la liste en haut de page${s.codeCount > 0 ? `, avec ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} à saisir en ${s.month}` : ''}.`,
      },
      {
        heading: 'Codes promo Amazon actifs : notre méthode de vérification',
        text: `Chaque code Amazon publié ici doit être accompagné d'une preuve de source avant publication ; un code que nous ne pouvons pas tracer part en file de relecture manuelle au lieu d'apparaître sur cette page. Les offres expirées sont purgées quotidiennement et la date de dernière vérification s'affiche en haut de page. Un code Amazon a par ailleurs presque toujours des conditions — réservé aux membres Prime, à la première commande, à une catégorie précise — que nous indiquons sous chaque offre. Si un code est refusé au paiement, vérifiez d'abord que vos articles sont « Expédiés par Amazon » : la plupart des codes excluent les vendeurs tiers de la marketplace.`,
      },
      {
        heading: 'Prime, Warehouse, Abonnez-vous et économisez : réduire la note sans coupon Amazon',
        text: `Le coupon Amazon n'est pas toujours la meilleure affaire. L'abonnement Prime amortit vite son coût si vous commandez régulièrement : livraison rapide illimitée, Prime Video et accès anticipé aux Ventes Flash ; les étudiants bénéficient de Prime Student, avec une période d'essai gratuite puis un tarif réduit de moitié. Amazon Warehouse est un réflexe à prendre pour le high-tech : produits contrôlés, remisés selon l'état, avec les mêmes droits de retour. Enfin, « Abonnez-vous et économisez » réduit le prix des produits récurrents (courses, hygiène, bébé) et se cumule avec les coupons des fiches produits — souvent la remise totale la plus élevée du site.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Les codes promo Amazon sont-ils cumulables ?',
        answer: `Non — Amazon n'accepte qu'un seul code promotionnel par commande. En revanche, un code se cumule avec les remises automatiques : coupons à cocher sur les fiches produits, prix Ventes Flash et remise « Abonnez-vous et économisez ». Pour maximiser la réduction, appliquez d'abord ces remises automatiques, puis saisissez le code le plus avantageux au moment du paiement.`,
      },
      {
        question: 'Pourquoi mon code promo Amazon ne fonctionne-t-il pas ?',
        answer: `Dans la grande majorité des cas, l'une de ces conditions n'est pas remplie : montant minimum d'achat non atteint, code réservé aux membres Prime ou à la première commande, article vendu par un vendeur tiers de la marketplace plutôt qu'« Expédié par Amazon », catégorie non éligible, ou code déjà utilisé sur votre compte. Vérifiez les conditions affichées sous chaque offre de cette page avant de conclure qu'un code est expiré.`,
      },
      {
        question: `Existe-t-il un code de remise Amazon sans minimum d'achat ?`,
        answer: `C'est rare : la plupart des codes Amazon exigent un panier minimum ou visent une sélection précise. Si aucun code sans minimum n'est listé ci-dessus, la meilleure alternative reste les coupons à cocher directement sur les fiches produits : ils s'appliquent sans code et généralement sans minimum, la remise étant déduite automatiquement au paiement.`,
      },
      {
        question: 'Amazon propose-t-il des réductions pour les étudiants ?',
        answer: `Oui. Prime Student, réservé aux étudiants, offre une période d'essai gratuite puis un abonnement à moitié prix par rapport à Prime classique, avec les mêmes avantages : livraison rapide, Prime Video et Ventes Flash en avant-première. Quand une offre Prime Student est active, elle figure dans la liste en haut de cette page.`,
      },
    ],
    howToSteps: (s) => [
      { title: '1. Choisissez votre offre', desc: `Parcourez les ${s.offerCount} offres Amazon vérifiées ci-dessus et repérez celle qui correspond à votre panier — chaque carte précise ses conditions (minimum d'achat, Prime, catégorie).` },
      { title: '2. Copiez le code', desc: `Cliquez sur « Voir le code » : il s'affiche et se copie automatiquement dans votre presse-papier.` },
      { title: '3. Remplissez votre panier sur amazon.fr', desc: `Ajoutez vos articles en privilégiant la mention « Expédié par Amazon » — la plupart des codes excluent les vendeurs tiers de la marketplace.` },
      { title: '4. Collez le code au paiement', desc: `À l'étape du paiement, collez le code dans le champ « Cartes cadeaux et codes promotionnels », puis cliquez sur « Appliquer ».` },
      { title: '5. Vérifiez la remise avant de valider', desc: `Le montant déduit apparaît dans le récapitulatif de commande. S'il n'apparaît pas, revérifiez les conditions de l'offre avant de confirmer.` },
    ],
    relatedLinks: [
      { href: '/codes-promo/cdiscount', anchor: 'code promo Cdiscount' },
      { href: '/codes-promo/fnac', anchor: 'codes promo Fnac vérifiés' },
      { href: '/codes-promo/aliexpress', anchor: 'code réduction AliExpress' },
    ],
  },

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
      {
        heading: 'Livraison, retours et douane : le vrai coût d\u2019une commande Temu',
        text: `La livraison standard vers la France est gratuite sur la quasi-totalité des commandes, en 6 à 11 jours ouvrés — et Temu crédite un bon de compensation si le colis dépasse la date annoncée, une garantie que peu de marketplaces offrent. La TVA est incluse dans le prix affiché et aucun frais de douane ne s'applique sous 150€ de commande : le total en caisse est bien le prix final. Côté retours, vous disposez de 90 jours, le premier renvoi de chaque commande est gratuit via étiquette prépayée, et sur les petits articles Temu rembourse souvent sans exiger le retour physique. Deux réflexes tout de même : groupez vos renvois en un seul colis, et si votre panier dépasse 150€, scindez-le en deux commandes pour rester sous le seuil douanier.`,
      },
      {
        heading: 'Temu, AliExpress ou Amazon : où est la vraie bonne affaire ?',
        text: `Sur les petits prix du quotidien (accessoires, gadgets, maison), Temu est généralement imbattable une fois les coupons appliqués — c'est sa raison d'être. AliExpress reprend l'avantage sur l'électronique de marque (Xiaomi, Anker…) grâce à ses boutiques officielles et ses entrepôts européens plus fournis. Amazon reste le réflexe pour tout ce qui doit arriver demain ou bénéficier d'un SAV français rapide. La méthode gagnante : repérez l'article sur Temu, vérifiez la même référence sur les deux autres, puis appliquez le meilleur code de la plateforme retenue — nos pages AliExpress et Amazon listent leurs offres vérifiées au même rythme que celle-ci.`,
      },
      {
        heading: 'Notre méthode de vérification des codes Temu',
        text: `Chaque code publié ici passe par le même protocole : test en caisse sur un panier réel, identification de la famille (nouveau client, palier, tous comptes, app), puis re-vérification automatisée plusieurs fois par jour — les codes morts sont retirés au passage suivant, jamais laissés en vitrine. Les compteurs d'utilisation affichés sur chaque offre viennent de nos visiteurs réels : un code très utilisé récemment est un code qui passe. C'est aussi pour ça que cette page évolue d'un jour à l'autre : mieux vaut 8 codes qui fonctionnent que 40 recopiés d'un site à l'autre depuis des mois.`,
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
      {
        question: 'Temu est-il fiable pour commander en France ?',
        answer: `Sur le paiement et la livraison, oui : transactions sécurisées, TVA incluse, remboursement automatique en cas de colis perdu et 90 jours pour retourner un article. La vigilance porte sur les produits eux-mêmes : lisez les avis avec photos, vérifiez les tailles sur les guides de mensurations, et évitez les catégories sensibles (électrique, normes CE) pour lesquelles les marketplaces asiatiques restent inégales.`,
      },
      {
        question: 'Quand ont lieu les plus grosses promos Temu de l\u2019année ?',
        answer: `Quatre pics dominent : le Black Friday (fin novembre), le 11.11, les anniversaires de la plateforme et les soldes d'été/hiver françaises où Temu aligne des opérations spéciales France. Au quotidien, les ventes flash tournent par créneaux — 8h-10h et 14h-16h heure française sont les fenêtres les plus agressives. Les codes de cette page se cumulent avec ces événements, c'est le moment où ils rapportent le plus.`,
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
      `Chez SHEIN, le code promo n'est que la moitié de l'équation : la plateforme superpose points de fidélité, ventes flash triquotidiennes — les fameux « deals » du jour —, remises app-exclusives et cashback, et la plupart de ces leviers se cumulent au même paiement. En ${s.month}, cette page suit ${nbOffres(s)} SHEIN vérifiée${s.offerCount > 1 ? 's' : ''}${s.bestDiscount ? ` (jusqu'à ${s.bestDiscount})` : ''} : codes promo, deals et bons plans sans code, du bon d'inscription au cashback permanent, avec les conditions exactes de chacune. Objectif : que vous ne payiez jamais le prix affiché sur shein.com.`,
    metaDescription: (s) =>
      `${nbOffres(s)} SHEIN vérifiées en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''} : codes, deals & bons plans, cashback et livraison offerte dès 29€. Conditions réelles testées, sans codes morts.`,
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
      {
        heading: 'L\u2019application SHEIN : coupons exclusifs et check-ins quotidiens',
        text: `Comme chez Temu, l'application mobile est le cœur du système promo SHEIN : check-ins quotidiens qui créditent des points, coupons app-exclusifs poussés par notification, ventes flash réservées et roue de bienvenue pour les nouveaux comptes. Le rituel gagnant avant une grosse commande : ouvrir l'appli chaque jour pendant une semaine (30 secondes de check-in), récolter points et coupons, puis passer commande avec le meilleur code de cette page appliqué par-dessus. Les prix produits sont identiques entre site et application — seul l'accès aux coupons change, donc rien n'empêche de préparer le panier sur grand écran et de payer sur mobile.`,
      },
      {
        heading: 'SHEIN, Temu ou ASOS : quelle plateforme pour quel achat ?',
        text: `Les trois jouent des rôles différents. SHEIN domine sur la profondeur de catalogue mode à petit prix et les tailles étendues ; Temu est plus agressif sur les accessoires et la maison, mais son rayon vêtements est moins fourni en guides de tailles fiables ; ASOS vend des marques (Nike, Adidas, Levi's…) avec des retours simples — à prix plus élevé, mais avec une qualité prévisible. Notre conseil : basiques et pièces tendance éphémères chez SHEIN avec un code de cette page ; pièces durables et chaussures de marque chez ASOS pendant leurs opérations à -25%. Les deux pages sont vérifiées au même rythme.`,
      },
      {
        heading: 'Notre protocole de vérification des codes SHEIN',
        text: `Chaque code SHEIN de cette page est testé en caisse sur un panier réel avant publication, avec sa condition exacte relevée (palier minimum, catégories exclues, nouveaux clients). Les vérifications automatisées tournent ensuite plusieurs fois par jour : un code qui cesse de passer est retiré au contrôle suivant. C'est pourquoi le nombre d'offres varie d'un jour à l'autre — nous préférons une liste courte et exacte à une vitrine de codes morts recopiés entre agrégateurs. Les compteurs d'utilisation reflètent les copies réelles de nos visiteurs : fiez-vous aux codes les plus utilisés récemment.`,
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
      {
        question: 'La livraison SHEIN est-elle gratuite en France ?',
        answer: `Oui dès 29€ d'achat en livraison standard (7 à 12 jours ouvrés) ; sous ce seuil, comptez environ 4€. SHEIN organise aussi des jours de livraison gratuite sans minimum, souvent le dimanche. Délais, transporteurs et astuces détaillés sur notre page dédiée livraison gratuite SHEIN.`,
      },
      {
        question: 'Pourquoi mon code SHEIN est-il refusé ?',
        answer: `Quatre causes dominent : le palier minimum n'est pas atteint (les paliers sont calculés après remises automatiques), le code est réservé aux nouveaux clients, la catégorie est exclue (certaines sélections déjà démarquées refusent les codes), ou un autre code est déjà appliqué — SHEIN n'accepte qu'un code par commande. La condition exacte figure sous chaque offre de cette page.`,
      },
    ],
    tips: (s) => [
      { icon: '📸', tip: `Déposez un avis photo après chaque commande SHEIN : les points crédités (100 pts = 1€) se déduisent en caisse en plus des codes promo.` },
      { icon: '📱', tip: `Faites le check-in quotidien dans l'application quelques jours avant une grosse commande : les points et coupons in-app s'accumulent vite.` },
      { icon: '📏', tip: `Vérifiez le tableau de mensurations de chaque article (pas votre taille habituelle) et les photos d'avis clients : c'est le meilleur antidote aux retours payants.` },
      { icon: '🗓️', tip: `Gardez vos gros paniers pour l'anniversaire SHEIN (fin mai-juin), le 11.11 et le Black Friday — les remises y dépassent nettement les codes du reste de l'année.` },
    ],
  },

  /* ───────────────────────────── ASOS ───────────────────────────── */
  asos: {
    intro: (s) =>
      `ASOS est probablement l'enseigne mode la plus généreuse en codes promo du marché français : des opérations -20 à -30% sur tout le site reviennent presque chaque mois, et la plateforme les assume comme levier commercial principal. Le défi n'est donc pas de trouver UN code ASOS, mais de savoir lequel est actif aujourd'hui, sur quel périmètre (tout le site, sélection, marques exclues) et jusqu'à quand. En ${s.month}, cette page suit ${nbOffres(s)} ASOS vérifiée${s.offerCount > 1 ? 's' : ''}${s.bestDiscount ? ` — remise maximale testée : ${s.bestDiscount}` : ''} — re-testées plusieurs fois par jour, car les codes ASOS expirent vite, souvent en 48 à 72 heures.`,
    metaDescription: (s) =>
      `${s.codeCount > 0 ? `${s.codeCount} codes promo ASOS` : `${nbOffres(s)} ASOS`} testés en ${s.month}${s.bestDiscount ? ` → jusqu'à ${s.bestDiscount}` : ''}. Opérations -25%, marques exclues, livraison Premier : les conditions réelles, sans codes morts.`,
    about: (s) => [
      {
        heading: 'Comment fonctionnent les codes promo ASOS',
        text: `ASOS alterne deux types d'opérations. Les codes « sitewide » (-20%, -25%, parfois -30% pour des fenêtres de 24-72h) s'appliquent à presque tout le catalogue, y compris — c'est rare dans la mode — aux articles déjà soldés : c'est le moment où les remises finales atteignent -70% sur l'outlet. Les codes ciblés, eux, visent une sélection (robes, sneakers, une marque précise) ou un public (étudiants, nouveaux clients). Chaque code de cette page indique son périmètre et sa date d'expiration ; vérifiez aussi la liste des marques exclues (certaines marques premium comme Nike ou Dr. Martens sortent régulièrement du périmètre des codes sitewide).`,
      },
      {
        heading: 'La remise étudiante ASOS : -10% permanent, et plus pendant les opérations',
        text: `ASOS accorde une remise étudiante permanente de 10% contre vérification du statut (via UNiDAYS ou Student Beans) — utilisable toute l'année, y compris sur les nouveautés. Pendant les périodes de rentrée et d'examens, elle grimpe ponctuellement à -15 voire -20%. Attention à la règle d'or : un seul code par commande chez ASOS — pendant une opération sitewide à -25%, désactivez le code étudiant et utilisez le code de l'opération, pas l'inverse. Le code étudiant reprend le relais le reste du temps.`,
      },
      {
        heading: 'ASOS Premier : la livraison illimitée qui change le calcul',
        text: `Pour un peu moins de 30€ par an, ASOS Premier offre la livraison express illimitée sans minimum de commande. Le seuil de rentabilité est vite atteint : dès 4-5 commandes annuelles sous le seuil de livraison gratuite standard, l'abonnement est amorti — et il change surtout le comportement d'achat : plus besoin de gonfler un panier pour éviter les frais de port, vous commandez la bonne pièce au bon moment, pendant la bonne opération de codes. Les retours restent gratuits pour tout le monde, Premier ou non, sous 28 jours pour un remboursement.`,
      },
      {
        heading: 'Le calendrier des opérations ASOS',
        text: `Les codes sitewide ASOS suivent un rythme quasi mensuel, avec des pics fiables : rentrée de septembre, Black Friday (historiquement l'opération la plus forte de l'année, jusqu'à -30% sur tout), Noël, janvier (soldes + code par-dessus) et les paydays de fin de mois, où ASOS lance régulièrement des fenêtres de 48h. Entre deux opérations, l'outlet ASOS et la section « dernière chance » tournent en continu — un code ciblé s'y ajoute parfois. Si aucun code sitewide n'est actif aujourd'hui, il y en aura très probablement un dans les deux semaines : mettez votre panier en favoris et revenez vérifier cette page.`,
      },
      {
        heading: 'Tailles, retours et astuces panier chez ASOS',
        text: `ASOS affiche pour chaque article les mensurations du mannequin et la taille portée — croisez-les avec le guide des tailles par marque, car un 40 Nike et un 40 ASOS Design ne taillent pas pareil. L'outil « Fit Assistant » affine ses recommandations à mesure que vous commandez. Côté panier : les articles ASOS restent réservés 60 minutes seulement, mais la liste d'envies est illimitée — stockez-y vos repérages en attendant la prochaine opération de codes. Enfin, surveillez les baisses de prix : un article de la liste d'envies qui passe en démarque + un code sitewide, c'est la combinaison la plus rentable du site.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Quand ASOS lance-t-il ses codes -25% ?',
        answer: `À rythme quasi mensuel : rentrée, paydays de fin de mois, Black Friday (le pic annuel, jusqu'à -30%), Noël et janvier. Ces opérations durent 24 à 72 heures — c'est pourquoi cette page est re-vérifiée plusieurs fois par jour. Astuce : préparez votre liste d'envies à l'avance et déclenchez l'achat quand le code tombe.`,
      },
      {
        question: 'Pourquoi mon code ASOS ne fonctionne-t-il pas ?',
        answer: `Vérifiez dans l'ordre : la date d'expiration (les codes ASOS vivent 48-72h), les marques exclues (certaines marques premium sortent du périmètre), le cumul (un seul code par commande — le code étudiant ne s'ajoute pas à un code sitewide) et le pays du site (un code du site UK ne passe pas sur asos.fr). Chaque code de cette page précise son périmètre exact.`,
      },
      {
        question: 'Les codes ASOS s\u2019appliquent-ils aux articles soldés ?',
        answer: `Oui, la plupart des codes sitewide ASOS fonctionnent sur l'outlet et les articles démarqués — une rareté dans la mode en ligne. C'est la combinaison la plus puissante du site : -70% d'outlet + -25% de code. Seules les exclusions de marques listées dans les conditions du code y échappent.`,
      },
      {
        question: 'ASOS Premier vaut-il le coût ?',
        answer: `Dès 4-5 commandes par an, oui : pour un peu moins de 30€ annuels, la livraison express devient illimitée et sans minimum. Vous cessez de gonfler vos paniers pour atteindre la livraison gratuite, et vous pouvez commander pendant les fenêtres de codes de 48h sans contrainte de seuil. Les retours restent gratuits dans tous les cas.`,
      },
      {
        question: 'Comment obtenir la remise étudiante ASOS ?',
        answer: `Vérifiez votre statut étudiant via UNiDAYS ou Student Beans, puis liez-le à votre compte ASOS : la remise de 10% permanente s'active sous forme de code personnel. Pendant les opérations de rentrée, elle monte ponctuellement à -15/-20%. Rappel : elle ne se cumule pas avec un code sitewide — utilisez le plus fort des deux.`,
      },
    ],
    tips: (s) => [
      { icon: '⏰', tip: `Les codes sitewide ASOS vivent 48 à 72h : préparez votre liste d'envies à l'avance et achetez pendant la fenêtre — pas de panique, une nouvelle opération arrive presque chaque mois.` },
      { icon: '🎓', tip: `Étudiant ? Activez la remise permanente de 10% via UNiDAYS — mais basculez sur le code sitewide quand une opération -25% est active, les deux ne se cumulent pas.` },
      { icon: '🛍️', tip: `Combinez outlet + code : la plupart des codes ASOS s'appliquent aux articles déjà démarqués, ce qui produit les remises finales les plus fortes du site (-70% et plus).` },
      { icon: '👟', tip: `Vérifiez les marques exclues avant de remplir le panier : Nike, Dr. Martens et quelques marques premium sortent régulièrement du périmètre des codes sitewide.` },
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

  /* ───────────────────────────── ADIDAS ────────────────────────────── */
  // GSC Aug 2026: /codes-promo/adidas ranks p.1 for "adidas coupon" (7.6),
  // "adidas code" (9.8) and "adidas coupon code" (10.0) — English-word
  // queries typed by FRENCH users — with ZERO clicks. Title + copy must
  // therefore carry BOTH "code promo Adidas" and "coupon Adidas" naturally.
  adidas: {
    title: (s) => {
      const MAX = 52; // root layout appends " | LockCoupon" (+13), cap 65
      const monthCap = s.month.charAt(0).toUpperCase() + s.month.slice(1);
      const disc = s.bestDiscount ? ` -${s.bestDiscount.replace(/^-/, '')}` : '';
      const candidates = [
        `Coupon Adidas → ${s.codeCount || s.offerCount} codes promo vérifiés${disc} | ${monthCap}`,
        `Coupon Adidas → ${s.codeCount || s.offerCount} codes vérifiés${disc} | ${monthCap}`,
        `Coupon & Code Promo Adidas${disc} | ${monthCap}`,
        `Coupon & Code Promo Adidas | ${monthCap}`,
        `Code Promo Adidas ${new Date().getFullYear()}`,
      ];
      return candidates.find((c) => c.length <= MAX) ?? candidates[candidates.length - 1];
    },
    intro: (s) =>
      `Coupon Adidas, code promo ou remise adiClub : chez adidas, les vraies économies passent par trois canaux distincts qui ne se valent pas — et qui, parfois, se cumulent. En ${s.month}, cette page vérifie ${nbOffres(s)} adidas${s.bestDiscount ? ` (jusqu'à ${s.bestDiscount} de réduction)` : ''}, du code promo classique à saisir en caisse aux ventes outlet permanentes, avec les conditions réelles de chaque offre : minimum d'achat, exclusions (les nouveautés et collabs sont presque toujours hors périmètre) et cumul possible avec les avantages membres adiClub.`,
    metaDescription: (s) =>
      `✅ ${nbOffres(s)} & coupons Adidas testés en ${s.month}${s.bestDiscount ? ` : jusqu'à ${s.bestDiscount}` : ''} sur sneakers, survêtements et outlet. Codes promo vérifiés aujourd'hui, conditions réelles incluses.`,
    about: (s) => [
      {
        heading: 'Coupon Adidas, code promo, remise adiClub : quelle différence ?',
        text: `Trois mécaniques coexistent chez adidas et beaucoup d'acheteurs les confondent. Le code promo Adidas (ou « coupon Adidas », le terme anglais que tape la moitié des chercheurs français) est une suite de caractères à saisir dans le champ dédié du panier — c'est ce que recense la liste en haut de page${s.codeCount > 0 ? `, avec ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} actif${s.codeCount > 1 ? 's' : ''} en ${s.month}` : ''}. La remise adiClub, elle, est liée à votre compte membre : offres personnalisées, accès anticipé aux soldes et bons d'achat contre des points. Enfin, l'outlet adidas affiche des prix déjà barrés, sans code — mais un coupon « outlet » peut parfois s'y ajouter, c'est le meilleur cumul du site. Avant de payer, vérifiez toujours les trois canaux : le bon réflexe prend dix secondes et évite de rater une remise supérieure.`,
      },
      {
        heading: 'adiClub : le programme qui débloque les meilleurs coupons Adidas',
        text: `L'inscription à adiClub est gratuite et change immédiatement la donne : les membres reçoivent un code de bienvenue sur leur première commande, la livraison standard offerte sans minimum, et cumulent des points sur chaque achat comme sur leurs activités Running (via l'app adidas Running). Ces points se convertissent en bons de réduction exclusifs — souvent plus généreux que les codes publics. Les niveaux supérieurs ouvrent l'accès anticipé aux drops et aux soldes membres, ces ventes privées où les pourcentages dépassent ce qu'un coupon Adidas classique offre au grand public. Si vous achetez adidas plus d'une fois par an, adiClub est objectivement le premier « code promo » à activer.`,
      },
      {
        heading: 'Outlet, fins de série et périodes chaudes : payer sa paire au juste prix',
        text: `La section outlet d'adidas.fr est alimentée en continu par les fins de série : sneakers icônes (Samba, Gazelle, Campus, Stan Smith selon les stocks), survêtements, maillots des saisons précédentes — avec des démarques qui atteignent régulièrement -50%. Les codes promo « spécial outlet » se cumulent avec ces prix barrés lors d'opérations ponctuelles : c'est là que se font les meilleures affaires de l'année, avec les soldes légales (janvier/juin-juillet), le Black Friday et la rentrée sportive de septembre. Attention aux exclusions permanentes : les nouveautés, les collaborations (Y-3, Gucci, Wales Bonner…) et certaines exclusivités web refusent la quasi-totalité des codes, quelle que soit la période.`,
      },
    ],
    faq: (s) => [
      {
        question: 'Comment utiliser un coupon Adidas sur adidas.fr ?',
        answer: `Ajoutez vos articles au panier, ouvrez le récapitulatif et repérez le champ « Entrer le code promo » avant l'étape de paiement. Collez votre coupon Adidas, validez : la remise s'applique immédiatement au sous-total si les conditions sont remplies (minimum d'achat, articles éligibles). Un seul code par commande — si vous en avez plusieurs, testez-les pour garder le plus avantageux.`,
      },
      {
        question: 'Pourquoi mon code promo Adidas ne fonctionne-t-il pas ?',
        answer: `Trois causes couvrent l'essentiel des refus : l'article est exclu (nouveautés, collaborations et éditions limitées refusent presque tous les codes), le minimum d'achat n'est pas atteint, ou le code est réservé à un segment précis — nouveaux membres adiClub, étudiants, personnel via UNiDAYS. Vérifiez les conditions affichées sous chaque offre de cette page : nous les indiquons précisément pour éviter les mauvaises surprises en caisse.`,
      },
      {
        question: 'Un coupon Adidas est-il cumulable avec les soldes ou l\u2019outlet ?',
        answer: `Avec l'outlet, oui lors d'opérations dédiées : adidas publie ponctuellement des codes « extra » qui s'ajoutent aux prix déjà barrés — le cumul le plus rentable du site. Pendant les soldes légales, la plupart des codes publics sont désactivés sur les articles démarqués, mais les avantages adiClub (points, bons membres) restent actifs. Comparez toujours le total panier avec et sans code : c'est la seule preuve fiable.`,
      },
      {
        question: 'Adidas propose-t-il une réduction étudiante ?',
        answer: `Oui : les étudiants vérifiés via UNiDAYS bénéficient d'une remise permanente sur adidas.fr (généralement autour de -10 à -15%, hors exclusions). Elle fonctionne comme un code personnel généré après vérification du statut étudiant et n'est pas cumulable avec un autre coupon Adidas sur la même commande — choisissez la remise la plus forte selon votre panier.`,
      },
    ],
  },
};

export function getEditorial(slug: string): StoreEditorial | null {
  return EDITORIAL[slug] ?? null;
}
