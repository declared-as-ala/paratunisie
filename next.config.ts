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
    ];
  },
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
