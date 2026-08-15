import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./services/imports.service";
import { MediaService } from "./services/media.service";
import { SeoGeneratorService } from "./services/seo-generator.service";
import { LocalSeoProvider } from "./provider/local-seo.provider";
import { OpenAiSeoProvider } from "./provider/openai-seo.provider";
import { TunisieParaProvider } from "./provider/tunisiepara.provider";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [ImportsController],
  providers: [
    ImportsService,
    MediaService,
    SeoGeneratorService,
    LocalSeoProvider,
    OpenAiSeoProvider,
    TunisieParaProvider,
  ],
  exports: [ImportsService, MediaService, SeoGeneratorService],
})
export class ImportsModule {}
