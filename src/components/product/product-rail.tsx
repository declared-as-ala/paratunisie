import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

export function ProductRail({
  title,
  description,
  products,
}: {
  title: string;
  description?: string;
  products: ProductSummary[];
}) {
  if (products.length === 0) return null;

  return (
    <section aria-label={title} className="border-t border-border py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">{description}</p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
