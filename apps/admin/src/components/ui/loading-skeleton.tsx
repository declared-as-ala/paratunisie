import { cn } from "@paratunisie/ui";

export function LoadingSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} role="status" aria-label="Chargement">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="pt-skeleton h-11 w-full" style={{ opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}
