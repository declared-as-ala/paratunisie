import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AbandonedCheckout, AbandonedCheckoutStatus, CheckoutSource, OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SetCheckoutStatusDto, UpsertCheckoutDraftDto } from "./dto/upsert-draft.dto";
import { EmailService } from "../notifications/email/email.service";
import {
  GOVERNORATES,
  classifyTrafficSource,
  computeDeliveryFeeMillimes,
  isGovernorate,
  normalizeTunisianLocalPhone,
} from "../common/tunisia";
import { RateLimiter } from "../common/rate-limit";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

/** Admin-facing names for the stored states (DB enum keeps its original values: additive migration). */
export const STATUS_LABELS: Record<AbandonedCheckoutStatus, { key: string; label: string }> = {
  DRAFT: { key: "IN_PROGRESS", label: "En cours" },
  ABANDONED: { key: "ABANDONED", label: "Abandonnée" },
  CONVERTED: { key: "RECOVERED", label: "Récupérée" },
  EXPIRED: { key: "EXPIRED", label: "Expirée" },
  ARCHIVED: { key: "ARCHIVED", label: "Archivée" },
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export interface AdminListParams {
  search?: string;
  status?: string;
  source?: string; // traffic source: Meta Ads | Organic | Direct | Autre
  productId?: string;
  from?: string;
  to?: string;
  duplicatesOnly?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class AbandonedCheckoutsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AbandonedCheckoutsService.name);
  private timer?: NodeJS.Timeout;
  private readonly limiter = new RateLimiter(90, MIN); // 90 draft writes / minute / client

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /* ───────────────────────── lifecycle / retention ───────────────────────── */

  /** Inactivity threshold before an in-progress draft is considered abandoned (default 15 min). */
  get inactivityMinutes() {
    return envInt("ABANDONED_CHECKOUT_INACTIVITY_MINUTES", 15);
  }
  /** Abandoned drafts with no activity become EXPIRED after this many days (default 30). */
  get expireDays() {
    return envInt("ABANDONED_CHECKOUT_EXPIRE_DAYS", 30);
  }
  /** Personal data of any draft is erased this many days after the last activity (default 90). */
  get retentionDays() {
    return envInt("ABANDONED_CHECKOUT_RETENTION_DAYS", 90);
  }

  onModuleInit() {
    if (process.env.ABANDONED_CHECKOUT_SWEEPER === "off" || process.env.NODE_ENV === "test") return;
    const run = () => this.sweep().catch((e) => this.logger.warn(`sweep failed: ${e?.message ?? e}`));
    setTimeout(run, 20_000).unref();
    this.timer = setInterval(run, MIN);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Server-side lifecycle (does not rely on beforeunload):
   *  DRAFT --inactivity--> ABANDONED --expireDays--> EXPIRED --retentionDays--> personal data erased.
   * Idempotent: safe if several workers run it.
   */
  async sweep(now = new Date()) {
    const cutoff = new Date(now.getTime() - this.inactivityMinutes * MIN);
    const stale = await this.prisma.abandonedCheckout.findMany({
      where: { status: AbandonedCheckoutStatus.DRAFT, lastActivityAt: { lt: cutoff }, convertingAt: null },
      take: 200,
    });
    let abandoned = 0;
    for (const row of stale) {
      const res = await this.prisma.abandonedCheckout.updateMany({
        where: { id: row.id, status: AbandonedCheckoutStatus.DRAFT, lastActivityAt: { lt: cutoff } },
        data: { status: AbandonedCheckoutStatus.ABANDONED },
      });
      if (res.count === 1) {
        abandoned++;
        await this.logEvent(row.id, "STATUS_CHANGE", "DRAFT", "ABANDONED", undefined, "Inactivité");
        if (row.phone || row.email) void this.notifyAdmin({ ...row, status: AbandonedCheckoutStatus.ABANDONED });
      }
    }

    const expired = await this.prisma.abandonedCheckout.updateMany({
      where: {
        status: AbandonedCheckoutStatus.ABANDONED,
        lastActivityAt: { lt: new Date(now.getTime() - this.expireDays * DAY) },
      },
      data: { status: AbandonedCheckoutStatus.EXPIRED },
    });

    const erased = await this.prisma.abandonedCheckout.updateMany({
      where: {
        anonymizedAt: null,
        lastActivityAt: { lt: new Date(now.getTime() - this.retentionDays * DAY) },
        status: { not: AbandonedCheckoutStatus.DRAFT },
      },
      data: {
        customerName: null,
        phone: null,
        email: null,
        fullAddress: null,
        deliveryNote: null,
        userId: null,
        anonymizedAt: now,
        contactConsent: false,
      },
    });

    if (abandoned || expired.count || erased.count) {
      this.logger.log(`sweep: ${abandoned} abandoned, ${expired.count} expired, ${erased.count} anonymized`);
    }
    return { abandoned, expired: expired.count, anonymized: erased.count };
  }

  private async logEvent(
    checkoutId: string,
    type: string,
    fromStatus?: string | null,
    toStatus?: string | null,
    staffId?: string,
    note?: string,
  ) {
    await this.prisma.abandonedCheckoutEvent
      .create({ data: { checkoutId, type, fromStatus: fromStatus ?? null, toStatus: toStatus ?? null, staffId, note } })
      .catch(() => undefined);
  }

  /* ───────────────────────── admin e-mail alert ───────────────────────── */

  /** One e-mail to the shop owner when a lead with contact details has gone cold. */
  private async notifyAdmin(record: AbandonedCheckout) {
    if (record.adminNotifiedAt) return;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USERNAME;
    if (!adminEmail) return;

    let items: any[] = [];
    try {
      items = JSON.parse(record.items || "[]");
    } catch {
      items = [];
    }
    const rows = items.length
      ? items
          .map(
            (it) =>
              `<tr><td style="padding:8px 4px;font-weight:600">${esc(it.name || "Produit")}${it.variantLabel ? ` <span style="color:#64748b;font-weight:400">(${esc(it.variantLabel)})</span>` : ""}</td><td style="padding:8px 4px;text-align:center">×${esc(it.quantity || 1)}</td><td style="padding:8px 4px;text-align:right">${(((it.priceMillimes || 0) * (it.quantity || 1)) / 1000).toFixed(3)} DT</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="3" style="padding:8px;color:#94a3b8;text-align:center">Aucun article</td></tr>';

    const adminUrl = process.env.ADMIN_URL || "https://admin.paratunisie.com";
    const sourceLabel =
      record.source === "LANDING_PAGE" ? "Landing Anabolic Whey 80" : record.source === "BUY_NOW_MODAL" ? "Achat rapide" : "Page commande";
    const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      <div style="background:#1C4A3A;padding:18px 22px;color:#fff"><h1 style="margin:0;font-size:17px">Commande abandonnée</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.9">Un visiteur n'a pas finalisé sa commande (${esc(sourceLabel)}).</p></div>
      <div style="padding:20px 22px;font-size:14px;color:#334155">
        <p style="margin:4px 0"><strong>Nom :</strong> ${esc(record.customerName || "—")}</p>
        <p style="margin:4px 0"><strong>Téléphone :</strong> ${esc(record.phone || "—")}</p>
        <p style="margin:4px 0"><strong>Gouvernorat :</strong> ${esc(record.gouvernorat || "—")}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px">${rows}</table>
        <p style="text-align:right;margin:12px 0 0"><strong>Total estimé : ${(record.totalMillimes / 1000).toFixed(3)} DT</strong></p>
        <p style="text-align:center;margin:22px 0 4px"><a href="${esc(adminUrl)}/admin/commandes-abandonnees" style="background:#1C4A3A;color:#fff;padding:11px 20px;border-radius:9px;text-decoration:none;font-weight:700">Ouvrir dans l'admin</a></p>
      </div>
    </div>`;

    this.emailService
      .sendEmail(adminEmail, `Commande abandonnée — ${record.customerName || record.phone || "visiteur"} (${(record.totalMillimes / 1000).toFixed(3)} DT)`, html)
      .then((res) => {
        if (res.success) {
          this.prisma.abandonedCheckout.update({ where: { id: record.id }, data: { adminNotifiedAt: new Date() } }).catch(() => undefined);
        }
      })
      .catch((err) => this.logger.warn(`Failed to send abandoned checkout email: ${err.message}`));
  }

  /* ───────────────────────── public: progressive draft ───────────────────────── */

  /** Resolve the catalogue line for a landing draft from the DB — the client never dictates prices. */
  private async resolveLandingLine(productId?: string, variantId?: string, quantity = 1) {
    if (!productId && !variantId) return null;
    const variant = variantId
      ? await this.prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } } })
      : await this.prisma.productVariant.findFirst({
          where: { productId },
          orderBy: { priceMillimes: "asc" },
          include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
        });
    if (!variant) return null;
    const qty = Math.max(1, Math.min(10, quantity));
    return {
      variant,
      line: {
        productId: variant.productId,
        productVariantId: variant.id,
        name: variant.product.name,
        image: variant.product.image || variant.product.images?.[0]?.url || undefined,
        variantLabel: variant.label,
        quantity: qty,
        priceMillimes: variant.priceMillimes,
      },
    };
  }

  /**
   * Upsert a checkout draft progressively. Idempotent per checkoutSessionId — repeated typing,
   * refreshes and retries update the same row and never create duplicates.
   */
  async upsertDraft(dto: UpsertCheckoutDraftDto, clientKey = "anon") {
    if (!this.limiter.allow(clientKey)) return { status: "rate_limited" };

    const isLanding = dto.source === CheckoutSource.LANDING_PAGE;
    const localPhone = normalizeTunisianLocalPhone(dto.phone);
    const name = dto.customerName?.trim();
    const hasName = Boolean(name && name.length >= 2);
    const hasPhone = isLanding ? Boolean(localPhone) : (dto.phone || "").replace(/\D/g, "").length >= 6;
    const hasEmail = Boolean(dto.email && dto.email.trim().length >= 4);
    const hasAddress = Boolean(dto.fullAddress && dto.fullAddress.trim().length >= 3);
    const hasGouv = Boolean(dto.gouvernorat && dto.gouvernorat.trim().length >= 2);

    // Landing drafts require the two fields the shopper agreed to share: a real name AND a valid phone.
    if (isLanding) {
      if (!hasName || !hasPhone) return { status: "ignored", reason: "name_and_valid_phone_required" };
    } else if (!hasPhone && !hasName && !hasEmail && !hasAddress && !hasGouv) {
      return { status: "ignored", reason: "no_contact_info" };
    }

    const now = new Date();
    let itemsJson = dto.items && dto.items.length > 0 ? JSON.stringify(dto.items) : null;
    let subtotal = dto.subtotalMillimes ?? 0;
    let shipping = dto.shippingFeeMillimes;
    let total = dto.totalMillimes;
    let productId = dto.productId;

    if (isLanding) {
      const resolved = await this.resolveLandingLine(dto.productId, dto.productVariantId, dto.quantity ?? 1);
      if (resolved) {
        productId = resolved.line.productId;
        itemsJson = JSON.stringify([resolved.line]);
        subtotal = resolved.line.priceMillimes * resolved.line.quantity;
        shipping = computeDeliveryFeeMillimes(subtotal);
        total = subtotal + shipping;
      }
    }
    if (shipping === undefined) shipping = computeDeliveryFeeMillimes(subtotal);
    if (total === undefined) total = subtotal + shipping;

    const gouv = dto.gouvernorat?.trim();
    const common = {
      customerName: name || undefined,
      phone: isLanding ? localPhone ?? undefined : dto.phone?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      gouvernorat: gouv && (!isLanding || isGovernorate(gouv)) ? gouv : undefined,
      fullAddress: dto.fullAddress?.trim() || undefined,
      deliveryNote: dto.deliveryNote?.trim() || undefined,
      sourceUrl: dto.sourceUrl?.slice(0, 800) || undefined,
      landingId: dto.landingId || undefined,
      productId: productId || undefined,
      utmSource: dto.utmSource || undefined,
      utmMedium: dto.utmMedium || undefined,
      utmCampaign: dto.utmCampaign || undefined,
      utmContent: dto.utmContent || undefined,
      fbclid: dto.fbclid || undefined,
      referrerHost: dto.referrerHost || undefined,
      purchaseEventId: dto.purchaseEventId || undefined,
    };

    const existing = await this.prisma.abandonedCheckout.findUnique({ where: { checkoutSessionId: dto.checkoutSessionId } });

    if (existing) {
      if (existing.status === AbandonedCheckoutStatus.CONVERTED) return { status: "already_converted", id: existing.id };
      if (existing.anonymizedAt) return { status: "ignored", reason: "anonymized" };

      // Returning visitor (ABANDONED/EXPIRED) re-opens the same record instead of creating another one.
      const wasCold = existing.status !== AbandonedCheckoutStatus.DRAFT;
      const explicitAbandon = dto.status === "ABANDONED";
      const nextStatus = explicitAbandon ? AbandonedCheckoutStatus.ABANDONED : AbandonedCheckoutStatus.DRAFT;

      const data: Prisma.AbandonedCheckoutUpdateInput = {
        ...Object.fromEntries(Object.entries(common).filter(([, v]) => v !== undefined)),
        items: itemsJson ?? existing.items,
        subtotalMillimes: subtotal > 0 ? subtotal : existing.subtotalMillimes,
        shippingFeeMillimes: shipping,
        totalMillimes: total > 0 ? total : existing.totalMillimes,
        source: dto.source || existing.source,
        status: existing.status === AbandonedCheckoutStatus.ARCHIVED ? existing.status : nextStatus,
        lastActivityAt: now,
      };
      if (dto.privacyNoticeShown) data.privacyNoticeShown = true;
      if (dto.contactConsent !== undefined) {
        data.contactConsent = dto.contactConsent;
        data.contactConsentAt = dto.contactConsent ? existing.contactConsentAt ?? now : null;
      }
      const updated = await this.prisma.abandonedCheckout.update({ where: { id: existing.id }, data });
      if (wasCold && !explicitAbandon && existing.status !== AbandonedCheckoutStatus.ARCHIVED) {
        await this.logEvent(existing.id, "STATUS_CHANGE", existing.status, "DRAFT", undefined, "Le visiteur est revenu");
      }
      if (explicitAbandon && existing.status === AbandonedCheckoutStatus.DRAFT) {
        void this.notifyAdmin(updated);
      }
      return { status: "updated", id: updated.id };
    }

    const created = await this.prisma.abandonedCheckout.create({
      data: {
        checkoutSessionId: dto.checkoutSessionId,
        userId: dto.userId,
        ...common,
        items: itemsJson ?? "[]",
        subtotalMillimes: subtotal,
        shippingFeeMillimes: shipping,
        totalMillimes: total,
        source: dto.source || CheckoutSource.CHECKOUT_PAGE,
        status: dto.status === "ABANDONED" ? AbandonedCheckoutStatus.ABANDONED : AbandonedCheckoutStatus.DRAFT,
        privacyNoticeShown: Boolean(dto.privacyNoticeShown),
        contactConsent: Boolean(dto.contactConsent),
        contactConsentAt: dto.contactConsent ? now : null,
        lastActivityAt: now,
      },
    });
    return { status: "created", id: created.id };
  }

  /**
   * Beacon from the legacy storefront checkout (modal close / page unload). The landing page does NOT use it:
   * switching to another app on mobile must not flag an active shopper as abandoned.
   */
  async markAbandoned(checkoutSessionId: string, clientKey = "anon") {
    if (!checkoutSessionId || !this.limiter.allow(clientKey)) return { status: "ignored" };
    const existing = await this.prisma.abandonedCheckout.findUnique({ where: { checkoutSessionId } });
    if (!existing || existing.status !== AbandonedCheckoutStatus.DRAFT || existing.convertingAt) return { status: "ignored" };

    const updated = await this.prisma.abandonedCheckout.update({
      where: { id: existing.id },
      data: { status: AbandonedCheckoutStatus.ABANDONED },
    });
    await this.logEvent(existing.id, "STATUS_CHANGE", "DRAFT", "ABANDONED", undefined, "Fermeture de la page");
    if (updated.phone || updated.email) void this.notifyAdmin(updated);
    return { status: "abandoned", id: existing.id };
  }

  /* ───────────────────────── order reconciliation ───────────────────────── */

  /** Link a draft to the real order that resulted from it (RECOVERED). */
  async markConverted(checkoutSessionId: string, orderId: string) {
    if (!checkoutSessionId) return;
    try {
      const before = await this.prisma.abandonedCheckout.findUnique({ where: { checkoutSessionId } });
      if (!before || before.status === AbandonedCheckoutStatus.CONVERTED) return;
      await this.prisma.abandonedCheckout.update({
        where: { id: before.id },
        data: { status: AbandonedCheckoutStatus.CONVERTED, convertedOrderId: orderId, convertingAt: null, lastActivityAt: new Date() },
      });
      await this.logEvent(before.id, "CONVERTED", before.status, "CONVERTED", undefined, `Commande ${orderId}`);
    } catch (err: any) {
      this.logger.warn(`Failed to mark converted checkout for session ${checkoutSessionId}: ${err.message}`);
    }
  }

  /**
   * Atomically claim a checkout for order creation. Exactly one concurrent submit wins; a stale claim
   * (crashed request) is retaken after two minutes.
   */
  async claimForOrder(checkoutSessionId: string): Promise<"claimed" | "busy" | "converted"> {
    const staleBefore = new Date(Date.now() - 2 * MIN);
    const res = await this.prisma.abandonedCheckout.updateMany({
      where: {
        checkoutSessionId,
        status: { not: AbandonedCheckoutStatus.CONVERTED },
        OR: [{ convertingAt: null }, { convertingAt: { lt: staleBefore } }],
      },
      data: { convertingAt: new Date() },
    });
    if (res.count === 1) return "claimed";
    const row = await this.prisma.abandonedCheckout.findUnique({ where: { checkoutSessionId } });
    return row?.status === AbandonedCheckoutStatus.CONVERTED ? "converted" : "busy";
  }

  async releaseClaim(checkoutSessionId: string) {
    await this.prisma.abandonedCheckout.updateMany({ where: { checkoutSessionId, status: { not: AbandonedCheckoutStatus.CONVERTED } }, data: { convertingAt: null } });
  }

  async findBySession(checkoutSessionId: string) {
    return this.prisma.abandonedCheckout.findUnique({ where: { checkoutSessionId } });
  }

  /* ───────────────────────── admin: listing ───────────────────────── */

  private presentRow(c: AbandonedCheckout & { events?: any[] }, extra: Record<string, unknown> = {}) {
    let parsedItems: any[] = [];
    try {
      parsedItems = JSON.parse(c.items || "[]");
    } catch {}
    const { key, label } = STATUS_LABELS[c.status];
    return {
      ...c,
      parsedItems,
      itemCount: parsedItems.reduce((acc, it) => acc + (it.quantity || 1), 0),
      statusKey: key,
      statusLabel: label,
      trafficSource: classifyTrafficSource(c),
      ...extra,
    };
  }

  /** Legacy list used by the old "Abandonnées" tab of the Commandes page (array, newest first). */
  async getAbandonedCheckouts(params?: { search?: string; status?: string; source?: string }) {
    const where: Prisma.AbandonedCheckoutWhereInput = {};
    if (params?.status && params.status !== "ALL") where.status = params.status as AbandonedCheckoutStatus;
    else where.status = { in: [AbandonedCheckoutStatus.ABANDONED, AbandonedCheckoutStatus.DRAFT] };
    if (params?.source && params.source !== "ALL") where.source = params.source as CheckoutSource;
    if (params?.search) where.OR = this.searchClause(params.search);

    const rows = await this.prisma.abandonedCheckout.findMany({ where, orderBy: { lastActivityAt: "desc" }, take: 100 });
    return rows.map((c) => this.presentRow(c));
  }

  private searchClause(q: string): Prisma.AbandonedCheckoutWhereInput[] {
    const digits = q.replace(/\D/g, "");
    return [
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: digits.length >= 3 ? digits : q } },
      { email: { contains: q, mode: "insensitive" } },
      { gouvernorat: { contains: q, mode: "insensitive" } },
      { items: { contains: q, mode: "insensitive" } },
    ];
  }

  private buildAdminWhere(p: AdminListParams): Prisma.AbandonedCheckoutWhereInput {
    const and: Prisma.AbandonedCheckoutWhereInput[] = [];
    if (p.status && p.status !== "ALL") and.push({ status: p.status as AbandonedCheckoutStatus });
    else and.push({ status: { not: AbandonedCheckoutStatus.ARCHIVED } });
    if (p.productId) and.push({ productId: p.productId });
    if (p.search) and.push({ OR: this.searchClause(p.search) });
    if (p.from) and.push({ lastActivityAt: { gte: new Date(p.from) } });
    if (p.to) and.push({ lastActivityAt: { lte: new Date(new Date(p.to).getTime() + DAY - 1) } });
    if (p.source && p.source !== "ALL") {
      const meta: Prisma.AbandonedCheckoutWhereInput = {
        OR: [{ fbclid: { not: null } }, { utmSource: { in: ["facebook", "fb", "instagram", "ig", "meta"], mode: "insensitive" } }],
      };
      if (p.source === "Meta Ads") and.push(meta);
      else if (p.source === "Autre") and.push({ NOT: meta }, { utmSource: { not: null } });
      else if (p.source === "Organic")
        and.push({ NOT: meta }, { utmSource: null }, { referrerHost: { contains: "google", mode: "insensitive" } });
      else if (p.source === "Direct")
        and.push({ NOT: meta }, { utmSource: null }, { OR: [{ referrerHost: null }, { NOT: { referrerHost: { contains: "google", mode: "insensitive" } } }] });
    }
    return { AND: and };
  }

  async adminList(params: AdminListParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 25));
    const where = this.buildAdminWhere(params);

    let rows: AbandonedCheckout[];
    let total: number;
    if (params.duplicatesOnly) {
      const dup = await this.prisma.abandonedCheckout.groupBy({
        by: ["phone"],
        where: { phone: { not: null }, status: { not: AbandonedCheckoutStatus.ARCHIVED } },
        _count: { _all: true },
        having: { phone: { _count: { gt: 1 } } },
      });
      const phones = dup.map((d) => d.phone as string);
      const w: Prisma.AbandonedCheckoutWhereInput = { AND: [where, { phone: { in: phones } }] };
      [rows, total] = await Promise.all([
        this.prisma.abandonedCheckout.findMany({ where: w, orderBy: { lastActivityAt: "desc" }, skip: (page - 1) * limit, take: limit }),
        this.prisma.abandonedCheckout.count({ where: w }),
      ]);
    } else {
      [rows, total] = await Promise.all([
        this.prisma.abandonedCheckout.findMany({ where, orderBy: { lastActivityAt: "desc" }, skip: (page - 1) * limit, take: limit }),
        this.prisma.abandonedCheckout.count({ where }),
      ]);
    }

    // Duplicate detection (same phone on several drafts) + customers who already have a real order.
    const phones = [...new Set(rows.map((r) => r.phone).filter(Boolean))] as string[];
    const [sameCounts, users] = phones.length
      ? await Promise.all([
          this.prisma.abandonedCheckout.groupBy({
            by: ["phone"],
            where: { phone: { in: phones }, status: { not: AbandonedCheckoutStatus.ARCHIVED } },
            _count: { _all: true },
          }),
          this.prisma.user.findMany({ where: { phone: { in: phones } }, select: { phone: true, _count: { select: { orders: true } } } }),
        ])
      : [[], []];
    const dupMap = new Map(sameCounts.map((g) => [g.phone, g._count._all]));
    const orderMap = new Map(users.map((u) => [u.phone, u._count.orders]));

    return {
      items: rows.map((c) =>
        this.presentRow(c, {
          duplicateCount: Math.max(0, (dupMap.get(c.phone) ?? 1) - 1),
          existingCustomerOrders: orderMap.get(c.phone) ?? 0,
        }),
      ),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async adminStats(params: Pick<AdminListParams, "from" | "to" | "productId">) {
    const where: Prisma.AbandonedCheckoutWhereInput = {};
    if (params.productId) where.productId = params.productId;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(new Date(params.to).getTime() + DAY - 1) } : {}),
      };
    }
    const groups = await this.prisma.abandonedCheckout.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
      _sum: { totalMillimes: true },
    });
    const by = (s: AbandonedCheckoutStatus) => groups.find((g) => g.status === s);
    const abandoned = by("ABANDONED")?._count._all ?? 0;
    const expired = by("EXPIRED")?._count._all ?? 0;
    const recovered = by("CONVERTED")?._count._all ?? 0;
    const inProgress = by("DRAFT")?._count._all ?? 0;
    const denom = abandoned + expired + recovered;
    const consent = await this.prisma.abandonedCheckout.count({
      where: { ...where, contactConsent: true, status: { in: ["ABANDONED", "DRAFT"] } },
    });
    return {
      inProgress,
      abandoned,
      recovered,
      expired,
      recoveryRatePct: denom ? Math.round((recovered / denom) * 1000) / 10 : 0,
      abandonedValueMillimes: by("ABANDONED")?._sum.totalMillimes ?? 0,
      recoveredValueMillimes: by("CONVERTED")?._sum.totalMillimes ?? 0,
      withContactConsent: consent,
      thresholds: { inactivityMinutes: this.inactivityMinutes, expireDays: this.expireDays, retentionDays: this.retentionDays },
    };
  }

  /** Products that actually appear in drafts, to feed the admin product filter. */
  async adminProducts() {
    const groups = await this.prisma.abandonedCheckout.groupBy({ by: ["productId"], where: { productId: { not: null } }, _count: { _all: true } });
    const ids = groups.map((g) => g.productId as string);
    const products = ids.length ? await this.prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
    return products.map((p) => ({ productId: p.id, name: p.name, count: groups.find((g) => g.productId === p.id)?._count._all ?? 0 }));
  }

  async getAbandonedCheckoutById(id: string) {
    const checkout = await this.prisma.abandonedCheckout.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    if (!checkout) throw new NotFoundException("Commande abandonnée introuvable");
    const duplicates = checkout.phone
      ? await this.prisma.abandonedCheckout.count({ where: { phone: checkout.phone, id: { not: id }, status: { not: AbandonedCheckoutStatus.ARCHIVED } } })
      : 0;
    return this.presentRow(checkout, { events: checkout.events, duplicateCount: duplicates });
  }

  /* ───────────────────────── admin: workflow ───────────────────────── */

  async setStatus(id: string, dto: SetCheckoutStatusDto, staffId?: string) {
    const row = await this.prisma.abandonedCheckout.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Commande abandonnée introuvable");
    if (row.status === AbandonedCheckoutStatus.CONVERTED) {
      throw new BadRequestException("Cette commande abandonnée est déjà récupérée : son statut ne peut plus être modifié.");
    }
    if (row.status === dto.status) return this.getAbandonedCheckoutById(id);
    await this.prisma.abandonedCheckout.update({ where: { id }, data: { status: dto.status } });
    await this.logEvent(id, "STATUS_CHANGE", row.status, dto.status, staffId, dto.note);
    return this.getAbandonedCheckoutById(id);
  }

  async addNote(id: string, note: string, staffId?: string) {
    await this.getAbandonedCheckoutById(id);
    await this.logEvent(id, "NOTE", null, null, staffId, note);
    return this.getAbandonedCheckoutById(id);
  }

  /** Audit entry when staff open the WhatsApp composer (only offered when the shopper opted in). */
  async logWhatsappOpened(id: string, staffId?: string) {
    const row = await this.getAbandonedCheckoutById(id);
    if (!row.contactConsent) throw new BadRequestException("Ce visiteur n'a pas accepté d'être recontacté.");
    await this.logEvent(id, "WHATSAPP_OPENED", null, null, staffId, "Brouillon WhatsApp ouvert");
    return { success: true };
  }

  /**
   * Permanently delete drafts, personal data included. Recovered ones are kept (they document a real order),
   * and so is a draft whose order is being created at this very moment.
   */
  async bulkDelete(ids: string[]) {
    const unique = [...new Set(ids)];
    const keptRecovered = await this.prisma.abandonedCheckout.count({
      where: { id: { in: unique }, status: AbandonedCheckoutStatus.CONVERTED },
    });
    const res = await this.prisma.abandonedCheckout.deleteMany({
      where: { id: { in: unique }, status: { not: AbandonedCheckoutStatus.CONVERTED }, convertingAt: null },
    });
    this.logger.log(`bulk delete: ${res.count} deleted, ${keptRecovered} recovered kept`);
    return { deleted: res.count, skippedRecovered: keptRecovered };
  }

  async deleteAbandonedCheckout(id: string, staffId?: string) {
    const row = await this.prisma.abandonedCheckout.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Commande abandonnée introuvable");
    await this.prisma.abandonedCheckout.update({ where: { id }, data: { status: AbandonedCheckoutStatus.ARCHIVED } });
    await this.logEvent(id, "STATUS_CHANGE", row.status, "ARCHIVED", staffId, "Archivée");
    return { success: true };
  }

  /**
   * Turn an abandoned checkout into a real order — ONLY after the customer explicitly confirmed it
   * (phone/WhatsApp), which the admin must affirm. Prices come from the catalogue, never from the draft,
   * the order enters the normal workflow as EN_ATTENTE (stock is reserved when staff confirm it).
   */
  async convertToOrder(id: string, customerConfirmed: boolean, staffId?: string, note?: string) {
    if (customerConfirmed !== true) {
      throw new BadRequestException("La confirmation explicite du client est obligatoire pour créer la commande.");
    }
    const checkout = await this.getAbandonedCheckoutById(id);
    if (checkout.status === AbandonedCheckoutStatus.CONVERTED) {
      throw new BadRequestException("Cette commande abandonnée a déjà été convertie.");
    }
    const phone = checkout.phone ? normalizeTunisianLocalPhone(checkout.phone) ?? checkout.phone : null;
    if (!phone || !checkout.gouvernorat || !checkout.fullAddress) {
      throw new BadRequestException("Téléphone, gouvernorat et adresse sont obligatoires pour créer une commande.");
    }

    const claim = await this.claimForOrder(checkout.checkoutSessionId);
    if (claim !== "claimed") throw new BadRequestException("Cette commande abandonnée est déjà en cours de traitement ou convertie.");

    try {
      const lines: { productId: string; productVariantId: string; quantity: number; priceMillimes: number }[] = [];
      for (const it of checkout.parsedItems as any[]) {
        const variant = it.productVariantId
          ? await this.prisma.productVariant.findUnique({ where: { id: it.productVariantId } })
          : await this.prisma.productVariant.findFirst({ where: { productId: it.productId }, orderBy: { priceMillimes: "asc" } });
        if (!variant) throw new BadRequestException(`Produit introuvable pour "${it.name ?? it.productId}".`);
        if (variant.stock < (it.quantity || 1)) throw new BadRequestException(`Stock insuffisant pour "${it.name ?? "ce produit"}".`);
        lines.push({ productId: variant.productId, productVariantId: variant.id, quantity: it.quantity || 1, priceMillimes: variant.priceMillimes });
      }
      if (lines.length === 0) throw new BadRequestException("Le panier de cette commande abandonnée est vide.");

      const subtotal = lines.reduce((s, l) => s + l.priceMillimes * l.quantity, 0);
      const total = subtotal + computeDeliveryFeeMillimes(subtotal);

      let user = await this.prisma.user.findFirst({ where: { OR: [{ phone }, ...(checkout.email ? [{ email: checkout.email }] : [])] } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: checkout.email || `client-${phone}@paratunisie.tn`,
            name: checkout.customerName || "Client ParaTunisie",
            phone,
            password: "checkout_guest",
          },
        });
      }

      const order = await this.prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.EN_ATTENTE,
          totalMillimes: total,
          gouvernorat: checkout.gouvernorat,
          fullAddress: checkout.fullAddress,
          deliveryNote: checkout.deliveryNote ?? null,
          items: { create: lines },
          payment: { create: { method: "cod", status: "pending", amount: total } },
          shipment: { create: { carrier: "Standard", status: "pending" } },
          statusHistory: {
            create: { toStatus: OrderStatus.EN_ATTENTE, staffId: staffId || null, note: `Créée depuis une commande abandonnée après confirmation du client.${note ? ` ${note}` : ""}` },
          },
        },
      });
      await this.markConverted(checkout.checkoutSessionId, order.id);
      await this.logEvent(id, "CONVERTED", checkout.status, "CONVERTED", staffId, note ?? "Confirmée par le client");
      return { success: true, orderId: order.id, orderReference: `PT-${order.id.slice(-6).toUpperCase()}` };
    } catch (err) {
      await this.releaseClaim(checkout.checkoutSessionId);
      throw err;
    }
  }

  /** Sidebar badge: drafts that need a human follow-up. Never mixed into operational order counts. */
  async countAbandoned() {
    return this.prisma.abandonedCheckout.count({ where: { status: AbandonedCheckoutStatus.ABANDONED } });
  }

  get governorates() {
    return GOVERNORATES;
  }
}
