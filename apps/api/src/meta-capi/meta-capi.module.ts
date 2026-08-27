import { Module } from "@nestjs/common";
import { MetaCapiService } from "./meta-capi.service";
import { MetaCapiController } from "./meta-capi.controller";

@Module({
  controllers: [MetaCapiController],
  providers: [MetaCapiService],
  exports: [MetaCapiService],
})
export class MetaCapiModule {}
