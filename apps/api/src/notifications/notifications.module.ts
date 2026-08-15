import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { WinSmsProProvider } from "./sms/winsms-pro.provider";
import { EmailService } from "./email/email.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WinSmsProProvider, EmailService],
  exports: [NotificationsService, WinSmsProProvider, EmailService],
})
export class NotificationsModule {}
