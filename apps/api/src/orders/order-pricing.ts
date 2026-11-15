import { BadRequestException, ConflictException } from "@nestjs/common";

/**
 * Server-authoritative order pricing. The browser may only say WHICH product (and, if it knows, which variant) and HOW MANY;
 * every price, the subtotal, shipping and the total are decided here from the catalogue.
 * A price sent by the client is used for one thing only: to detect a stale cart (the displayed price no longer matches the
 * catalogue) and to tell apart the sizes of a multi-variant product when the cart did not carry a variant id.
 */
export type RequestedLine = { productId?: string; productVariantId?: string; quantity: number; priceMillimes?: number };
export type CatalogueVariant = {
  id: string;
  productId: string;
  label: string;
  priceMillimes: number;
  stock: number;
  product: { id: string; name: string; publishState: string };
};
export type PricedLine = { productId: string; productVariantId: string; quantity: number; priceMillimes: number; name: string; label: string };

export const MAX_LINES = 50;
export const MAX_QUANTITY_PER_LINE = 50;

const formatDt = (millimes: number) => `${(millimes / 1000).toFixed(3).replace(/\.?0+$/, "")} DT`;

export function priceOrderLines(requested: RequestedLine[], variants: CatalogueVariant[]): PricedLine[] {
  if (!Array.isArray(requested) || requested.length === 0) throw new BadRequestException("La commande ne contient aucun article.");
  if (requested.length > MAX_LINES) throw new BadRequestException("Trop d'articles dans la commande.");
  const byId = new Map(variants.map((v) => [v.id, v]));
  const byProduct = new Map<string, CatalogueVariant[]>();
  for (const v of variants) byProduct.set(v.productId, [...(byProduct.get(v.productId) ?? []), v]);

  const merged = new Map<string, PricedLine>();
  for (const line of requested) {
    const quantity = line?.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new BadRequestException(`Quantité invalide (1 à ${MAX_QUANTITY_PER_LINE}).`);
    }
    let variant: CatalogueVariant | undefined;
    if (line.productVariantId) {
      variant = byId.get(line.productVariantId);
      if (!variant) throw new BadRequestException("Variante de produit introuvable. Veuillez actualiser votre panier.");
      if (line.productId && variant.productId !== line.productId) throw new BadRequestException("Variante incohérente avec le produit. Veuillez actualiser votre panier.");
    } else if (line.productId) {
      const options = (byProduct.get(line.productId) ?? []).slice().sort((a, b) => a.priceMillimes - b.priceMillimes || a.id.localeCompare(b.id));
      if (options.length === 0) throw new BadRequestException("Produit introuvable. Veuillez actualiser votre panier.");
      if (options.length === 1) variant = options[0];
      else {
        // Several sizes and no variant id: the cart price must match exactly one real variant price.
        const matches = options.filter((v) => v.priceMillimes === line.priceMillimes);
        if (matches.length === 0) {
          throw new ConflictException(`Le prix de « ${options[0].product.name} » a changé. Veuillez actualiser votre panier.`);
        }
        variant = matches[0];
      }
    } else {
      throw new BadRequestException("Chaque article de la commande doit référencer un produit réel.");
    }

    if (variant.product.publishState !== "PUBLISHED") throw new BadRequestException(`« ${variant.product.name} » n'est plus disponible.`);
    if (!Number.isInteger(variant.priceMillimes) || variant.priceMillimes <= 0) throw new BadRequestException(`Le prix de « ${variant.product.name} » est indisponible.`);
    if (line.priceMillimes !== variant.priceMillimes) {
      throw new ConflictException(`Le prix de « ${variant.product.name} » est maintenant ${formatDt(variant.priceMillimes)}. Veuillez actualiser votre panier.`);
    }

    const key = variant.id;
    const existing = merged.get(key);
    const total = (existing?.quantity ?? 0) + quantity;
    if (variant.stock < total) throw new ConflictException(`Stock insuffisant pour « ${variant.product.name} » (${Math.max(0, variant.stock)} disponible).`);
    merged.set(key, { productId: variant.productId, productVariantId: variant.id, quantity: total, priceMillimes: variant.priceMillimes, name: variant.product.name, label: variant.label });
  }
  return [...merged.values()];
}
