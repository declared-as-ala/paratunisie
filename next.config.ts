import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@paratunisie/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "paratunisie.com" },
      { protocol: "https", hostname: "*.paratunisie.com" },
      { protocol: "https", hostname: "admin.protein.tn" },
      { protocol: "https", hostname: "tunisiepara.com" },
      { protocol: "https", hostname: "*.tunisiepara.com" },
      { protocol: "https", hostname: "cloudinary.images-iherb.com" },
      { protocol: "https", hostname: "*.images-iherb.com" },
      { protocol: "https", hostname: "images-iherb.com" },
      { protocol: "https", hostname: "*.iherb.com" },
      { protocol: "https", hostname: "iherb.com" },
      { protocol: "https", hostname: "s3.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  turbopack: {
    // Keep Next scoped to this project. A separate lockfile exists higher in
    // the user's home directory and must never influence this application.
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
              "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://api.paratunisie.com",
              "img-src 'self' data: https: https://www.facebook.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-src 'self' https://www.googletagmanager.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Session-bound or customer-specific pages: never stored by a shared cache / CDN, whatever the rendering mode.
        source: "/:path(panier|checkout|paiement|compte|favoris|fidelite|le-cercle)/:rest*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/:path(panier|checkout|paiement|compte|favoris|fidelite|le-cercle)",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
  async redirects() {
    return [
      // Historical/legacy URLs with a genuinely equivalent current page (SEO-004). /proteine-sousse has no equivalent and stays 404.
      { source: "/blog", destination: "/conseils", permanent: true },
      { source: "/blog/:slug", destination: "/conseils/:slug", permanent: true },
      { source: "/brands", destination: "/marques", permanent: true },
      { source: "/brands/:slug", destination: "/marques/:slug", permanent: true },
      { source: "/qui-sommes-nous", destination: "/a-propos", permanent: true },
      // Recovered from Search Console (historic 404s with clicks). Only exact equivalents or exact product-type categories;
      // see docs/seo/REDIRECT_MAP.csv. Old catalogue items with no current equivalent intentionally stay 404.
      { source: "/probiotiques/now-foods-probiotic-10-30-gelules-vegetales", destination: "/produits/now-foods-probiotic-10-30-gelules-vegetales", permanent: true },
      { source: "/magnesium/thorne-magnesium-glycinate-180-gelules", destination: "/produits/thorne-magnesium-glycinate-180-gelules", permanent: true },
      { source: "/magnesium/micro-ingredients-mag-duo-advanced-magnesium-formula-lemonade-180-g", destination: "/produits/micro-ingredients-mag-duo-advanced-magnesium-formula-lemonade-180-g", permanent: true },
      { source: "/articulations/dr-kellyann-bone-broth-fast-track-turmeric-ginger-21-g", destination: "/produits/dr-kellyann-bone-broth-fast-track-turmeric-ginger-21-g", permanent: true },
      { source: "/produits/young-health-omega-3-boite-90-capsules", destination: "/omega-3", permanent: true },
      { source: "/produits/calmag-calcium-magnesium-b30", destination: "/magnesium", permanent: true },
      { source: "/produits/apederm-seamag-magnesium-marin-60-gelules", destination: "/magnesium", permanent: true },
      // /mass-gainer was linked from the nav and articles but never existed (404); the real category is /gainers-proteines.
      { source: "/mass-gainer", destination: "/gainers-proteines", permanent: true },
      {
        source: "/conseils/routine-peau-grasse-guide-complet",
        destination: "/conseils",
        permanent: true,
      },
      {
        source: "/conseils/protection-solaire-tunisie-guide",
        destination: "/conseils",
        permanent: true,
      },
      {
        source: "/conseils/routine-anti-age-debut",
        destination: "/conseils/complements-musculation-debutant",
        permanent: true,
      },
      {
        source: "/conseils/peau-sensible-calmee",
        destination: "/conseils/omega-3-tunisie-guide",
        permanent: true,
      },
      {
        source: "/conseils/chute-cheveux-precautions",
        destination: "/conseils/zinc-sportif-musculation",
        permanent: true,
      },
      {
        source: "/conseils/hydratation-peau-seche-hiver",
        destination: "/conseils/omega-3-tunisie-guide",
        permanent: true,
      },
      {
        source: "/vitamines-mineraux",
        destination: "/vitamines",
        permanent: true,
      },
      {
        source: "/categories/bien-etre",
        destination: "/bien-etre",
        permanent: true,
      },
      {
        source: "/categories/creatine",
        destination: "/creatine",
        permanent: true,
      },
      {
        source: "/categories/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
