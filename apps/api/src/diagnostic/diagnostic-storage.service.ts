import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as Minio from "minio";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

@Injectable()
export class DiagnosticStorageService {
  private readonly logger = new Logger(DiagnosticStorageService.name);
  private client: Minio.Client;
  private bucketName = process.env.DIAGNOSTIC_MEDIA_BUCKET || "paratunisie-diagnostics";
  private initialized = false;

  constructor() {
    const endPoint = process.env.MINIO_ENDPOINT || "localhost";
    const port = Number(process.env.MINIO_PORT) || 9000;
    const useSSL = process.env.MINIO_USE_SSL === "true";
    const accessKey = process.env.MINIO_ROOT_USER || "paratunisie_dev";
    const secretKey = process.env.MINIO_ROOT_PASSWORD || "paratunisie_dev_secret";

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async ensureBucket(): Promise<void> {
    if (this.initialized) return;

    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        // Private bucket: NO public-read policy applied (CLAUDE.md §18 / Diagnostic spec)
        await this.client.makeBucket(this.bucketName, "us-east-1");
        this.logger.log(`Created PRIVATE MinIO bucket for diagnostic photos: ${this.bucketName}`);
      }
      this.initialized = true;
    } catch (err) {
      this.logger.error(`Error ensuring private MinIO bucket ${this.bucketName}: ${(err as Error).message}`);
    }
  }

  validateUpload(buffer: Buffer, mimeType: string, filename?: string): { mimeType: string; extension: string } {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException("Aucun fichier image n'a été fourni");
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException("La taille de l'image ne doit pas dépasser 8 Mo");
    }

    const normalizedMime = (mimeType || "").toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
      throw new BadRequestException(
        "Format d'image non supporté. Les formats autorisés sont JPEG, PNG et WebP (les fichiers SVG ne sont pas admis).",
      );
    }

    if (filename) {
      const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new BadRequestException(`Extension de fichier non autorisée (${ext})`);
      }
    }

    // Inspect magic bytes to reject SVG or invalid non-image payloads masquerading as JPEG/PNG
    const headerStr = buffer.toString("utf8", 0, Math.min(100, buffer.length));
    if (headerStr.includes("<svg") || headerStr.includes("<?xml")) {
      throw new BadRequestException("Les fichiers vectoriels SVG sont strictement interdits.");
    }

    const extension = normalizedMime === "image/png" ? ".png" : normalizedMime === "image/webp" ? ".webp" : ".jpg";

    return { mimeType: normalizedMime, extension };
  }

  async uploadBuffer(objectKey: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucket();
    await this.client.putObject(this.bucketName, objectKey, buffer, buffer.length, {
      "Content-Type": contentType,
    });
    return objectKey;
  }

  async presignedGetObject(objectKey: string, expiresSeconds = 900): Promise<string> {
    await this.ensureBucket();
    return this.client.presignedGetObject(this.bucketName, objectKey, expiresSeconds);
  }

  async getObjectBuffer(objectKey: string): Promise<Buffer> {
    await this.ensureBucket();
    const stream = await this.client.getObject(this.bucketName, objectKey);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  async removeObject(objectKey: string): Promise<void> {
    try {
      await this.ensureBucket();
      await this.client.removeObject(this.bucketName, objectKey);
      this.logger.log(`Raw diagnostic photo deleted from private bucket for privacy retention: ${objectKey}`);
    } catch (err) {
      this.logger.warn(`Failed to delete raw diagnostic photo ${objectKey}: ${(err as Error).message}`);
    }
  }
}
