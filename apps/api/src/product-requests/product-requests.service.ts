import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";
import { EmailService } from "../notifications/email/email.service";

@Injectable()
export class ProductRequestsService {
  private readonly logger = new Logger(ProductRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(dto: CreateProductRequestDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, name: true, slug: true, image: true, brand: { select: { name: true } } },
    });

    if (!product) {
      throw new NotFoundException(`Produit introuvable: ${dto.productId}`);
    }

    const created = await this.prisma.productRequest.create({
      data: {
        productId: dto.productId,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        quantity: dto.quantity || 1,
        message: dto.message?.trim() || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            brand: { select: { name: true } },
          },
        },
      },
    });

    // Send instant Admin Email Alert
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com";
    if (adminEmail) {
      const cleanPhone = dto.phone.replace(/\D/g, "");
      const waPhone = cleanPhone.startsWith("216") ? cleanPhone : `216${cleanPhone}`;
      const waLink = cleanPhone
        ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour ${dto.fullName}, nous avons bien reçu votre demande pour "${product.name}".`)}`
        : null;

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #D97706; padding: 22px 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 18px; font-weight: 800;">📦 Nouvelle Demande de Produit</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Un client souhaite commander un produit sur commande ou en rupture.</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">👤 Coordonnées du Client</h3>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Nom & Prénom :</strong> <span style="font-weight: 700; color: #0f172a;">${dto.fullName}</span></p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Téléphone :</strong> <a href="tel:${dto.phone}" style="color: #D97706; font-weight: 800; text-decoration: underline;">${dto.phone}</a></p>
            ${dto.email ? `<p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Email :</strong> <a href="mailto:${dto.email}" style="color: #0284c7; text-decoration: none;">${dto.email}</a></p>` : ""}
            <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Quantité souhaitée :</strong> <span style="font-weight: 700;">${dto.quantity || 1}</span></p>
            ${dto.message ? `<p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Message / Note :</strong> <em style="color: #b45309;">${dto.message}</em></p>` : ""}
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; font-weight: 800; text-transform: uppercase;">💊 Produit Demandé</h3>
            <p style="margin: 4px 0; font-size: 15px; font-weight: bold; color: #78350f;">${product.name}</p>
            ${product.brand?.name ? `<p style="margin: 2px 0; font-size: 12px; color: #b45309;">Marque : <strong>${product.brand.name}</strong></p>` : ""}
            <p style="margin: 8px 0 0 0; font-size: 12px;"><a href="https://paratunisie.com/produits/${product.slug}" target="_blank" style="color: #b45309; text-decoration: underline; font-weight: bold;">Voir la fiche produit sur ParaTunisie →</a></p>
          </div>

          <div style="text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
            ${waLink ? `<a href="${waLink}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; padding: 12px 22px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px; margin: 4px 6px;">📲 Répondre sur WhatsApp</a>` : ""}
            <a href="https://paratunisie.com/admin/demandes" target="_blank" style="display: inline-block; background: #D97706; color: #ffffff; padding: 12px 22px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px; margin: 4px 6px;">Ouvrir l'Admin Demandes</a>
          </div>
        </div>
      </div>`;

      const subject = `📦 Demande Produit — ${product.name} (${dto.fullName})`;

      this.emailService.sendEmail(adminEmail, subject, html).catch((err) => {
        this.logger.warn(`Failed to send product request email: ${err.message}`);
      });
    }

    return created;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.productRequest.count({ where }),
      this.prisma.productRequest.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async update(id: string, dto: UpdateProductRequestDto) {
    const existing = await this.prisma.productRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Demande #${id} introuvable.`);
    }

    return this.prisma.productRequest.update({
      where: { id },
      data: {
        status: dto.status,
        adminNotes: dto.adminNotes,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            brand: { select: { name: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.productRequest.delete({ where: { id } });
  }
}
