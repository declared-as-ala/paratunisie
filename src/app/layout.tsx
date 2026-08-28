import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/navigation/mobile-tab-bar";
import { GlobalAiAssistant } from "@/components/layout/global-ai-assistant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paratunisie.com"),
  title: {
    default: "ParaTunisie | Parapharmacie en Ligne en Tunisie — Soins & Nutrition",
    template: "%s | ParaTunisie",
  },
  description:
    "ParaTunisie, votre parapharmacie en ligne de référence en Tunisie. Découvrez notre sélection de compléments alimentaires, nutrition sportive (créatine, whey, ashwagandha), vitamines et soins avec livraison rapide 24-48h partout en Tunisie.",
  alternates: { canonical: "/" },
  verification: {
    google: "6Rz8hRY9p1DAcNo9GsEkcKkZxxTY0pFEu4iuHN7mZQM",
    other: {
      "facebook-domain-verification": "mi1xyp6q8u3nc8f83zth36dg94otvu",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName: "ParaTunisie",
    title: "ParaTunisie | Parapharmacie en Ligne en Tunisie — Soins & Nutrition",
    description:
      "Votre parapharmacie en ligne en Tunisie : compléments alimentaires authentiques, nutrition sportive, vitamines et soins livrés partout en Tunisie.",
    url: "/",
    images: [
      {
        url: "/assets/hero-cinematic-poster.webp",
        width: 1920,
        height: 1080,
        alt: "ParaTunisie — Parapharmacie en Ligne en Tunisie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ParaTunisie | Parapharmacie en Ligne en Tunisie — Soins & Nutrition",
    description:
      "Votre parapharmacie en ligne en Tunisie : compléments authentiques et livraison 24-48h.",
    images: ["/assets/hero-cinematic-poster.webp"],
  },
};

const storeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["OnlineStore", "Pharmacy"],
      "@id": "https://paratunisie.com/#organization",
      name: "ParaTunisie",
      alternateName: ["Para Tunisie", "ParaTunisie en Ligne", "Parapharmacie Tunisie"],
      url: "https://paratunisie.com",
      logo: "https://paratunisie.com/assets/hero-cinematic-poster.webp",
      description: "Première parapharmacie en ligne spécialisée en Tunisie : compléments alimentaires, nutrition sportive, vitamines et soins 100% authentiques.",
      telephone: "+21697991266",
      priceRange: "TND",
      currenciesAccepted: "TND",
      paymentAccepted: "Cash on delivery, Cash, Credit Card",
      address: {
        "@type": "PostalAddress",
        addressCountry: "TN",
        addressLocality: "Tunis"
      },
      areaServed: {
        "@type": "Country",
        name: "Tunisia"
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://paratunisie.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://paratunisie.com/#website",
      url: "https://paratunisie.com",
      name: "ParaTunisie",
      publisher: {
        "@id": "https://paratunisie.com/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <meta name="facebook-domain-verification" content="mi1xyp6q8u3nc8f83zth36dg94otvu" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2900022603691735');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2900022603691735&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0">
        <a
          href="#contenu-principal"
          className="fixed start-4 top-4 z-[100] -translate-y-24 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
        >
          Aller au contenu principal
        </a>
        <SiteHeader />
        <main id="contenu-principal" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileTabBar />
      </body>
    </html>
  );
}
