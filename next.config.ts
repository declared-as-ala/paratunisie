import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
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
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  turbopack: {
    // Keep Next scoped to this project. A separate lockfile exists higher in
    // the user's home directory and must never influence this application.
    root: path.resolve(__dirname),
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
