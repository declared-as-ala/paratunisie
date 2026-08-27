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
    default: "ParaTunisie | Parapharmacie en ligne en Tunisie",
    template: "%s | ParaTunisie",
  },
  description:
    "Parapharmacie en ligne premium en Tunisie : soins visage, cheveux, solaire et bébé, conseils d'experts et livraison partout en Tunisie.",
  alternates: { canonical: "/" },
  verification: {
    google: "6Rz8hRY9p1DAcNo9GsEkcKkZxxTY0pFEu4iuHN7mZQM",
  },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName: "ParaTunisie",
    title: "ParaTunisie | Parapharmacie en ligne en Tunisie",
    description:
      "Soins authentiques, conseils d'experts et livraison partout en Tunisie.",
    url: "/",
    images: [
      {
        url: "/assets/hero-cinematic-poster.webp",
        width: 1920,
        height: 1080,
        alt: "L'univers de soin ParaTunisie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ParaTunisie | Parapharmacie en ligne en Tunisie",
    description:
      "Soins authentiques, conseils clairs et livraison partout en Tunisie.",
    images: ["/assets/hero-cinematic-poster.webp"],
  },
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
