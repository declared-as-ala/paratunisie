export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <img
        src="/assets/logo.png"
        alt="ParaTunisie"
        className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-all"
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}

