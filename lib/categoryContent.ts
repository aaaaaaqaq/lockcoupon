/**
 * lib/categoryContent.ts — hand-written editorial content for the 8 category
 * pages (/codes-promo/categorie/[slug]).
 *
 * Why (SEMrush audit, Aug 2026): the category pages carried ~120 words of
 * shared template text → flagged as thin content. Each category now gets
 * 300-500 words of UNIQUE copy: intro, « comment ça marche » steps and a
 * 4-question FAQ, mirrored in FAQPage JSON-LD on the page.
 *
 * Pure TS, importable from server components.
 */

export interface CategoryFaqItem {
  question: string;
  answer: string;
}

export interface CategoryEditorial {
  /** 2 intro paragraphs rendered under « Comment économiser… » */
  intro: string[];
  /** « Comment ça marche » — 3 numbered steps, category-specific */
  steps: { title: string; text: string }[];
  /** 4 FAQ items, also injected as FAQPage JSON-LD */
  faq: CategoryFaqItem[];
}

export const CATEGORY_EDITORIAL: Record<string, CategoryEditorial> = {
  mode: {
    intro: [
      "La mode est la catégorie reine du code promo en France : entre les nouvelles collections qui tombent toutes les deux semaines, les ventes privées et les opérations newsletter, il se passe rarement une semaine sans une vraie remise chez ASOS, SHEIN, Zalando, H&M ou Kiabi. Le revers de la médaille, c'est le bruit : beaucoup de codes qui circulent sont expirés, réservés aux nouveaux clients ou limités à une sélection. Notre équipe teste chaque offre mode en caisse avant publication, et retire les codes morts à chaque passage de vérification.",
      "Le bon réflexe pour les vêtements et chaussures : ne jamais acheter une nouveauté à prix plein sans vérifier cette page. Les basiques (jeans, t-shirts, baskets) sont remisés en quasi-permanence quelque part, et les pièces de collection perdent 50 à 70 % en fin de saison. Les codes se cumulent d'ailleurs souvent avec les démarques affichées — c'est la combinaison la plus rentable de toute la catégorie.",
    ],
    steps: [
      { title: 'Choisissez votre boutique mode', text: "Parcourez les enseignes ci-dessus, classées par nombre d'offres actives. Chaque page boutique liste ses codes vérifiés, du bon de bienvenue aux remises par rayon." },
      { title: 'Copiez le code adapté à votre panier', text: "Vérifiez la condition affichée sous chaque code (minimum d'achat, exclusion des articles soldés, nouveaux clients) : c'est la cause n°1 des codes « qui ne marchent pas » en mode." },
      { title: 'Appliquez-le au paiement', text: "Collez le code dans le champ dédié avant de valider. Astuce : comparez le total avec code et avec les remises automatiques du site — quand le cumul est refusé, gardez la combinaison la plus avantageuse." },
    ],
    faq: [
      { question: 'Quand acheter des vêtements moins cher en ligne ?', answer: "Quatre fenêtres dominent l'année : les soldes d'hiver (janvier), les soldes d'été (fin juin), le Black Friday et les ventes privées d'avant-soldes réservées aux membres ou abonnés newsletter. Entre ces pics, les ventes flash mi-saison (avril et octobre) offrent de vraies remises sur les collections en cours." },
      { question: 'Les codes promo mode fonctionnent-ils sur les articles soldés ?', answer: "Ça dépend des enseignes : SHEIN et ASOS acceptent généralement le cumul code + démarque, tandis que Kiabi ou Zara excluent souvent les articles déjà remisés. La condition exacte est précisée sous chaque code de nos pages boutiques — vérifiez-la avant de remplir votre panier." },
      { question: 'Comment obtenir une remise sur sa première commande mode ?', answer: "Presque toutes les enseignes mode offrent un code de bienvenue contre une inscription à la newsletter : -10 % chez H&M et Zalando, -15 % chez ASOS et SHEIN selon les périodes. Utilisez une adresse e-mail jamais inscrite chez l'enseigne, et gardez ce code pour un panier conséquent : il n'est utilisable qu'une fois." },
      { question: 'Quelles boutiques mode ont le plus de codes actifs ?', answer: "Les pure players (SHEIN, ASOS, Boohoo, bonprix) publient le plus de codes, avec des remises fréquentes de 15 à 25 %. Les enseignes physiques (Zara, Mango) misent plutôt sur les démarques que sur le couponing. Le classement en haut de cette page reflète le nombre d'offres actives vérifiées aujourd'hui." },
    ],
  },
  'high-tech': {
    intro: [
      "Le high-tech ne se coupe pas comme la mode : sur les smartphones, PC et TV, les marges sont serrées et les codes « -20 % sur tout » n'existent pratiquement pas. Les vraies économies passent par trois canaux — les événements (Black Friday, French Days), les offres de remboursement (ODR) des fabricants, et les codes ciblés sur les accessoires, le stockage ou le reconditionné. Cette page regroupe les enseignes tech où nos codes sont réellement testés : Amazon, Fnac, Darty, Boulanger, Cdiscount, Back Market et les autres.",
      "Un principe à garder en tête : sur l'électronique, comparer bat couponner. Un code de 5 % sur du neuf perd face à une bonne offre de reconditionné garanti chez Back Market, et le même téléviseur varie parfois de 15 % entre deux enseignes le même jour. Utilisez nos pages boutiques pour croiser le prix remisé avec la concurrence avant de valider.",
    ],
    steps: [
      { title: 'Repérez le bon canal pour votre produit', text: "Accessoires et petit électroménager : les codes classiques fonctionnent. Derniers smartphones et TV : cherchez plutôt les ODR fabricants et les packs. Produits de génération précédente : le reconditionné ou les ventes flash font mieux que les codes." },
      { title: 'Croisez les prix entre enseignes', text: "Le même produit tech est vendu par 5 à 10 marchands : ouvrez 2-3 pages boutiques de cette catégorie et comparez le prix final, code appliqué, livraison incluse." },
      { title: 'Appliquez le code au paiement', text: "Collez le code dans le panier avant de valider et vérifiez que la remise s'affiche. Sur les marketplaces (Amazon, Cdiscount), certains codes ne passent que sur les articles expédiés par la plateforme elle-même." },
    ],
    faq: [
      { question: 'Quand acheter du high-tech au meilleur prix ?', answer: "Le Black Friday (fin novembre) reste l'événement n°1, suivi des French Days (printemps et automne) et de la rentrée de septembre. Autre fenêtre méconnue : les semaines qui suivent l'annonce d'une nouvelle génération (iPhone, cartes graphiques, TV), où la génération précédente perd 15 à 30 %." },
      { question: 'Les codes promo fonctionnent-ils sur les iPhone et consoles ?', answer: "Rarement en direct : Apple, Sony et Nintendo verrouillent leurs prix. Les économies passent par les offres de reprise, les packs avec accessoires, les cartes cadeaux remisées et le reconditionné certifié. Sur les accessoires (coques, manettes, chargeurs), en revanche, les codes classiques s'appliquent sans problème." },
      { question: 'Neuf ou reconditionné : que choisir pour économiser ?', answer: "Pour un smartphone ou un ordinateur portable de moins de trois ans, le reconditionné garanti (Back Market, Amazon Seconde Main) économise 30 à 50 % pour un usage identique. Le neuf garde l'avantage sur les produits à batterie très sollicitée ou les toutes dernières générations. Nos codes couvrent les deux marchés." },
      { question: "Qu'est-ce qu'une ODR et comment la cumuler avec un code ?", answer: "Une offre de remboursement (ODR) est un remboursement différé versé par le fabricant après achat, sur dossier. Elle se cumule presque toujours avec un code promo du marchand, puisque les deux remises viennent d'acteurs différents : code au paiement + ODR après coup, c'est le cumul le plus puissant du high-tech." },
    ],
  },
  maison: {
    intro: [
      "Meubler ou rénover coûte cher, mais la catégorie maison & déco est aussi celle où un simple pourcentage pèse le plus lourd : -10 % sur un canapé à 1 200 €, c'est 120 € — l'équivalent de dix codes promo mode. IKEA, Maisons du Monde, BUT, Conforama ou Leroy Merlin suivent tous un calendrier précis de remises, et cette page centralise leurs offres vérifiées : codes par rayon, ventes flash mobilier et bons plans livraison.",
      "Le poste caché de la catégorie, c'est justement la livraison : entre 30 et 90 € pour un meuble volumineux, elle peut annuler l'intérêt d'un code. Avant de valider, vérifiez toujours les offres « livraison offerte » de nos pages boutiques — elles font souvent gagner plus qu'une remise en pourcentage — et pensez au retrait en magasin ou en dépôt, gratuit chez la plupart des enseignes de cette page.",
    ],
    steps: [
      { title: 'Chiffrez votre projet avant de chercher le code', text: "Sur du mobilier, le bon ordre est : liste précise des articles → comparaison entre 2-3 enseignes → code promo en dernier. Un code -15 % chez BUT peut battre un -20 % chez un concurrent plus cher au départ." },
      { title: 'Surveillez le calendrier des collections', text: "Les changements de collection (janvier et septembre) déclenchent les vraies liquidations mobilier. Les soldes et le Black Friday couvrent plutôt l'électroménager et la déco." },
      { title: 'Optimisez la livraison', text: "Appliquez votre code au paiement, puis comparez livraison à domicile, retrait dépôt et livraison offerte par palier. Sur un achat volumineux, franchir un seuil de gratuité avec un petit accessoire utile est presque toujours rentable." },
    ],
    faq: [
      { question: 'Quand acheter ses meubles moins cher ?', answer: "Deux fenêtres dominent : janvier (soldes + changement de collection) et septembre (nouvelle collection, liquidation de l'ancienne). Pour l'électroménager, ajoutez le Black Friday. Les canapés et la literie, produits à forte marge, sont remisés quasiment toute l'année quelque part — comparez avant de payer un prix « promo » affiché." },
      { question: 'Les codes promo IKEA existent-ils vraiment ?', answer: "IKEA distribue peu de codes publics : l'essentiel passe par le programme IKEA Family (offres membres, remises ateliers) et les offres de reprise. Les autres enseignes de la catégorie (BUT, Conforama, Maisons du Monde, La Redoute Intérieurs) sont beaucoup plus actives en couponing classique — nos pages boutiques listent ce qui est réellement vérifié." },
      { question: 'Comment éviter les frais de livraison sur les meubles ?', answer: "Trois leviers : les offres « livraison offerte » ponctuelles (listées sur nos pages boutiques), les seuils de gratuité — souvent 200 à 400 € en mobilier —, et le retrait en magasin ou en dépôt, gratuit chez BUT, Conforama ou Leroy Merlin. Sur un meuble volumineux, ce poste vaut 30 à 90 €." },
      { question: 'Un code promo maison se cumule-t-il avec les soldes ?', answer: "Souvent oui sur la déco et le linge de maison, plus rarement sur le gros mobilier déjà démarqué. La règle générale : les codes « panier » (ex. -10 % dès 100 €) passent sur les articles soldés, les codes « rayon » excluent fréquemment les fins de série. La condition exacte figure sous chaque code." },
    ],
  },
  beaute: {
    intro: [
      "La beauté est l'une des catégories les plus généreuses en codes promo — et l'une des rares où le cumul est presque toujours autorisé : code promo + points fidélité + échantillons, la parfumerie française (Sephora, Nocibé, Marionnaud, Yves Rocher) a construit tout son marketing là-dessus. Résultat : payer un parfum ou un coffret à prix plein est pratiquement toujours une erreur, quelle que soit la période de l'année.",
      "Les remises ne se valent pas selon les produits : les parfums et coffrets concentrent les plus fortes réductions (jusqu'à -50 % en ventes privées), les soins visage suivent, tandis que le maquillage passe plutôt par des mécaniques « 2 achetés = 1 offert ». Nos pages boutiques trient les offres vérifiées par enseigne, avec les conditions réelles de chaque code — minimum d'achat, marques exclues, cumul fidélité.",
    ],
    steps: [
      { title: 'Inscrivez-vous au programme fidélité AVANT de commander', text: "Sephora (Beauty Insider), Nocibé, Marionnaud et Yves Rocher créditent des points dès le premier achat, convertibles en euros. Non rétroactif : créez le compte avant, pas après." },
      { title: 'Choisissez le bon code pour votre panier', text: "Les codes beauté excluent souvent quelques marques de luxe (Chanel, Dior) : vérifiez la liste d'exclusion sous le code avant de composer votre panier." },
      { title: 'Cumulez au paiement', text: "Appliquez le code promo, puis déduisez vos points fidélité sur le même paiement — le cumul est autorisé chez la quasi-totalité des parfumeries. Les échantillons et miniatures s'ajoutent en caisse sans condition." },
    ],
    faq: [
      { question: 'Quand acheter ses parfums moins cher ?', answer: "Les ventes privées de printemps (mars-avril) et d'automne (octobre), la fête des mères et les coffrets de fin d'année concentrent les meilleures remises — jusqu'à -50 % sur les parfums. Astuce contre-intuitive : janvier, juste après les fêtes, liquide les coffrets de Noël à prix cassé." },
      { question: 'Les codes promo beauté se cumulent-ils avec la carte fidélité ?', answer: "Oui, c'est même la norme en parfumerie : le code s'applique au panier, les points fidélité se déduisent ensuite sur le même paiement. C'est l'une des rares catégories où ce cumul est officiellement autorisé partout — Sephora, Nocibé, Marionnaud et Yves Rocher l'acceptent tous." },
      { question: 'Pourquoi mon code Sephora ou Nocibé est-il refusé ?', answer: "Cause n°1 : les marques exclues. La plupart des codes beauté excluent une liste de marques sélectives (souvent Chanel, Dior, La Mer…) et les coffrets déjà remisés. Cause n°2 : le minimum d'achat, calculé après déduction des remises automatiques. Le détail figure sous chaque code de nos pages." },
      { question: 'Yves Rocher est-il vraiment moins cher avec les codes ?', answer: "Yves Rocher pratique un couponing intensif : codes -50 % sur une sélection, cadeaux dès X € d'achat, offres anniversaire… La contrepartie : les prix catalogue sont calibrés pour ces promos permanentes. Ne commandez jamais chez Yves Rocher sans code — il y en a pratiquement toujours un actif sur notre page dédiée." },
    ],
  },
  voyage: {
    intro: [
      "Le voyage est la catégorie où l'écart entre bien et mal acheter est le plus spectaculaire : le même vol, la même chambre ou la même location peut varier du simple au double selon la date de réservation, la flexibilité et les remises appliquées. Les codes promo existent — Booking, Expedia, Lastminute ou Opodo en distribuent régulièrement — mais ils ne sont qu'un levier parmi d'autres : les remises membres (Genius chez Booking), les tarifs semaine/mois sur Airbnb et les ventes flash séjours pèsent souvent plus lourd.",
      "Notre approche sur cette page : lister uniquement les offres voyage vérifiées et leurs conditions réelles, et rappeler les mécaniques qui fonctionnent vraiment. Règle d'or de la catégorie : un code promo voyage s'applique presque toujours à l'hébergement ou au pack vol + hôtel, très rarement au vol sec — si un site vous promet -20 % sur n'importe quel billet d'avion, méfiance.",
    ],
    steps: [
      { title: 'Comparez avant de couponner', text: "Vérifiez le prix de votre séjour sur 2-3 plateformes (Booking, Expedia, le site de l'hôtel) : les écarts dépassent souvent la valeur d'un code. Les dates flexibles font varier le même séjour de 20 à 40 %." },
      { title: 'Activez les avantages membres', text: "Booking Genius, les programmes hôteliers et les tarifs abonnés se déclenchent gratuitement à la connexion. Ils se cumulent généralement avec les codes de cette page." },
      { title: 'Appliquez le code à la réservation', text: "Le champ code promo apparaît au moment du paiement (ou dans « codes et réductions » sur mobile). Vérifiez que la remise s'affiche sur le total avant de confirmer — et privilégiez les tarifs annulables si vos dates peuvent bouger." },
    ],
    faq: [
      { question: 'Quand réserver pour payer son voyage moins cher ?', answer: "Pour l'été : janvier-février (early booking, jusqu'à -30 % sur les séjours). Pour les city-trips : 3 à 6 semaines avant le départ. Pour le ski : septembre-octobre. Et toute l'année, partir en semaine plutôt que le week-end économise 15 à 30 % sur l'hébergement. Les ventes flash de dernière minute restent l'arme des voyageurs flexibles." },
      { question: 'Les codes promo fonctionnent-ils sur les vols ?', answer: "Presque jamais sur le vol sec : les marges des billets d'avion sont trop faibles. Les codes Expedia, Opodo ou Lastminute visent l'hôtel ou le pack vol + hôtel, où la remise peut atteindre 10 à 20 %. Pour les vols, jouez plutôt la flexibilité des dates et la réservation anticipée." },
      { question: "Qu'est-ce que le programme Genius de Booking ?", answer: "Un programme de fidélité gratuit et automatique : dès quelques réservations, vous débloquez -10 % puis -15 à -20 % sur les hébergements partenaires, avec surclassements et petits-déjeuners offerts aux niveaux supérieurs. Il se cumule avec les offres saisonnières de Booking — connectez-vous toujours avant de réserver." },
      { question: 'Airbnb propose-t-il des codes promo ?', answer: "Quasiment plus : le champ coupon a disparu pour le grand public. Les vraies économies Airbnb passent par les remises automatiques des hôtes à la semaine (-10 à -20 %) et au mois (-20 à -50 %), les dates flexibles et la négociation directe avec l'hôte pour les longs séjours — notre page Airbnb détaille la méthode complète." },
    ],
  },
  sport: {
    intro: [
      "Le sport est une catégorie idéale pour le couponing : les collections tournent chaque saison, et les modèles de l'année précédente — chaussures de running, textile, équipement — perdent 30 à 50 % pour des performances quasi identiques. Nike, Adidas, Decathlon, Intersport ou Courir alimentent en permanence leurs sections outlet, et les codes promo s'y cumulent souvent, ce qui produit les remises finales les plus élevées de tout l'e-commerce français.",
      "La stratégie gagnante est simple : sauf besoin urgent, ne jamais acheter la toute dernière version d'une chaussure de sport. Le modèle N-1, remisé et couponné, revient à la moitié du prix pour 95 % de l'usage. Nos pages boutiques listent les codes vérifiés de chaque enseigne, y compris les offres membres (Nike Membership, comptes Adidas) qui débloquent des ventes réservées.",
    ],
    steps: [
      { title: 'Ciblez les fins de collection', text: "Cherchez votre modèle dans la section outlet ou « fin de série » de l'enseigne : c'est là que les prix de départ sont les plus bas, et les codes de cette page s'y appliquent souvent en plus." },
      { title: 'Créez le compte membre gratuit', text: "Nike, Adidas et Courir réservent leurs meilleures ventes et un code de bienvenue à leurs membres. Gratuit, immédiat, et cumulable avec la plupart des offres publiques." },
      { title: 'Appliquez le code et comparez', text: "Collez le code au paiement et vérifiez le total : sur les grosses pointures et les tailles courantes, comparez avec Decathlon et Intersport, dont les marques propres cassent les prix de référence." },
    ],
    faq: [
      { question: 'Quand acheter ses chaussures de running moins cher ?', answer: "Aux changements de collection : janvier-février et août-septembre, quand la version N+1 sort et que le modèle précédent bascule en outlet à -30/-40 %. Ajoutez un code promo et la remise finale atteint souvent -50 %. Le Black Friday fonctionne aussi, mais les tailles courantes partent en quelques heures." },
      { question: 'Les codes promo Nike et Adidas sont-ils fiables ?', answer: "Oui, à une condition : passer par les comptes membres. Nike et Adidas réservent l'essentiel de leurs codes aux membres connectés (adhésion gratuite), et les codes « publics » qui circulent ailleurs sont souvent morts. Nos pages listent les offres réellement testées, membres et publiques, avec leur condition exacte." },
      { question: 'Decathlon fait-il des codes promo ?', answer: "Rarement : Decathlon mise sur les prix bas permanents de ses marques propres (Quechua, Kalenji, Domyos) et sur sa section « deuxième vie » (produits reconditionnés). Les vraies affaires Decathlon sont là, plus que dans le couponing — et pour les marques internationales, comparez avec Intersport et Courir, plus actifs en codes." },
      { question: "L'équipement de sport (vélos, haltères, raquettes) est-il couponnable ?", answer: "Moins que le textile : le matériel passe surtout par les grands événements (Black Friday, French Days) et les destockages de fin de saison — vélos en septembre-octobre, matériel de fitness en été. Les codes « panier » (ex. -10 % dès 100 €) restent votre meilleure option le reste de l'année." },
    ],
  },
  alimentation: {
    intro: [
      "Les courses et la livraison de repas sont le poste de dépense le plus régulier des ménages — et paradoxalement celui où l'on pense le moins aux codes promo. Pourtant, la catégorie est généreuse : les codes « première commande » du drive et de la livraison (Carrefour, Auchan, Uber Eats, Deliveroo) dépassent souvent 10 € de remise immédiate, là où les promos classiques plafonnent à 5 %. Picard, Just Eat et les enseignes de courses en ligne complètent le tableau avec des offres régulières par rayon.",
      "La mécanique clé de la catégorie : les plateformes paient cher l'acquisition de nouveaux clients. Première commande drive, premier panier livré, première commande sur l'app — chaque « première fois » vaut une remise substantielle. Ensuite, les codes de réactivation (« vous nous manquez ») prennent le relais si vous espacez vos commandes. Nos pages boutiques précisent pour chaque code s'il vise les nouveaux clients ou tous les comptes.",
    ],
    steps: [
      { title: 'Épuisez les offres « première commande »', text: "Drive Carrefour, Auchan, Uber Eats, Deliveroo, Just Eat : chaque plateforme offre une remise de bienvenue (souvent 10 € et plus). Utilisez-les l'une après l'autre pour vos courses des premières semaines." },
      { title: 'Respectez les minimums de commande', text: "Les codes courses exigent presque tous un panier minimum (30 à 60 € en drive, 15 à 25 € en livraison repas). Les frais de livraison ne comptent pas dans le minimum : vérifiez le sous-total produits." },
      { title: 'Appliquez le code avant de valider', text: "Le champ se trouve au récapitulatif de commande. En livraison de repas, comparez aussi avec l'option « à emporter » : retirer soi-même supprime les frais et garde la plupart des promos." },
    ],
    faq: [
      { question: 'Comment avoir 10 € de remise sur ses courses en ligne ?', answer: "Via les offres première commande du drive : Carrefour, Auchan et les enseignes de courses en ligne offrent régulièrement 10 à 15 € de remise sur le premier panier (minimum d'achat autour de 60 €). Chaque enseigne ne l'offre qu'une fois — enchaînez les plateformes pour cumuler plusieurs dizaines d'euros d'économies." },
      { question: 'Les codes Uber Eats et Deliveroo fonctionnent-ils pour les clients existants ?', answer: "Les plus généreux sont réservés aux nouveaux comptes, mais il existe deux recours : les codes de réactivation envoyés automatiquement si vous n'avez pas commandé depuis quelques semaines (-20 à -50 %), et les offres restaurants dans l'application (-30 %, 1 acheté = 1 offert), accessibles à tous. Notre astuce : espacez vos commandes entre plusieurs plateformes." },
      { question: 'Peut-on économiser sur les produits frais ?', answer: "Rarement par code : les produits frais sont exclus de la plupart des promos. Les vraies économies passent par les rayons anti-gaspi des drives, les paniers de produits à date courte, et chez Picard par les offres fidélité sur les rayons surgelés. Les codes s'appliquent en revanche pleinement à l'épicerie et à l'entretien." },
      { question: 'La livraison de courses est-elle rentable face au magasin ?', answer: "Avec un code première commande et un panier au-dessus du minimum, oui, largement. Ensuite, le drive gratuit reste l'option la plus économique : mêmes prix qu'en magasin, sans frais de livraison, et il neutralise les achats d'impulsion — la plus grosse économie invisible de la catégorie." },
    ],
  },
  marketplace: {
    intro: [
      "Temu, AliExpress, Amazon, Cdiscount, eBay, Rakuten : les marketplaces concentrent aujourd'hui l'essentiel des codes promo agressifs du web français. La raison est structurelle : des milliers de vendeurs s'y disputent chaque client, et les plateformes elles-mêmes subventionnent l'acquisition à coups de packs de coupons, roues à cadeaux et offres nouveaux clients. Le revers : c'est aussi la catégorie où circulent le plus de codes morts, de liens de parrainage déguisés et de prix barrés théâtraux.",
      "Notre travail sur cette page : trier. Chaque code marketplace listé sur nos pages boutiques est testé en caisse sur un vrai panier, avec sa condition exacte — nouveau client ou tous comptes, application ou site web, palier de panier. Et un réflexe à garder : sur une marketplace, vérifiez toujours le vendeur avant d'appliquer un code, car certains codes ne fonctionnent que sur les articles expédiés par la plateforme elle-même.",
    ],
    steps: [
      { title: 'Identifiez la famille du code', text: "Les marketplaces distinguent codes nouveaux clients (les plus généreux), packs de coupons fractionnés par paliers, et codes tous comptes. Un code refusé est presque toujours un code de la mauvaise famille — pas un code mort." },
      { title: 'Vérifiez le vendeur et le prix réel', text: "Comparez le prix final avec la même référence ailleurs : les prix barrés des marketplaces sont souvent gonflés. Et privilégiez les articles expédiés par la plateforme, seuls éligibles à certains codes." },
      { title: 'Payez dans l\u2019application quand c\u2019est possible', text: "Temu, AliExpress et SHEIN réservent leurs meilleures remises à l'app mobile : repérez l'offre ici, copiez le code, finalisez dans l'application au moment du paiement." },
    ],
    faq: [
      { question: 'Les packs « 100 € de coupons » Temu ou AliExpress sont-ils réels ?', answer: "Oui, mais fractionnés : il s'agit d'un lot de bons à paliers (ex. -10 € dès 50 €, -25 € dès 120 €) à consommer sur plusieurs commandes — personne ne déduit 100 € d'un panier de 110 €. Bien utilisés, paniers groupés juste au-dessus de chaque palier, ils restent très rentables sur un gros achat réparti." },
      { question: 'Pourquoi mon code marketplace ne fonctionne-t-il pas ?', answer: "Trois causes couvrent 90 % des cas : le code est réservé aux nouveaux comptes et le vôtre a déjà commandé ; le palier de panier n'est pas atteint ; ou le code est exclusif à l'application et vous commandez sur le site. La mention sous chaque code de nos pages précise la condition exacte." },
      { question: 'Amazon accepte-t-il les codes promo ?', answer: "Oui, mais différemment : Amazon fonctionne par coupons à cocher sur les fiches produits, codes par catégories ponctuels et offres abonnés Prime, plus que par codes génériques. Les grands rendez-vous (Prime Day, Black Friday) restent les meilleures fenêtres — notre page Amazon détaille les mécaniques spécifiques." },
      { question: 'Les petits prix Temu et AliExpress sont-ils fiables ?', answer: "Sur le paiement et la livraison, oui : TVA incluse dans le prix affiché, pas de frais de douane sous 150 €, remboursement en cas de colis perdu. La vigilance porte sur les prix barrés (souvent théâtraux — comparez la remise réelle) et sur les avis produits, à lire avec photos à l'appui avant tout achat volumineux." },
    ],
  },
};

export function getCategoryEditorial(slug: string): CategoryEditorial | null {
  return CATEGORY_EDITORIAL[slug] ?? null;
}
