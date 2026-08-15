import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@paratunisie/types", "@paratunisie/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tunisiepara.com" },
      { protocol: "https", hostname: "*.tunisiepara.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
};

export default nextConfig;
