export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <img
        src="/assets/logo.png"
        alt="ParaTunisie"
        className="h-9 sm:h-11 w-auto rounded-lg object-contain"
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}

