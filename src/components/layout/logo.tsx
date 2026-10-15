import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <Image
        src="/assets/logo.png"
        alt="ParaTunisie"
        width={1536}
        height={1024}
        priority
        className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-all"
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}

