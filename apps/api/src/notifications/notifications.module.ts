import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { WinSmsProProvider } from "./sms/winsms-pro.provider";
import { EmailService } from "./email/email.service";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [AdminAuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, WinSmsProProvider, EmailService],
  exports: [NotificationsService, WinSmsProProvider, EmailService],
})
export class NotificationsModule {}
