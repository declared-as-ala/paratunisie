import { Injectable, Logger } from "@nestjs/common";
import { normalizeTunisianPhone, maskPhone } from "../phone.utils";

export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  senderIdUsed: string;
  senderIdAccepted: boolean;
  httpStatus: number;
  rawResponse: string;
  isTransient: boolean;
}

@Injectable()
export class WinSmsProProvider {
  private readonly logger = new Logger(WinSmsProProvider.name);

  private get config() {
    return {
      enabled: process.env.SMS_ENABLED !== "false",
      apiUrl: process.env.SMS_API_URL || "https://www.winsmspro.com/sms/sms/api",
      apiKey: process.env.SMS_API_KEY || "",
      senderId: process.env.SMS_SENDER_ID || "PARATUNISIE",
      timeoutMs: Number(process.env.SMS_TIMEOUT_MS) || 15000,
      maxRetries: Number(process.env.SMS_MAX_RETRIES) || 3,
    };
  }

  async sendSms(toPhone: string, messageText: string, customSenderId?: string): Promise<SmsSendResult> {
    const { enabled, apiUrl, apiKey, senderId, timeoutMs, maxRetries } = this.config;
    const effectiveSenderId = customSenderId || senderId;

    if (!enabled) {
      this.logger.log(`SMS sending is disabled (SMS_ENABLED=false). Skipping recipient ${maskPhone(toPhone)}.`);
      return {
        success: false,
        senderIdUsed: effectiveSenderId,
        senderIdAccepted: false,
        httpStatus: 200,
        rawResponse: "SMS sending disabled via configuration",
        errorMessage: "SMS disabled by config",
        isTransient: false,
      };
    }

    if (!apiKey) {
      this.logger.error("WinSMS Pro API Key is missing in environment (SMS_API_KEY).");
      return {
        success: false,
        senderIdUsed: effectiveSenderId,
        senderIdAccepted: false,
        httpStatus: 500,
        rawResponse: "Missing SMS_API_KEY",
        errorMessage: "Missing SMS_API_KEY configuration",
        isTransient: false,
      };
    }

    const normalized = normalizeTunisianPhone(toPhone);
    if (!normalized.isValid) {
      this.logger.warn(`Invalid Tunisian phone number provided: ${maskPhone(toPhone)}.`);
      return {
        success: false,
        senderIdUsed: effectiveSenderId,
        senderIdAccepted: false,
        httpStatus: 400,
        rawResponse: `Invalid phone number: ${toPhone}`,
        errorMessage: "Invalid Tunisian phone number format",
        isTransient: false,
      };
    }

    const params = new URLSearchParams({
      action: "send-sms",
      api_key: apiKey,
      to: normalized.providerFormat,
      from: effectiveSenderId,
      sms: messageText,
    });

    const url = `${apiUrl}?${params.toString()}`;
    let attempt = 0;
    let lastResult: SmsSendResult | null = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timer);

        const httpStatus = res.status;
        const text = await res.text();

        let parsed: { code?: string; message?: string; id?: string; msg_id?: string } = {};
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = {};
        }

        // WinSMS Pro responses:
        // Success: code "200" or "100" or returns message ID
        // Sender ID error: code "106", message "Invalid Sender id"
        // License/credits error: code "555", message "licence end"
        const isCodeSuccess = parsed.code === "200" || parsed.code === "100" || text.includes("OK") || text.includes("success");
        const senderIdAccepted = parsed.code !== "106";
        const messageId = parsed.id || parsed.msg_id || undefined;

        const isSuccess = isCodeSuccess;

        lastResult = {
          success: isSuccess,
          providerMessageId: messageId,
          errorCode: parsed.code || String(httpStatus),
          errorMessage: parsed.message || (isSuccess ? "Sent" : text),
          senderIdUsed: effectiveSenderId,
          senderIdAccepted,
          httpStatus,
          rawResponse: text,
          isTransient: httpStatus >= 500 || httpStatus === 429,
        };

        if (isSuccess) {
          this.logger.log(`SMS sent successfully to ${maskPhone(toPhone)} via WinSMS Pro (attempt ${attempt}).`);
          return lastResult;
        }

        // Non-transient errors (e.g., 106 Invalid Sender ID, 555 Licence End) should not retry endlessly
        if (!lastResult.isTransient) {
          this.logger.warn(
            `WinSMS Pro returned permanent error (${parsed.code}: ${parsed.message}) for recipient ${maskPhone(toPhone)}.`
          );
          return lastResult;
        }
      } catch (err: any) {
        const isTimeout = err.name === "AbortError";
        const errMsg = isTimeout ? `Request timeout after ${timeoutMs}ms` : err.message;
        
        lastResult = {
          success: false,
          senderIdUsed: effectiveSenderId,
          senderIdAccepted: false,
          httpStatus: 0,
          rawResponse: errMsg,
          errorMessage: errMsg,
          isTransient: true,
        };

        this.logger.warn(
          `WinSMS Pro attempt ${attempt}/${maxRetries} failed for ${maskPhone(toPhone)}: ${errMsg}`
        );

        if (attempt < maxRetries) {
          // Exponential backoff delay
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    return lastResult!;
  }
}
