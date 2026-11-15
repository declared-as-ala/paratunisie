import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, ReviewStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { expiryFrom, generateToken, hashToken, invitationStatus, screenReview } from "./review-rules";

/** Only orders that really shipped or were delivered can produce a verified review. */
const ELIGIBLE: OrderStatus[] = [OrderStatus.EXPEDIEE, OrderStatus.LIVREE];
const SITE = "https://paratunisie.com";

/**
 * Secure review collection. This service NEVER sends a message: it prepares one private link per real order line for staff,
 * who contact only customers that agreed to be contacted. Submitting through a link is the only way to obtain the
 * "verified purchase" flag, and every review is created PENDING (moderated, never auto-approved).
 */
@Injectable()
export class ReviewInvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin: (re)generates the private links of one order. A token is shown once; asking again rotates it. */
  async prepare(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { select: { id: true, name: true, slug: true } } } }, user: { select: { id: true, name: true } } } });
    if (!order) throw new NotFoundException("Commande introuvable.");
    if (!ELIGIBLE.includes(order.status)) throw new BadRequestException("Seules les commandes expédiées ou livrées peuvent recevoir une invitation à donner un avis.");
    const seen = new Set<string>();
    const links: { productId: string; productName: string; url: string; status: string }[] = [];
    for (const item of order.items) {
      if (seen.has(item.productId)) continue;
      seen.add(item.productId);
      const existing = await this.prisma.reviewInvitation.findUnique({ where: { orderId_productId: { orderId, productId: item.productId } } });
      if (existing?.usedAt) { links.push({ productId: item.productId, productName: item.product.name, url: "", status: "déjà utilisé" }); continue; }
      const token = generateToken();
      const data = { tokenHash: hashToken(token), expiresAt: expiryFrom() };
      if (existing) await this.prisma.reviewInvitation.update({ where: { id: existing.id }, data });
      else await this.prisma.reviewInvitation.create({ data: { orderId, productId: item.productId, userId: order.userId, ...data } });
      links.push({ productId: item.productId, productName: item.product.name, url: `${SITE}/avis/${token}`, status: "prêt" });
    }
    return { orderId, customer: order.user?.name ?? null, links, note: "Aucun message n'est envoyé automatiquement. Contactez uniquement les clients qui ont accepté d'être contactés, sans les inciter à laisser une note positive." };
  }

  private async load(token: string) {
    const inv = await this.prisma.reviewInvitation.findUnique({ where: { tokenHash: hashToken(String(token || "")) } });
    if (!inv) throw new NotFoundException("Lien d'avis invalide.");
    return inv;
  }

  /** Public: what the review page needs, nothing about the customer. */
  async describe(token: string) {
    const inv = await this.load(token);
    const product = await this.prisma.product.findUnique({ where: { id: inv.productId }, select: { name: true, slug: true, image: true, brand: { select: { name: true } } } });
    return { status: invitationStatus(inv), product: product ? { name: product.name, slug: product.slug, image: product.image, brand: product.brand?.name ?? null } : null };
  }

  /** Public: creates a verified, PENDING review from a valid link. */
  async submit(token: string, input: { rating: unknown; title?: unknown; body?: unknown }) {
    const inv = await this.load(token);
    const state = invitationStatus(inv);
    if (state === "used") throw new BadRequestException("Vous avez déjà donné votre avis pour ce produit. Merci !");
    if (state === "expired") throw new BadRequestException("Ce lien d'avis a expiré.");
    const others = await this.prisma.review.findMany({ where: { productId: inv.productId }, select: { body: true }, take: 200 });
    const screened = screenReview(input, others.map((r) => r.body ?? "").filter(Boolean));
    if (!screened.ok || !screened.clean) throw new BadRequestException(screened.errors.join(" "));
    const order = await this.prisma.order.findUnique({ where: { id: inv.orderId }, select: { status: true, userId: true } });
    if (!order || order.userId !== inv.userId || !ELIGIBLE.includes(order.status)) throw new BadRequestException("Cette commande n'est plus éligible à un avis.");
    const duplicate = await this.prisma.review.findFirst({ where: { userId: inv.userId, productId: inv.productId } });
    if (duplicate) throw new BadRequestException("Un avis existe déjà pour ce produit.");

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { userId: inv.userId, productId: inv.productId, orderId: inv.orderId, rating: screened.clean!.rating, title: screened.clean!.title, body: screened.clean!.body, status: ReviewStatus.PENDING, verified: true },
      });
      await tx.reviewInvitation.update({ where: { id: inv.id }, data: { usedAt: new Date(), reviewId: created.id } });
      await tx.reviewModeration.create({ data: { reviewId: created.id, action: "SUBMITTED", note: screened.flags.length ? `À examiner : ${screened.flags.join(", ")}` : null, actor: "client" } });
      return created;
    });
    return { ok: true, reviewId: review.id, message: "Merci ! Votre avis sera publié après vérification par notre équipe, qu'il soit positif ou négatif." };
  }
}
