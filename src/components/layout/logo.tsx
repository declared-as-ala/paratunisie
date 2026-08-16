export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <img
        src="/assets/logo.png"
        alt="ParaTunisie"
        className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto object-contain transition-all"
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}

