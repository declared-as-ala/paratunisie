import type { ElementType, ReactNode } from "react";

/** Title block shared by every admin page: icon tile, title, subtitle, right-aligned actions. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  badge,
}: {
  title: string;
  description?: ReactNode;
  icon?: ElementType;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft/70 text-primary">
            <Icon size={20} />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="page-title truncate">{title}</h1>
            {badge}
          </div>
          {description && <p className="page-subtitle">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
