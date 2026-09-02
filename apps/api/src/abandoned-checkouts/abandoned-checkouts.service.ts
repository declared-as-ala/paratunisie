import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { AbandonedCheckoutStatus, CheckoutSource, OrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertCheckoutDraftDto } from "./dto/upsert-draft.dto";
import { EmailService } from "../notifications/email/email.service";

@Injectable()
export class AbandonedCheckoutsService {
  private readonly logger = new Logger(AbandonedCheckoutsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  /**
   * Send an immediate email alert to Admin for a new/abandoned recoverable lead.
   */
  private async notifyAdmin(record: any) {
    if (record.adminNotifiedAt) return;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com";
    if (!adminEmail) return;

    let items: any[] = [];
    try {
      items = JSON.parse(record.items || "[]");
    } catch {
      items = [];
    }

    const itemsRows = items.length > 0
      ? items
          .map(
            (it) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 4px; font-weight: bold; color: #1e293b;">
              ${it.name || "Produit Parapharmacie"}
              ${it.variantLabel ? `<br><span style="font-size: 11px; font-weight: normal; color: #64748b;">Format: ${it.variantLabel}</span>` : ""}
            </td>
            <td style="padding: 10px 4px; text-align: center; color: #475569; font-weight: bold;">×${it.quantity || 1}</td>
            <td style="padding: 10px 4px; text-align: right; font-weight: bold; color: #0f172a;">${(((it.priceMillimes || 0) * (it.quantity || 1)) / 1000).toFixed(3)} DT</td>
          </tr>`
          )
          .join("")
      : '<tr><td colspan="3" style="padding: 10px; color: #94a3b8; text-align: center;">Aucun article dans le panier</td></tr>';

    const cleanPhone = (record.phone || "").replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("216") ? cleanPhone : `216${cleanPhone}`;
    const waLink = cleanPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour ${record.customerName || ""}, c'est l'équipe ParaTunisie ! Avez-vous besoin d'aide pour finaliser votre commande ?`)}` : null;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #E11D48; padding: 22px 24px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.3px;">🚨 Nouveau Panier Abandonné Détecté</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Un prospect a commencé une commande sur ParaTunisie sans la valider.</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">👤 Coordonnées du Prospect</h3>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Nom & Prénom :</strong> <span style="font-weight: 700; color: #0f172a;">${record.customerName || "Non renseigné"}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Téléphone :</strong> <a href="tel:${record.phone}" style="color: #E11D48; font-weight: 800; text-decoration: underline;">${record.phone || "Non renseigné"}</a></p>
          ${record.email ? `<p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Email :</strong> <a href="mailto:${record.email}" style="color: #0284c7; text-decoration: none;">${record.email}</a></p>` : ""}
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Gouvernorat :</strong> <span style="font-weight: 600;">${record.gouvernorat || "Non renseigné"}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Adresse :</strong> ${record.fullAddress || "Non renseignée"}</p>
          ${record.deliveryNote ? `<p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Note du client :</strong> <em style="color: #b45309;">${record.deliveryNote}</em></p>` : ""}
          <p style="margin: 6px 0; font-size: 12px; color: #64748b;"><strong>Source :</strong> ${record.source === "PACK_ANTI_STRESS" ? "🌿 Landing Pack Anti-Stress" : record.source === "BUY_NOW_MODAL" ? "⚡ Modal 1-Clic Acheter Maintenant" : "🛒 Page Commande"}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">📦 Articles du Panier</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 4px;">Produit</th>
                <th style="padding: 8px 4px; text-align: center;">Qté</th>
                <th style="padding: 8px 4px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div style="border-top: 2px solid #e2e8f0; margin-top: 14px; padding-top: 14px; text-align: right;">
            <span style="font-size: 13px; color: #475569; font-weight: bold;">TOTAL ESTIMÉ : </span>
            <span style="font-size: 19px; color: #E11D48; font-weight: 900;">${(record.totalMillimes / 1000).toFixed(3)} DT</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
          ${waLink ? `<a href="${waLink}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; padding: 12px 22px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px; margin: 4px 6px;">📲 Relancer sur WhatsApp</a>` : ""}
          <a href="https://paratunisie.com/admin/commandes" target="_blank" style="display: inline-block; background: #E11D48; color: #ffffff; padding: 12px 22px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px; margin: 4px 6px;">Ouvrir l'Admin Commandes</a>
        </div>
      </div>
    </div>`;

    const subject = `🚨 Panier Abandonné — ${record.customerName || record.phone || "Prospect"} (${(record.totalMillimes / 1000).toFixed(3)} DT)`;

    this.emailService
      .sendEmail(adminEmail, subject, html)
      .then((res) => {
        if (res.success) {
          this.prisma.abandonedCheckout
            .update({
              where: { id: record.id },
              data: { adminNotifiedAt: new Date() },
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        this.logger.warn(`Failed to send abandoned checkout email: ${err.message}`);
      });
  }

  /**
   * Upsert a checkout draft progressively.
   */
  async upsertDraft(dto: UpsertCheckoutDraftDto) {
    const cleanPhone = (dto.phone || "").replace(/\D/g, "");
    const hasPhone = cleanPhone.length >= 6;
    const hasName = Boolean(dto.customerName && dto.customerName.trim().length >= 2);
    const hasEmail = Boolean(dto.email && dto.email.trim().length >= 4);
    const hasAddress = Boolean(dto.fullAddress && dto.fullAddress.trim().length >= 3);
    const hasGouv = Boolean(dto.gouvernorat && dto.gouvernorat.trim().length >= 2);

    if (!hasPhone && !hasName && !hasEmail && !hasAddress && !hasGouv) {
      return { status: "ignored", reason: "no_contact_info" };
    }

    const now = new Date();
    const itemsJson = dto.items && dto.items.length > 0 ? JSON.stringify(dto.items) : "[]";

    const subtotal = dto.subtotalMillimes ?? 0;
    const shipping = dto.shippingFeeMillimes ?? (subtotal >= 99000 ? 0 : 10000);
    const total = dto.totalMillimes ?? (subtotal + shipping);

    const existing = await this.prisma.abandonedCheckout.findUnique({
      where: { checkoutSessionId: dto.checkoutSessionId },
    });

    if (existing) {
      // If already converted to a real order, do not revert to DRAFT
      if (existing.status === AbandonedCheckoutStatus.CONVERTED) {
        return { status: "already_converted", id: existing.id };
      }

      const updated = await this.prisma.abandonedCheckout.update({
        where: { id: existing.id },
        data: {
          customerName: dto.customerName?.trim() || existing.customerName,
          phone: dto.phone?.trim() || existing.phone,
          email: dto.email?.trim() || existing.email,
          gouvernorat: dto.gouvernorat?.trim() || existing.gouvernorat,
          fullAddress: dto.fullAddress?.trim() || existing.fullAddress,
          deliveryNote: dto.deliveryNote?.trim() || existing.deliveryNote,
          items: dto.items && dto.items.length > 0 ? itemsJson : existing.items,
          subtotalMillimes: subtotal > 0 ? subtotal : existing.subtotalMillimes,
          shippingFeeMillimes: shipping,
          totalMillimes: total > 0 ? total : existing.totalMillimes,
          source: dto.source || existing.source,
          sourceUrl: dto.sourceUrl || existing.sourceUrl,
          status: dto.status || existing.status || AbandonedCheckoutStatus.DRAFT,
          lastActivityAt: now,
        },
      });

      if (!updated.adminNotifiedAt && (hasPhone || hasEmail)) {
        this.notifyAdmin(updated);
      }

      return { status: "updated", id: updated.id };
    }

    const created = await this.prisma.abandonedCheckout.create({
      data: {
        checkoutSessionId: dto.checkoutSessionId,
        userId: dto.userId,
        customerName: dto.customerName?.trim() || null,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
        gouvernorat: dto.gouvernorat?.trim() || null,
        fullAddress: dto.fullAddress?.trim() || null,
        deliveryNote: dto.deliveryNote?.trim() || null,
        items: itemsJson,
        subtotalMillimes: subtotal,
        shippingFeeMillimes: shipping,
        totalMillimes: total,
        source: dto.source || CheckoutSource.CHECKOUT_PAGE,
        sourceUrl: dto.sourceUrl,
        status: dto.status || AbandonedCheckoutStatus.DRAFT,
        lastActivityAt: now,
      },
    });

    if (hasPhone || hasEmail) {
      this.notifyAdmin(created);
    }

    return { status: "created", id: created.id };
  }

  /**
   * Mark a draft checkout as ABANDONED (e.g. on modal close or page unload).
   */
  async markAbandoned(checkoutSessionId: string) {
    if (!checkoutSessionId) return { status: "ignored" };

    const existing = await this.prisma.abandonedCheckout.findUnique({
      where: { checkoutSessionId },
    });

    if (!existing || existing.status === AbandonedCheckoutStatus.CONVERTED) {
      return { status: "ignored" };
    }

    const updated = await this.prisma.abandonedCheckout.update({
      where: { id: existing.id },
      data: {
        status: AbandonedCheckoutStatus.ABANDONED,
        lastActivityAt: new Date(),
      },
    });

    if (!updated.adminNotifiedAt && (updated.phone || updated.email || updated.customerName)) {
      this.notifyAdmin(updated);
    }

    return { status: "abandoned", id: existing.id };
  }

  /**
   * Mark a draft checkout as CONVERTED when an order is created.
   */
  async markConverted(checkoutSessionId: string, orderId: string) {
    if (!checkoutSessionId) return;

    try {
      await this.prisma.abandonedCheckout.updateMany({
        where: { checkoutSessionId },
        data: {
          status: AbandonedCheckoutStatus.CONVERTED,
          convertedOrderId: orderId,
          lastActivityAt: new Date(),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to mark converted checkout for session ${checkoutSessionId}: ${err.message}`);
    }
  }

  /**
   * List abandoned checkouts for Admin.
   */
  async getAbandonedCheckouts(params?: {
    search?: string;
    status?: string;
    source?: string;
  }) {
    const where: any = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status as AbandonedCheckoutStatus;
    } else {
      // By default show ABANDONED and DRAFT (exclude CONVERTED and ARCHIVED unless requested)
      where.status = { in: [AbandonedCheckoutStatus.ABANDONED, AbandonedCheckoutStatus.DRAFT] };
    }

    if (params?.source && params.source !== "ALL") {
      where.source = params.source as CheckoutSource;
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { gouvernorat: { contains: q, mode: "insensitive" } },
        { items: { contains: q, mode: "insensitive" } },
      ];
    }

    const checkouts = await this.prisma.abandonedCheckout.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      take: 100,
    });

    return checkouts.map((c) => {
      let parsedItems: any[] = [];
      try {
        parsedItems = JSON.parse(c.items || "[]");
      } catch {}

      return {
        ...c,
        parsedItems,
        itemCount: parsedItems.reduce((acc, it) => acc + (it.quantity || 1), 0),
      };
    });
  }

  /**
   * Get single abandoned checkout detail.
   */
  async getAbandonedCheckoutById(id: string) {
    const checkout = await this.prisma.abandonedCheckout.findUnique({
      where: { id },
    });

    if (!checkout) {
      throw new NotFoundException("Commande abandonnée introuvable");
    }

    let parsedItems: any[] = [];
    try {
      parsedItems = JSON.parse(checkout.items || "[]");
    } catch {}

    return {
      ...checkout,
      parsedItems,
    };
  }

  /**
   * Convert an abandoned checkout into a real Order manually from Admin.
   */
  async convertToOrder(id: string, staffId?: string) {
    const checkout = await this.getAbandonedCheckoutById(id);

    if (!checkout.phone || !checkout.gouvernorat) {
      throw new BadRequestException("Téléphone et gouvernorat obligatoires pour créer une commande.");
    }

    // Find or create customer user
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(checkout.email ? [{ email: checkout.email }] : []),
          ...(checkout.phone ? [{ phone: checkout.phone }] : []),
        ],
      },
    });

    if (!user) {
      const generatedEmail = checkout.email || `client-${Date.now()}@paratunisie.tn`;
      user = await this.prisma.user.create({
        data: {
          email: generatedEmail,
          name: checkout.customerName || "Client ParaTunisie",
          phone: checkout.phone,
          password: "AUTOGENERATED_PASSWORD_HASH",
          role: "CUSTOMER",
        },
      });
    }

    // Resolve order items
    const parsedItems: any[] = checkout.parsedItems || [];
    if (parsedItems.length === 0) {
      throw new BadRequestException("Le panier de cette commande abandonnée est vide.");
    }

    // Build order items records
    const orderItemData: any[] = [];
    for (const it of parsedItems) {
      let productId = it.productId;
      let productVariantId = it.productVariantId;
      let priceMillimes = it.priceMillimes || 0;

      if (!productVariantId && productId) {
        const prod = await this.prisma.product.findUnique({
          where: { id: productId },
          include: { variants: true },
        });
        if (prod && prod.variants.length > 0) {
          productVariantId = prod.variants[0].id;
          priceMillimes = priceMillimes || prod.variants[0].priceMillimes;
        }
      }

      if (productId && productVariantId) {
        orderItemData.push({
          productId,
          productVariantId,
          quantity: it.quantity || 1,
          priceMillimes,
        });
      }
    }

    if (orderItemData.length === 0) {
      // Fallback: fetch any active product to fulfill line item constraint
      const fallbackProd = await this.prisma.product.findFirst({
        include: { variants: true },
      });
      if (fallbackProd && fallbackProd.variants.length > 0) {
        orderItemData.push({
          productId: fallbackProd.id,
          productVariantId: fallbackProd.variants[0].id,
          quantity: 1,
          priceMillimes: checkout.totalMillimes,
        });
      }
    }

    // Create real confirmed Order in DB
    const createdOrder = await this.prisma.order.create({
      data: {
        userId: user.id,
        status: OrderStatus.CONFIRMEE,
        totalMillimes: checkout.totalMillimes,
        gouvernorat: checkout.gouvernorat,
        fullAddress: checkout.fullAddress || checkout.gouvernorat,
        deliveryNote: checkout.deliveryNote ? `[Relance abandonnée] ${checkout.deliveryNote}` : "[Relance abandonnée]",
        items: {
          create: orderItemData,
        },
        payment: {
          create: {
            method: "cod",
            status: "pending",
            amount: checkout.totalMillimes,
          },
        },
        statusHistory: {
          create: {
            toStatus: OrderStatus.CONFIRMEE,
            staffId: staffId || null,
            note: "Commande créée manuellement depuis une commande abandonnée relancée.",
          },
        },
      },
    });

    // Update AbandonedCheckout status to CONVERTED
    await this.prisma.abandonedCheckout.update({
      where: { id },
      data: {
        status: AbandonedCheckoutStatus.CONVERTED,
        convertedOrderId: createdOrder.id,
      },
    });

    return {
      success: true,
      orderId: createdOrder.id,
      orderReference: `PT-${createdOrder.id.slice(-6).toUpperCase()}`,
    };
  }

  /**
   * Delete or archive an abandoned checkout.
   */
  async deleteAbandonedCheckout(id: string) {
    await this.prisma.abandonedCheckout.update({
      where: { id },
      data: { status: AbandonedCheckoutStatus.ARCHIVED },
    });
    return { success: true };
  }

  /**
   * Count abandoned checkouts.
   */
  async countAbandoned() {
    return this.prisma.abandonedCheckout.count({
      where: {
        status: { in: [AbandonedCheckoutStatus.ABANDONED, AbandonedCheckoutStatus.DRAFT] },
      },
    });
  }
}
