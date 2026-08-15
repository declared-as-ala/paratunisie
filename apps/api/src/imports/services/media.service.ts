import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir = path.join(process.cwd(), "public", "uploads", "products");

  constructor() {
    void this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      this.logger.error(`Impossible de créer le dossier média: ${(err as Error).message}`);
    }
  }

  slugify(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async downloadAndStoreImage(
    sourceUrl: string,
    productName: string,
    index = 0
  ): Promise<{ url: string; alt: string; hash: string } | null> {
    if (!sourceUrl) return null;

    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Échec de téléchargement HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) return null;

      // SHA-256 deduplication checksum
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      const shortHash = hash.substring(0, 8);

      const baseSlug = this.slugify(productName) || "produit-parapharmacie";
      const fileName = index === 0 ? `${baseSlug}-${shortHash}.webp` : `${baseSlug}-${index + 1}-${shortHash}.webp`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save binary
      await fs.writeFile(filePath, buffer);

      // Clean public URL
      const publicUrl = `/uploads/products/${fileName}`;
      const alt = `${productName}${index > 0 ? ` - Vue ${index + 1}` : ""}`;

      return { url: publicUrl, alt, hash };
    } catch (err) {
      this.logger.warn(`Impossible de télécharger l'image ${sourceUrl}: ${(err as Error).message}`);
      return null;
    }
  }
}
