import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — ParaTunisie",
  description: "Back-office ParaTunisie",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
