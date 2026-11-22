/* Run inside the API container (read-only): exercises the LIVE compiled order pricing against real catalogue rows.
 * No order is created. Confirms a tampered price is rejected and a legitimate cart is priced from the catalogue. */
const { PrismaClient } = require("@prisma/client");
const { priceOrderLines } = require("/app/dist/orders/order-pricing.js");
(async () => {
  const prisma = new PrismaClient();
  const v = await prisma.productVariant.findFirst({ where: { stock: { gt: 0 }, product: { publishState: "PUBLISHED", inStock: true } }, include: { product: { select: { id: true, name: true, publishState: true } } } });
  const catalogue = [{ id: v.id, productId: v.productId, label: v.label, priceMillimes: v.priceMillimes, stock: v.stock, product: v.product }];
  const attempt = (label, lines) => { try { const r = priceOrderLines(lines, catalogue); console.log(label, "=> ACCEPTED", JSON.stringify(r.map((x) => [x.name, x.quantity, x.priceMillimes]))); } catch (e) { console.log(label, "=> REJECTED:", e.constructor.name, "-", e.message); } };
  console.log("product:", v.product.name, "real price (millimes):", v.priceMillimes);
  attempt("legitimate cart             ", [{ productId: v.productId, quantity: 1, priceMillimes: v.priceMillimes }]);
  attempt("price tampered to 1 millime ", [{ productId: v.productId, quantity: 1, priceMillimes: 1 }]);
  attempt("price lowered by 1 DT       ", [{ productId: v.productId, quantity: 1, priceMillimes: v.priceMillimes - 1000 }]);
  attempt("negative price              ", [{ productId: v.productId, quantity: 1, priceMillimes: -v.priceMillimes }]);
  attempt("quantity above stock        ", [{ productId: v.productId, quantity: v.stock + 1, priceMillimes: v.priceMillimes }]);
  attempt("variant id of another item  ", [{ productId: "ghost", productVariantId: v.id, quantity: 1, priceMillimes: v.priceMillimes }]);
  await prisma.$disconnect();
})();
