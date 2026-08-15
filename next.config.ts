import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@paratunisie/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tunisiepara.com" },
      { protocol: "https", hostname: "*.tunisiepara.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  turbopack: {
    // Keep Next scoped to this project. A separate lockfile exists higher in
    // the user's home directory and must never influence this application.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
