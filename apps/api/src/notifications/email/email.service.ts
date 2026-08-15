import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { maskEmail } from "../phone.utils";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private get config() {
    return {
      enabled: process.env.MAIL_ENABLED !== "false",
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      username: process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com",
      password: process.env.MAIL_PASSWORD || "",
      encryption: process.env.MAIL_ENCRYPTION || "tls",
      fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com",
      fromName: process.env.MAIL_FROM_NAME || "ParaTunisie",
      adminEmail: process.env.ADMIN_EMAIL || "alamissaoui.dev@gmail.com",
    };
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailSendResult> {
    const { enabled, host, port, username, password, fromAddress, fromName } = this.config;

    if (!enabled) {
      this.logger.log(`Email sending is disabled (MAIL_ENABLED=false). Skipping ${maskEmail(to)}.`);
      return { success: false, errorMessage: "Email disabled via configuration" };
    }

    if (!username || !password) {
      this.logger.error("SMTP credentials (MAIL_USERNAME / MAIL_PASSWORD) missing in environment.");
      return { success: false, errorMessage: "Missing SMTP credentials" };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for 465, false for 587 (STARTTLS)
        auth: {
          user: username,
          pass: password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${maskEmail(to)} (Message ID: ${info.messageId}).`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${maskEmail(to)}: ${err.message}`);
      return { success: false, errorMessage: err.message };
    }
  }
}
