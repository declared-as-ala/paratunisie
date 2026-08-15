import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateNavigationItemDto {
  label: string;
  slug?: string;
  icon?: string;
  description?: string;
  position?: number;
  isVisible?: boolean;
  subcategoryMode?: "AUTO" | "MANUAL";
  categoryIds?: string[];
  manualSubcategoryIds?: string[];
}

export interface UpdateNavigationItemDto extends Partial<CreateNavigationItemDto> {}

@Injectable()
export class NavigationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Seeds initial 7 database navigation items if none exist in the database.
   */
  async ensureSeededNavigation() {
    try {
      const count = await this.prisma.navigationItem.count();
      if (count > 0) return;

      // Lookup real DB categories to map IDs dynamically
      const dbCats = await this.prisma.category.findMany();
      const findId = (slugOrName: string) => {
        const match = dbCats.find(
          (c) =>
            c.slug.toLowerCase() === slugOrName.toLowerCase() ||
            c.name.toLowerCase() === slugOrName.toLowerCase()
        );
        return match ? match.id : null;
      };

      const visageId = findId("visage");
      const solaireId = findId("solaire");
      const cheveuxId = findId("cheveux");
      const bebeId = findId("bebe-maman") || findId("Bébé & maman");
      const santeId = findId("sante") || findId("Santé");
      const santeBeauteId = findId("sante-beaute") || findId("Santé & Beauté");
      const hygieneId = findId("hygiene") || findId("Hygiène");
      const corpsId = findId("corps") || findId("CORPS");
      const maquillageId = findId("maquillage") || findId("Maquillage");

      const seedItems = [
        {
          label: "Visage",
          slug: "visage",
          icon: "Sparkles",
          description: "Nettoyants, sérums, crèmes et soins ciblés.",
          position: 1,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify(visageId ? [visageId] : []),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Solaire",
          slug: "solaire",
          icon: "Sun",
          description: "Protection solaire visage et corps SPF 50+.",
          position: 2,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify(solaireId ? [solaireId] : []),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Cheveux",
          slug: "cheveux",
          icon: "Droplets",
          description: "Shampoings, masques et soins anti-chute.",
          position: 3,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify(cheveuxId ? [cheveuxId] : []),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Bébé & Maternité",
          slug: "bebe-maman",
          icon: "Baby",
          description: "Soins doux pour bébé et maman.",
          position: 4,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify(bebeId ? [bebeId] : []),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Santé & Orthopédie",
          slug: "sante-orthopedie",
          icon: "Activity",
          description: "Vitamines, orthopédie Tynor et bien-être.",
          position: 5,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify([santeId, santeBeauteId].filter(Boolean)),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Hygiène & Corps",
          slug: "hygiene-corps",
          icon: "Heart",
          description: "Toilette intime, gels douche et savons.",
          position: 6,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify([hygieneId, corpsId].filter(Boolean)),
          manualSubcategoryIds: JSON.stringify([]),
        },
        {
          label: "Maquillage",
          slug: "maquillage",
          icon: "Palette",
          description: "Vernis à ongles, rouges à lèvres et teint.",
          position: 7,
          isVisible: true,
          subcategoryMode: "AUTO" as const,
          categoryIds: JSON.stringify(maquillageId ? [maquillageId] : []),
          manualSubcategoryIds: JSON.stringify([]),
        },
      ];

      for (const item of seedItems) {
        await this.prisma.navigationItem.create({ data: item });
      }
    } catch (err) {
      console.warn("Navigation seeding warning:", err);
    }
  }

  /**
   * Resolves public header navigation items dynamically from PostgreSQL.
   */
  async getPublicMainNavigation() {
    await this.ensureSeededNavigation();

    const items = await this.prisma.navigationItem.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    const resolved = await Promise.all(
      items.map(async (item) => {
        let catIds: string[] = [];
        let manualSubIds: string[] = [];
        try {
          catIds = JSON.parse(item.categoryIds || "[]");
        } catch {
          catIds = [];
        }
        try {
          manualSubIds = JSON.parse(item.manualSubcategoryIds || "[]");
        } catch {
          manualSubIds = [];
        }

        // Fetch mapped root categories
        const mappedCategories = await this.prisma.category.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true, slug: true },
        });

        // Resolve subcategories
        let subcategories: { id: string; name: string; slug: string; productCount: number; href: string }[] = [];

        if (item.subcategoryMode === "AUTO" && catIds.length > 0) {
          // Fetch child categories under mapped root categories
          const childCategories = await this.prisma.category.findMany({
            where: { parentId: { in: catIds } },
            include: {
              _count: { select: { products: true } },
            },
            orderBy: { name: "asc" },
            take: 12,
          });

          subcategories = childCategories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count.products,
            href: `/shop?category=${encodeURIComponent(c.slug)}`,
          }));

          // If no direct child categories have products, attempt deeper or fall back to child categories
          if (subcategories.length === 0) {
            const rootWithCounts = await this.prisma.category.findMany({
              where: { id: { in: catIds } },
              include: { _count: { select: { products: true } } },
            });
            subcategories = rootWithCounts.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              productCount: c._count.products,
              href: `/shop?category=${encodeURIComponent(c.slug)}`,
            }));
          }
        } else if (item.subcategoryMode === "MANUAL" && manualSubIds.length > 0) {
          const manualCats = await this.prisma.category.findMany({
            where: { id: { in: manualSubIds } },
            include: { _count: { select: { products: true } } },
          });

          subcategories = manualCats.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count.products,
            href: `/shop?category=${encodeURIComponent(c.slug)}`,
          }));
        }

        // Target href link for main item: if group of categories, join slugs; if single, use slug
        const categorySlugs = mappedCategories.map((c) => c.slug);
        const itemHref =
          categorySlugs.length > 0
            ? `/shop?category=${encodeURIComponent(categorySlugs.join(","))}`
            : `/shop?category=${encodeURIComponent(item.slug)}`;

        return {
          id: item.id,
          label: item.label,
          slug: item.slug,
          icon: item.icon,
          description: item.description,
          position: item.position,
          subcategoryMode: item.subcategoryMode,
          href: itemHref,
          categories: mappedCategories,
          subcategories,
        };
      })
    );

    return { items: resolved };
  }

  /**
   * Returns all navigation items for Admin management with full details.
   */
  async getAdminNavigationItems() {
    await this.ensureSeededNavigation();

    const items = await this.prisma.navigationItem.findMany({
      orderBy: { position: "asc" },
    });

    const allCategories = await this.prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: "asc" },
    });

    const resolved = items.map((item) => {
      let catIds: string[] = [];
      let manualSubIds: string[] = [];
      try {
        catIds = JSON.parse(item.categoryIds || "[]");
      } catch {
        catIds = [];
      }
      try {
        manualSubIds = JSON.parse(item.manualSubcategoryIds || "[]");
      } catch {
        manualSubIds = [];
      }

      const mappedCategories = allCategories.filter((c) => catIds.includes(c.id));
      const manualSubcategories = allCategories.filter((c) => manualSubIds.includes(c.id));

      // Compute auto subcategories preview
      const autoSubcategories = allCategories.filter(
        (c) => c.parentId && catIds.includes(c.parentId)
      );

      return {
        id: item.id,
        label: item.label,
        slug: item.slug,
        icon: item.icon,
        description: item.description,
        position: item.position,
        isVisible: item.isVisible,
        subcategoryMode: item.subcategoryMode,
        categoryIds: catIds,
        manualSubcategoryIds: manualSubIds,
        mappedCategories,
        manualSubcategories,
        autoSubcategoriesPreview: autoSubcategories.slice(0, 10),
      };
    });

    return {
      items: resolved,
      availableCategories: allCategories,
    };
  }

  async createNavigationItem(dto: CreateNavigationItemDto) {
    const slug = dto.slug || dto.label.toLowerCase().replace(/[\s&]+/g, "-");
    const count = await this.prisma.navigationItem.count();

    return this.prisma.navigationItem.create({
      data: {
        label: dto.label,
        slug,
        icon: dto.icon || "Sparkles",
        description: dto.description || null,
        position: dto.position ?? count + 1,
        isVisible: dto.isVisible ?? true,
        subcategoryMode: dto.subcategoryMode || "AUTO",
        categoryIds: JSON.stringify(dto.categoryIds || []),
        manualSubcategoryIds: JSON.stringify(dto.manualSubcategoryIds || []),
      },
    });
  }

  async updateNavigationItem(id: string, dto: UpdateNavigationItemDto) {
    const existing = await this.prisma.navigationItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Elément de navigation non trouvé");

    const updateData: Record<string, unknown> = {};

    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.isVisible !== undefined) updateData.isVisible = dto.isVisible;
    if (dto.subcategoryMode !== undefined) updateData.subcategoryMode = dto.subcategoryMode;
    if (dto.categoryIds !== undefined) updateData.categoryIds = JSON.stringify(dto.categoryIds);
    if (dto.manualSubcategoryIds !== undefined)
      updateData.manualSubcategoryIds = JSON.stringify(dto.manualSubcategoryIds);

    return this.prisma.navigationItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteNavigationItem(id: string) {
    const existing = await this.prisma.navigationItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Elément de navigation non trouvé");

    return this.prisma.navigationItem.delete({ where: { id } });
  }

  async reorderNavigationItems(itemIds: string[]) {
    for (let index = 0; index < itemIds.length; index++) {
      await this.prisma.navigationItem.update({
        where: { id: itemIds[index] },
        data: { position: index + 1 },
      });
    }
    return { success: true };
  }
}
