import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CheckoutSource } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "./orders.service";
import { AbandonedCheckoutsService } from "../abandoned-checkouts/abandoned-checkouts.service";
import { computeDeliveryFeeMillimes, isGovernorate, normalizeTunisianLocalPhone } from "../common/tunisia";
import { RateLimiter } from "../common/rate-limit";
import { CreateLandingOrderDto } from "./dto/create-landing-order.dto";

export const MAX_LANDING_QUANTITY = 10;

export interface LandingOrderContext {
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  rateKey: string;
}

export interface LandingOrderResult {
  id: string;
  reference: string;
  totalMillimes: number;
  subtotalMillimes: number;
  deliveryFeeMillimes: number;
  quantity: number;
  /** Event id the browser Pixel must reuse for Purchase so Meta de-duplicates it against the CAPI event. */
  eventId: string;
  replayed: boolean;
}

@Injectable()
export class LandingOrdersService {
  private readonly limiter = new RateLimiter(8, 10 * 60_000); // 8 order attempts / 10 min / client

  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
    private drafts: AbandonedCheckoutsService,
  ) {}

  private reference(orderId: string) {
    return `PT-${orderId.slice(-6).toUpperCase()}`;
  }

  private async existingResult(sessionId: string, eventId: string): Promise<LandingOrderResult | null> {
    const row = await this.drafts.findBySession(sessionId);
    if (!row?.convertedOrderId) return null;
    const order = await this.prisma.order.findUnique({ where: { id: row.convertedOrderId }, include: { items: true } });
    if (!order) return null;
    const subtotal = order.items.reduce((s, i) => s + i.priceMillimes * i.quantity, 0);
    return {
      id: order.id,
      reference: this.reference(order.id),
      totalMillimes: order.totalMillimes,
      subtotalMillimes: subtotal,
      deliveryFeeMillimes: Math.max(0, order.totalMillimes - subtotal + order.loyaltyDiscountMillimes),
      quantity: order.items.reduce((s, i) => s + i.quantity, 0),
      eventId: row.purchaseEventId || eventId,
      replayed: true,
    };
  }

  async create(dto: CreateLandingOrderDto, ctx: LandingOrderContext): Promise<LandingOrderResult> {
    if (!this.limiter.allow(ctx.rateKey)) {
      throw new ConflictException("Trop de tentatives. Réessayez dans quelques minutes ou appelez-nous.");
    }

    const phone = normalizeTunisianLocalPhone(dto.phone);
    if (!phone) throw new BadRequestException("Numéro de téléphone tunisien invalide.");
    if (!isGovernorate(dto.gouvernorat)) throw new BadRequestException("Gouvernorat invalide.");
    const name = dto.customerName.trim().replace(/\s+/g, " ");
    if (name.length < 2) throw new BadRequestException("Veuillez saisir votre nom complet.");
    const address = dto.fullAddress.trim();
    if (address.length < 5) throw new BadRequestException("Veuillez saisir votre adresse complète.");

    const eventId = dto.purchaseEventId || `purchase_${dto.checkoutSessionId}`;

    // Idempotent replay: a retry after a lost response returns the order that already exists.
    const replay = await this.existingResult(dto.checkoutSessionId, eventId);
    if (replay) return replay;

    // Catalogue is the only source of price and stock.
    const variant = dto.productVariantId
      ? await this.prisma.productVariant.findUnique({ where: { id: dto.productVariantId }, include: { product: true } })
      : await this.prisma.productVariant.findFirst({ where: { productId: dto.productId }, orderBy: { priceMillimes: "asc" }, include: { product: true } });
    if (!variant) throw new NotFoundException("Produit introuvable.");
    if (dto.productId && variant.productId !== dto.productId) throw new BadRequestException("Produit invalide.");
    if (variant.stock <= 0) throw new ConflictException("Ce produit est actuellement en rupture de stock.");
    const quantity = dto.quantity;
    if (quantity > MAX_LANDING_QUANTITY) {
      throw new BadRequestException(`Quantité maximale par commande : ${MAX_LANDING_QUANTITY}. Appelez-nous pour une commande plus importante.`);
    }
    if (quantity > variant.stock) throw new ConflictException(`Stock insuffisant : il reste ${variant.stock} unité(s).`);

    // Make sure a draft row exists (also carries the attribution) before claiming it.
    await this.drafts.upsertDraft(
      {
        checkoutSessionId: dto.checkoutSessionId,
        customerName: name,
        phone,
        gouvernorat: dto.gouvernorat,
        fullAddress: address,
        deliveryNote: dto.deliveryNote,
        source: CheckoutSource.LANDING_PAGE,
        sourceUrl: dto.sourceUrl,
        landingId: dto.landingId,
        productId: variant.productId,
        productVariantId: variant.id,
        quantity,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        utmContent: dto.utmContent,
        fbclid: dto.fbclid,
        referrerHost: dto.referrerHost,
        contactConsent: dto.contactConsent,
        privacyNoticeShown: dto.privacyNoticeShown,
        purchaseEventId: eventId,
      },
      `order:${ctx.rateKey}`,
    );

    const claim = await this.drafts.claimForOrder(dto.checkoutSessionId);
    if (claim === "converted") {
      const done = await this.existingResult(dto.checkoutSessionId, eventId);
      if (done) return done;
    }
    if (claim !== "claimed") {
      throw new ConflictException("Votre commande est en cours de traitement. Patientez un instant.");
    }

    try {
      const subtotal = variant.priceMillimes * quantity;
      const order = await this.orders.createOrder({
        phone,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
        gouvernorat: dto.gouvernorat,
        fullAddress: address,
        deliveryNote: dto.deliveryNote,
        eventId,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        clientIp: ctx.clientIp,
        clientUserAgent: ctx.clientUserAgent,
        eventSourceUrl: ctx.eventSourceUrl,
        checkoutSessionId: dto.checkoutSessionId,
        items: [{ productId: variant.productId, productVariantId: variant.id, quantity, priceMillimes: variant.priceMillimes }],
      });
      // createOrder reconciles the draft fire-and-forget; do it deterministically before answering.
      await this.drafts.markConverted(dto.checkoutSessionId, order.id);

      return {
        id: order.id,
        reference: this.reference(order.id),
        totalMillimes: order.totalMillimes,
        subtotalMillimes: subtotal,
        deliveryFeeMillimes: computeDeliveryFeeMillimes(subtotal),
        quantity,
        eventId,
        replayed: false,
      };
    } catch (err) {
      await this.drafts.releaseClaim(dto.checkoutSessionId);
      throw err;
    }
  }
}
