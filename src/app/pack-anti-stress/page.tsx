import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/api/client";
import { PackAntiStressLanding } from "@/components/landing/pack-anti-stress-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [magnesium, ashwagandha] = await Promise.all([
    fetchProductBySlug("magnesium-vitamin-b6-90-tablets"),
    fetchProductBySlug("ashwagandha-60-gelules-biotech-usa"),
  ]);

  const title = "Pack Anti-Stress Tunisie | Magnésium B6 + Ashwagandha | ParaTunisie";
  const description =
    "Duo bien-être Anti-Stress en Tunisie : Magnésium + Vitamine B6 (90 comprimés) et Ashwagandha BioTechUSA (60 gélules). Livraison 24-48h partout en Tunisie, paiement à la livraison.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://paratunisie.com/pack-anti-stress",
    },
    openGraph: {
      title,
      description,
      url: "https://paratunisie.com/pack-anti-stress",
      siteName: "ParaTunisie",
      images: [
        {
          url: "https://paratunisie.com/assets/pack-anti-stress.jpg",
          width: 1024,
          height: 1024,
          alt: "Pack Anti-Stress ParaTunisie - Magnésium B6 et Ashwagandha",
        },
      ],
      locale: "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://paratunisie.com/assets/pack-anti-stress.jpg"],
    },
  };
}

export default async function PackAntiStressPage() {
  const [magnesiumData, ashwagandhaData] = await Promise.all([
    fetchProductBySlug("magnesium-vitamin-b6-90-tablets"),
    fetchProductBySlug("ashwagandha-60-gelules-biotech-usa"),
  ]);

  // Fallback defaults mapped directly to verified DB records
  const magnesium = {
    id: magnesiumData?.id || "cmtadbgwh003iuqi0wo5t1kgs",
    name: magnesiumData?.name || "Magnésium + Vitamine B6 90 Comprimés",
    slug: magnesiumData?.slug || "magnesium-vitamin-b6-90-tablets",
    image: magnesiumData?.image || "/assets/pack-anti-stress.jpg",
    priceMillimes: magnesiumData?.priceMillimes || 89000,
    variantId: "cmtadeekc003juqa4ugek5j19",
    stock: 20,
    inStock: true,
    benefit: "Réduit la fatigue, soutient la fonction musculaire et nerveuse.",
    usage: "1 à 2 comprimés par jour avec un grand verre d'eau.",
  };

  const ashwagandha = {
    id: ashwagandhaData?.id || "cmtadbh9h0050uqi0a64r4w3r",
    name: ashwagandhaData?.name || "Ashwagandha BioTechUSA 60 Gélules",
    slug: ashwagandhaData?.slug || "ashwagandha-60-gelules-biotech-usa",
    image: ashwagandhaData?.image || "/assets/pack-anti-stress.jpg",
    priceMillimes: ashwagandhaData?.priceMillimes || 95000,
    variantId: "cmtadeew00051uqa4olc24dpc",
    stock: 20,
    inStock: true,
    benefit: "Aide au calme, à la relaxation et à l'équilibre en période de stress.",
    usage: "1 gélule par jour avec un repas.",
  };

  return <PackAntiStressLanding magnesium={magnesium} ashwagandha={ashwagandha} />;
}
