import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import {
  MetaCapiOptions,
  MetaContentItem,
  MetaCustomData,
  MetaEventPayload,
  MetaUserData,
} from "./meta-capi.types";

export function hashSha256(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;
  return crypto.createHash("sha256").update(trimmed).digest("hex");
}

export function normalizeAndHashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  // If 8-digit local Tunisian number, prepend country code 216
  if (digits.length === 8) {
    digits = "216" + digits;
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);
  private readonly sentEventIds = new Set<string>();

  private get config() {
    return {
      enabled: process.env.META_CAPI_ENABLED !== "false",
      pixelId: process.env.META_PIXEL_ID || "2900022603691735",
      accessToken: process.env.META_CONVERSIONS_API_TOKEN || "",
      apiVersion: process.env.META_GRAPH_API_VERSION || "v21.0",
      testEventCode: process.env.META_TEST_EVENT_CODE || undefined,
    };
  }

  /**
   * Builds sanitized, privacy-safe Meta user_data object with required SHA-256 hashing.
   */
  public buildUserData(options?: MetaCapiOptions): MetaUserData {
    const userData: MetaUserData = {};

    if (options?.email) {
      const hashedEmail = hashSha256(options.email);
      if (hashedEmail) userData.em = [hashedEmail];
    }

    if (options?.phone) {
      const hashedPhone = normalizeAndHashPhone(options.phone);
      if (hashedPhone) userData.ph = [hashedPhone];
    }

    if (options?.firstName) {
      const hashedFn = hashSha256(options.firstName);
      if (hashedFn) userData.fn = [hashedFn];
    }

    if (options?.lastName) {
      const hashedLn = hashSha256(options.lastName);
      if (hashedLn) userData.ln = [hashedLn];
    }

    if (options?.city) {
      const hashedCity = hashSha256(options.city);
      if (hashedCity) userData.ct = [hashedCity];
    }

    // Default country for ParaTunisie is Tunisia ('tn')
    userData.country = [hashSha256("tn")!];

    if (options?.clientIp) {
      userData.client_ip_address = options.clientIp;
    }

    if (options?.clientUserAgent) {
      userData.client_user_agent = options.clientUserAgent;
    }

    if (options?.fbp) {
      userData.fbp = options.fbp;
    }

    if (options?.fbc) {
      userData.fbc = options.fbc;
    }

    return userData;
  }

  /**
   * Dispatches an event payload to Meta Graph API Conversions endpoint.
   */
  public async sendEvent(event: MetaEventPayload): Promise<{ success: boolean; error?: string }> {
    const { enabled, pixelId, accessToken, apiVersion, testEventCode } = this.config;

    if (!enabled) {
      return { success: false, error: "Meta CAPI disabled via config" };
    }

    if (!accessToken) {
      this.logger.warn("META_CONVERSIONS_API_TOKEN is not configured. Skipping CAPI event dispatch.");
      return { success: false, error: "Missing META_CONVERSIONS_API_TOKEN" };
    }

    // Idempotency: Prevent sending the exact same event_id multiple times
    if (this.sentEventIds.has(event.event_id)) {
      this.logger.debug?.(`Event ID ${event.event_id} already dispatched to Meta CAPI. Skipping duplicate.`);
      return { success: true };
    }

    const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;

    const requestBody: Record<string, unknown> = {
      data: [event],
    };

    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const resText = await response.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch {}

      if (!response.ok || resJson.error) {
        const errorMsg = resJson.error?.message || `HTTP ${response.status}: ${resText}`;
        this.logger.error(`[Meta CAPI] Event dispatch failed for ${event.event_name} (${event.event_id}): ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      this.sentEventIds.add(event.event_id);
      this.logger.log(
        `[Meta CAPI] ${event.event_name} sent successfully (Event ID: ${event.event_id}, Events Received: ${resJson.events_received ?? 1}).`
      );
      return { success: true };
    } catch (err: any) {
      const isAbort = err.name === "AbortError";
      const errorMsg = isAbort ? "Request timed out after 8000ms" : err.message;
      this.logger.error(`[Meta CAPI] Exception sending ${event.event_name} (${event.event_id}): ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Tracks a Purchase event after an order has been successfully saved to DB.
   */
  public async trackPurchase(
    order: {
      id: string;
      totalMillimes: number;
      gouvernorat?: string;
      user?: { email?: string | null; phone?: string | null; name?: string | null } | null;
      items?: Array<{
        productId?: string | null;
        quantity: number;
        priceMillimes: number;
        product?: { id: string; name?: string } | null;
      }>;
    },
    options?: MetaCapiOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const eventId = options?.eventId || `purchase_${order.id}`;
      const totalTnd = Number((order.totalMillimes / 1000).toFixed(3));

      // Extract user info
      const email = options?.email || order.user?.email || undefined;
      const phone = options?.phone || order.user?.phone || undefined;
      let firstName = options?.firstName;
      let lastName = options?.lastName;

      if (!firstName && order.user?.name) {
        const parts = order.user.name.trim().split(/\s+/);
        firstName = parts[0];
        lastName = parts.slice(1).join(" ") || undefined;
      }

      const userData = this.buildUserData({
        ...options,
        email,
        phone,
        firstName,
        lastName,
        city: options?.city || order.gouvernorat,
      });

      const contents: MetaContentItem[] = (order.items || []).map((item) => {
        const pid = item.productId || item.product?.id || "unknown";
        return {
          id: String(pid),
          quantity: item.quantity || 1,
          item_price: Number(((item.priceMillimes || 0) / 1000).toFixed(3)),
          title: item.product?.name || undefined,
        };
      });

      const contentIds = contents.map((c) => c.id);
      const numItems = contents.reduce((acc, c) => acc + c.quantity, 0);

      const customData: MetaCustomData = {
        currency: "TND",
        value: totalTnd,
        content_type: "product",
        content_ids: contentIds,
        contents,
        num_items: numItems,
        order_id: `PT-${order.id.slice(-6).toUpperCase()}`,
      };

      const eventPayload: MetaEventPayload = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: options?.eventSourceUrl || "https://paratunisie.com/checkout",
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      };

      return await this.sendEvent(eventPayload);
    } catch (err: any) {
      this.logger.error(`[Meta CAPI] trackPurchase unexpected error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Tracks an InitiateCheckout event on the server.
   */
  public async trackInitiateCheckout(
    data: {
      items: Array<{ productId: string; quantity: number; priceMillimes: number }>;
      totalMillimes: number;
    },
    options?: MetaCapiOptions
  ): Promise<{ success: boolean; error?: string }> {
    const eventId =
      options?.eventId || `ic_${data.items.map((i) => i.productId).sort().join("-")}`;
    const totalTnd = Number((data.totalMillimes / 1000).toFixed(3));
    const userData = this.buildUserData(options);

    const contents: MetaContentItem[] = data.items.map((i) => ({
      id: String(i.productId),
      quantity: i.quantity,
      item_price: Number((i.priceMillimes / 1000).toFixed(3)),
    }));

    const eventPayload: MetaEventPayload = {
      event_name: "InitiateCheckout",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: options?.eventSourceUrl || "https://paratunisie.com/checkout",
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: "TND",
        value: totalTnd,
        content_type: "product",
        content_ids: data.items.map((i) => String(i.productId)),
        contents,
        num_items: data.items.reduce((acc, curr) => acc + curr.quantity, 0),
      },
    };

    return this.sendEvent(eventPayload);
  }

  /**
   * Tracks an AddToCart event on the server.
   */
  public async trackAddToCart(
    item: {
      productId: string;
      quantity: number;
      priceMillimes: number;
      name?: string;
    },
    options?: MetaCapiOptions
  ): Promise<{ success: boolean; error?: string }> {
    const eventId = options?.eventId || `atc_${item.productId}_${Date.now()}`;
    const unitPriceTnd = Number((item.priceMillimes / 1000).toFixed(3));
    const totalTnd = Number(((item.priceMillimes * item.quantity) / 1000).toFixed(3));
    const userData = this.buildUserData(options);

    const eventPayload: MetaEventPayload = {
      event_name: "AddToCart",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: options?.eventSourceUrl || "https://paratunisie.com",
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: "TND",
        value: totalTnd,
        content_type: "product",
        content_ids: [String(item.productId)],
        contents: [
          {
            id: String(item.productId),
            quantity: item.quantity,
            item_price: unitPriceTnd,
            title: item.name,
          },
        ],
        num_items: item.quantity,
      },
    };

    return this.sendEvent(eventPayload);
  }

  /**
   * Tracks a ViewContent event on the server.
   */
  public async trackViewContent(
    product: {
      id: string;
      name: string;
      priceMillimes: number;
      category?: string;
    },
    options?: MetaCapiOptions
  ): Promise<{ success: boolean; error?: string }> {
    const eventId = options?.eventId || `vc_${product.id}`;
    const priceTnd = Number((product.priceMillimes / 1000).toFixed(3));
    const userData = this.buildUserData(options);

    const eventPayload: MetaEventPayload = {
      event_name: "ViewContent",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: options?.eventSourceUrl || `https://paratunisie.com/produits/${product.id}`,
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: "TND",
        value: priceTnd,
        content_type: "product",
        content_name: product.name,
        content_category: product.category,
        content_ids: [String(product.id)],
      },
    };

    return this.sendEvent(eventPayload);
  }
}
