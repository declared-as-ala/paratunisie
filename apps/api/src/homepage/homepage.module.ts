import { Module } from "@nestjs/common";
import { HomepageController } from "./homepage.controller";
import { HomepageService } from "./homepage.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [AdminAuthModule],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
