export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <img
        src="/assets/logo.png"
        alt="ParaTunisie"
        className="h-32 w-auto rounded-[1.25rem] object-contain logo-bounce"
      />
      <span className="sr-only">ParaTunisie</span>
    </span>
  );
}
