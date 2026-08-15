import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { WinSmsProProvider } from "./sms/winsms-pro.provider";
import { EmailService } from "./email/email.service";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly winSmsProProvider: WinSmsProProvider,
    private readonly emailService: EmailService
  ) {}

  @Get("order/:orderId")
  async getOrderNotifications(@Param("orderId") orderId: string) {
    return this.notificationsService.getOrderNotificationHistory(orderId);
  }

  @Post("retry/:deliveryId")
  async retryNotification(@Param("deliveryId") deliveryId: string) {
    return this.notificationsService.retryNotification(deliveryId);
  }

  @Post("test-sms")
  async testSms(@Body() body: { phone: string; message?: string; senderId?: string }) {
    const message = body.message || "ParaTunisie : test de confirmation de commande #PT-TEST.";
    return this.winSmsProProvider.sendSms(body.phone, message, body.senderId);
  }

  @Post("test-email")
  async testEmail(@Body() body: { to: string; subject?: string }) {
    const subject = body.subject || "ParaTunisie — Test E-mail de Notification";
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #8B263E;">ParaTunisie — Validation Email SMTP</h2>
        <p>Ceci est un test de validation de notification par e-mail.</p>
        <p>Destinataire : <strong>${body.to}</strong></p>
      </div>
    `;
    return this.emailService.sendEmail(body.to, subject, html);
  }
}
