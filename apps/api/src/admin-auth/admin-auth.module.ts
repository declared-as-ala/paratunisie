import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET || "dev-only-insecure-secret-change-me",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminAuthGuard, RolesGuard],
  exports: [AdminAuthService, AdminAuthGuard, RolesGuard, JwtModule],
})
export class AdminAuthModule {}
