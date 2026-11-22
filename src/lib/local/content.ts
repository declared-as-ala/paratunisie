import { CLUSTER_LABEL, DELIVERY, type Cluster, type Governorate, regionNeighbours } from "./governorates";
import type { LocalPageData } from "./page-data";

const joinFr = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`);

export type LocalCopy = {
  title: string;
  description: string;
  h1: string;
  lead: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
  guides: { href: string; label: string }[];
};

/** Metadata + copy built from the governorate's real towns and the live catalogue; wording differs by cluster. */
export function buildLocalCopy(cluster: Cluster, g: Governorate, data: LocalPageData): LocalCopy {
  const towns = joinFr(g.towns.slice(0, 5));
  const cats = data.categories.map((c) => c.name.toLowerCase());
  const catText = cats.length ? joinFr(cats.slice(0, 6)) : "nos catégories";
  const brandText = data.brands.length ? joinFr(data.brands.slice(0, 5)) : "plusieurs marques";
  const delivery = `Livraison ${g.in} : ${DELIVERY.timing}, frais de livraison de ${DELIVERY.feeDt} DT, ${DELIVERY.payment}.`;
  const faqCommon = (productWord: string) => [
    { q: `Comment commander ${productWord} ${g.in} ?`, a: `Ajoutez les produits au panier, indiquez votre adresse ${g.in} et validez la commande. ParaTunisie est une boutique en ligne : il n'y a pas de point de retrait ${g.in} : tout est livré à votre adresse.` },
    { q: "Quels sont les frais de livraison ?", a: `Les frais de livraison sont de ${DELIVERY.feeDt} DT par commande. Le montant exact est affiché dans le panier avant la validation.` },
    { q: "Quel est le délai de livraison ?", a: `Les délais annoncés sont de ${DELIVERY.timing}. Ils sont confirmés au moment de la commande et peuvent varier selon la disponibilité du produit.` },
    { q: "Quels moyens de paiement sont disponibles ?", a: `Le règlement se fait en espèces à la réception du colis (${DELIVERY.payment}).` },
  ];

  if (cluster === "parapharmacie") {
    return {
      title: `Parapharmacie ${g.name} | Vitamines & Compléments`,
      description: `Vitamines, magnésium, oméga-3 et compléments alimentaires livrés ${g.in}. Produits en stock, prix en DT, paiement à la livraison. Commandez sur ParaTunisie.`,
      h1: `Parapharmacie ${g.in} — commandez vos compléments en ligne`,
      lead: `ParaTunisie est une parapharmacie en ligne : vous commandez depuis ${g.name} (${towns}) et vos produits sont livrés à votre adresse. Aujourd'hui, ${data.inStockTotal} références sont affichées en stock dans nos rayons ${catText}.`,
      sections: [
        {
          heading: `Ce que vous pouvez commander ${g.in}`,
          paragraphs: [
            `Notre sélection de parapharmacie se concentre sur les compléments alimentaires : ${catText}. Chaque fiche indique la marque, le format, le prix en dinars et la disponibilité réelle. Parmi les marques actuellement en stock : ${brandText}.`,
            `Nous ne présentons ici que des produits réellement affichés en stock. Si un produit vous intéresse mais n'est pas disponible, la fiche propose de le demander : vous connaissez le prix et le délai avant de vous engager.`,
          ],
        },
        {
          heading: "Comment choisir un complément",
          paragraphs: [
            "Commencez par l'étiquette : composition, dose par portion, nombre de portions et forme du nutriment. Calculez le coût par jour plutôt que le prix du flacon, puis comparez des produits de composition comparable.",
            "Un complément alimentaire ne remplace ni une alimentation variée ni un avis médical. En cas de grossesse, d'allaitement, de maladie ou de traitement en cours, demandez conseil à un médecin ou à un pharmacien avant de commencer.",
          ],
        },
        {
          heading: `Livraison ${g.in}`,
          paragraphs: [
            delivery,
            `La livraison couvre ${g.name} et ses localités, dont ${towns}. Le suivi et la confirmation se font par téléphone ou SMS selon notre politique de livraison, détaillée sur la page livraison.`,
          ],
        },
      ],
      faqs: [
        ...faqCommon("des produits de parapharmacie"),
        { q: "Les produits sont-ils authentiques ?", a: "Notre démarche d'authenticité est décrite sur la page authenticité. Vérifiez à la réception l'emballage, le scellé, le numéro de lot et la date de durabilité minimale." },
      ],
      guides: [
        { href: "/conseils/types-de-magnesium-comparatif", label: "Magnésium : comparer les formes" },
        { href: "/conseils/vitamines-pour-sportifs-guide", label: "Vitamines : les repères essentiels" },
        { href: "/conseils/comment-choisir-omega-3-epa-dha", label: "Oméga-3 : EPA, DHA et qualité" },
        { href: "/conseils/authentique-vs-contrefacon-complements-tunisie", label: "Vérifier l'authenticité d'un complément" },
      ],
    };
  }

  return {
    title: `Protéine ${g.name} | Whey, Créatine & Nutrition Sportive`,
    description: `Whey, créatine, gainers et pre-workout livrés ${g.in}. Produits en stock, prix en DT, paiement à la livraison. Commandez sur ParaTunisie.`,
    h1: `Protéine et nutrition sportive ${g.in} — whey, créatine, gainers`,
    lead: `Vous cherchez de la whey, de la créatine ou un gainer ${g.in} ? ParaTunisie livre depuis la boutique en ligne partout ${g.in} (${towns}). Aujourd'hui, ${data.inStockTotal} références sont affichées en stock : ${catText}.`,
    sections: [
      {
        heading: `La nutrition sportive disponible ${g.in}`,
        paragraphs: [
          `Nos rayons de nutrition sportive couvrent ${catText}. Chaque produit affiche sa marque, son format, son prix en dinars et son état de stock. Marques actuellement en stock : ${brandText}.`,
          "Pour comparer des pots de tailles différentes, le tableau de prix au 100 g présent sur chaque catégorie (créatine, whey) ramène les produits en stock à une même base.",
        ],
      },
      {
        heading: "Choisir selon son objectif",
        paragraphs: [
          "La whey apporte surtout des protéines, le gainer surtout des calories, la créatine est un produit à part qui ne remplace aucun des deux. Lisez la teneur en protéines par portion, la taille de la portion et la liste des ingrédients avant de comparer les prix.",
          "Ces produits sont réservés aux adultes et ne remplacent pas une alimentation équilibrée. Demandez l'avis d'un professionnel de santé en cas de maladie, de traitement en cours, de grossesse ou d'allaitement.",
        ],
      },
      {
        heading: `Livraison ${g.in}`,
        paragraphs: [
          delivery,
          `La commande est livrée à votre adresse ${g.in}, y compris ${towns}. Les grands formats (sacs de gainer de 5 à 7 kg) sont livrés comme les autres produits, aux mêmes conditions.`,
        ],
      },
    ],
    faqs: [
      ...faqCommon("de la whey ou de la créatine"),
      { q: "Comment choisir sa whey protéine ?", a: "Comparez les protéines par portion, le prix par portion et le prix au 100 g. Notre guide d'achat explique la méthode pas à pas." },
    ],
    guides: [
      { href: "/conseils/whey-protein-tunisie-guide", label: "Whey protéine : guide d'achat" },
      { href: "/conseils/meilleure-creatine-tunisie", label: "Créatine : comparatif et guide" },
      { href: "/conseils/guide-achat-whey-prix-au-kilo-tunisie", label: "Comparer le prix des protéines" },
      { href: "/conseils/meilleur-gainer-tunisie", label: "Gainers : comment choisir" },
    ],
  };
}

export const otherClusterPath = (cluster: Cluster, slug: string) =>
  `${CLUSTER_LABEL[cluster === "parapharmacie" ? "proteine" : "parapharmacie"].path}/${slug}`;

export const neighbourLinks = (cluster: Cluster, slug: string) =>
  regionNeighbours(slug).map((n) => ({ href: `${CLUSTER_LABEL[cluster].path}/${n.slug}`, label: n.name }));
