import { Injectable, Logger } from "@nestjs/common";
import * as Minio from "minio";

@Injectable()
export class MinioStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private client: Minio.Client;
  private bucketName = process.env.MINIO_BUCKET || "paratunisie-media";
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
        await this.client.makeBucket(this.bucketName, "us-east-1");
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);

        // Anonymous public read policy for images
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
      this.initialized = true;
    } catch (err) {
      this.logger.error(`Error checking/creating MinIO bucket: ${(err as Error).message}`);
    }
  }

  async uploadBuffer(objectKey: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucket();
    await this.client.putObject(this.bucketName, objectKey, buffer, buffer.length, {
      "Content-Type": contentType,
    });
    return this.getPublicUrl(objectKey);
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.ensureBucket();
      await this.client.statObject(this.bucketName, objectKey);
      return true;
    } catch {
      return false;
    }
  }

  async getObjectStat(objectKey: string): Promise<Minio.BucketItemStat | null> {
    try {
      await this.ensureBucket();
      return await this.client.statObject(this.bucketName, objectKey);
    } catch {
      return null;
    }
  }

  getPublicUrl(objectKey: string): string {
    const baseUrl = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";
    return `${baseUrl}/${this.bucketName}/${objectKey}`;
  }
}
