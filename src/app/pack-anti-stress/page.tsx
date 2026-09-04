import type { Metadata } from "next";
import { fetchProductBySlug } from "@/lib/api/client";
import { PackAntiStressLanding, type LandingProduct } from "@/components/landing/pack-anti-stress-page";
import {
  buildPageMetadata,
  buildBreadcrumbsSchema,
  buildProductSchema,
  buildFaqSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pack Anti-Stress Tunisie | Magnésium + Ashwagandha",
  description:
    "Découvrez notre Pack Anti-Stress Magnésium + B6 et Ashwagandha en Tunisie. Routine quotidienne pour soutenir la vitalité, réduire la fatigue et favoriser l'équilibre. Livraison 24–48h.",
  path: "/pack-anti-stress",
  image: "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
  keywords: [
    "pack anti-stress tunisie",
    "magnesium b6 tunisie",
    "ashwagandha biotechusa tunisie",
    "routine anti-stress tunisie",
    "fatigue musculaire tunisie",
    "sommeil recuperation tunisie",
    "paratunisie pack",
  ],
});

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

  const jsonLdProduct = buildProductSchema({
    name: "Pack Anti-Stress (Magnésium + B6 & Ashwagandha BioTechUSA)",
    slug: "pack-anti-stress",
    image: magnesium.image,
    description:
      "Routine anti-stress complète associant le Magnésium + Vitamine B6 et l'Ashwagandha pour réduire la fatigue et soutenir l'équilibre au quotidien.",
    priceTnd: bundleTotalTnd,
    inStock: true,
  });

  const jsonLdFaq = buildFaqSchema([
    {
      question: "Pourquoi combiner le Magnésium B6 et l'Ashwagandha ?",
      answer:
        "Le Magnésium + B6 aide à réduire la fatigue musculaire et soutient le système nerveux, tandis que l'Ashwagandha favorise la détente et la résistance au stress quotidien.",
    },
    {
      question: "Comment prendre cette routine quotidienne ?",
      answer:
        "Prenez 1 gélule d'Ashwagandha le matin avec le petit-déjeuner et 1 à 2 comprimés de Magnésium + B6 le soir au dîner ou après l'effort avec un verre d'eau.",
    },
    {
      question: "Quels sont les délais et modes de livraison en Tunisie ?",
      answer:
        "La livraison est effectuée en 24 à 48h partout en Tunisie avec paiement en espèces à la livraison (Cash on Delivery).",
    },
  ]);

  const jsonLdBreadcrumb = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Pack Anti-Stress", url: "/pack-anti-stress" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb).replace(/</g, "\\u003c") }}
      />
      <PackAntiStressLanding magnesium={magnesium} ashwagandha={ashwagandha} />
    </>
  );
}
