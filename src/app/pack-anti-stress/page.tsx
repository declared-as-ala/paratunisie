import type { Metadata } from "next";
import { fetchProductBySlug } from "@/lib/api/client";
import { PackAntiStressLanding, type LandingProduct } from "@/components/landing/pack-anti-stress-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: {
    absolute: "Pack Anti-Stress Tunisie | Magnésium + Ashwagandha | ParaTunisie",
  },
  description:
    "Découvrez notre Pack Anti-Stress Magnésium + B6 et Ashwagandha en Tunisie. Routine quotidienne pour soutenir la vitalité, réduire la fatigue et favoriser l'équilibre. Livraison 24–48h.",
  alternates: {
    canonical: `${SITE_URL}/pack-anti-stress`,
  },
  keywords: [
    "pack anti-stress tunisie",
    "magnesium b6 tunisie",
    "ashwagandha biotechusa tunisie",
    "routine anti-stress tunisie",
    "fatigue musculaire tunisie",
    "sommeil recuperation tunisie",
    "paratunisie pack",
  ],
  openGraph: {
    type: "website",
    title: "Pack Anti-Stress Tunisie | Magnésium + Ashwagandha | ParaTunisie",
    description:
      "Routine quotidienne anti-stress : Magnésium + B6 pour les muscles et l'énergie, Ashwagandha pour la sérénité et l'équilibre. Livraison 24–48h en Tunisie.",
    url: `${SITE_URL}/pack-anti-stress`,
    images: [
      {
        url: `${SITE_URL}/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp`,
        alt: "Pack Anti-Stress Magnésium B6 et Ashwagandha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pack Anti-Stress Tunisie | Magnésium + Ashwagandha",
    description: "Routine anti-stress en Tunisie : Magnésium + B6 & Ashwagandha. Livraison 24-48h partout en Tunisie.",
  },
};

export default async function PackAntiStressPage() {
  const [magRaw, ashRaw] = await Promise.all([
    fetchProductBySlug("magnesium-vitamin-b6-90-tablets"),
    fetchProductBySlug("ashwagandha-60-gelules-biotech-usa"),
  ]);

  const magnesium: LandingProduct = {
    id: magRaw?.id || "cmtadbgwh003iuqi0wo5t1kgs",
    name: magRaw?.name || "Magnésium + Vitamine B6 90 comprimés",
    slug: "magnesium-vitamin-b6-90-tablets",
    image: magRaw?.image || "/uploads/products/magnesium-vitamin-b6-90-tablets-4a8b69cd.webp",
    priceMillimes: magRaw?.sizes?.[0]?.priceMillimes || 89000,
    variantId: magRaw?.sizes?.[0] ? undefined : undefined,
    stock: 20,
    inStock: true,
    benefit: magRaw?.benefit || "Réduction de la fatigue musculaire & équilibre nerveux",
    usage: magRaw?.usage || "Prendre 1 à 2 comprimés par jour avec de l'eau.",
  };

  const ashwagandha: LandingProduct = {
    id: ashRaw?.id || "cmtadbh9h0050uqi0a64r4w3r",
    name: ashRaw?.name || "Ashwagandha BioTechUSA 60 gélules",
    slug: "ashwagandha-60-gelules-biotech-usa",
    image: ashRaw?.image || "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
    priceMillimes: ashRaw?.sizes?.[0]?.priceMillimes || 95000,
    variantId: ashRaw?.sizes?.[0] ? undefined : undefined,
    stock: 20,
    inStock: true,
    benefit: ashRaw?.benefit || "Gestion du stress, vitalité & récupération globale",
    usage: ashRaw?.usage || "Prendre 1 gélule le matin avec un grand verre d'eau.",
  };

  const bundleTotalTnd = (magnesium.priceMillimes + ashwagandha.priceMillimes) / 1000;

  // Schema.org JSON-LD Structured Data
  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pack Anti-Stress (Magnésium + B6 & Ashwagandha BioTechUSA)",
    description:
      "Routine anti-stress complète associant le Magnésium + Vitamine B6 et l'Ashwagandha pour réduire la fatigue et soutenir l'équilibre au quotidien.",
    image: [
      `${SITE_URL}${magnesium.image}`,
      `${SITE_URL}${ashwagandha.image}`,
    ],
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/pack-anti-stress`,
      priceCurrency: "TND",
      price: bundleTotalTnd.toString(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "ParaTunisie",
        url: SITE_URL,
      },
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Pourquoi combiner le Magnésium B6 et l'Ashwagandha ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Le Magnésium + B6 aide à réduire la fatigue musculaire et soutient le système nerveux, tandis que l'Ashwagandha favorise la détente et la résistance au stress quotidien.",
        },
      },
      {
        "@type": "Question",
        name: "Comment prendre cette routine quotidienne ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Prenez 1 gélule d'Ashwagandha le matin avec le petit-déjeuner et 1 à 2 comprimés de Magnésium + B6 le soir au dîner ou après l'effort avec un verre d'eau.",
        },
      },
      {
        "@type": "Question",
        name: "Quels sont les délais et modes de livraison en Tunisie ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La livraison est effectuée en 24 à 48h partout en Tunisie avec paiement en espèces à la livraison (Cash on Delivery).",
        },
      },
    ],
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pack Anti-Stress",
        item: `${SITE_URL}/pack-anti-stress`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <PackAntiStressLanding magnesium={magnesium} ashwagandha={ashwagandha} />
    </>
  );
}
