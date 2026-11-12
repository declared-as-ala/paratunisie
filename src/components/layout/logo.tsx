import Image from "next/image";

const SIZES = {
  // Compact header logo: small on mobile, balanced on desktop. Height is fixed so the header never shifts.
  header: "h-14 lg:h-16",
  drawer: "h-14",
  // Large brand mark (footer, hero-style placements).
  large: "h-16 sm:h-20 md:h-24 lg:h-28",
} as const;

export function Logo({ className, size = "large" }: { className?: string; size?: keyof typeof SIZES }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <Image
        src="/assets/logo.png"
        alt="ParaTunisie"
        width={1536}
        height={1024}
        priority={size === "header"}
        loading={size === "drawer" ? "eager" : undefined}
        className={`${SIZES[size]} w-auto object-contain`}
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}
