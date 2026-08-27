import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { MetaCapiService } from "./meta-capi.service";

class RelayMetaEventDto {
  eventName!: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | string;
  eventId!: string;
  eventSourceUrl?: string;
  customData?: Record<string, any>;
  userData?: Record<string, any>;
}

@Controller("tracking")
export class MetaCapiController {
  constructor(private readonly metaCapiService: MetaCapiService) {}

  @Post("meta-event")
  async relayMetaEvent(@Body() body: RelayMetaEventDto, @Req() req: Request) {
    if (!body?.eventName || !body?.eventId) {
      return { success: false, error: "eventName and eventId are required" };
    }

    const forwardedFor = (req.headers["x-forwarded-for"] as string) || "";
    const clientIp =
      body.userData?.client_ip_address ||
      forwardedFor.split(",")[0].trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const clientUserAgent =
      body.userData?.client_user_agent || (req.headers["user-agent"] as string) || undefined;

    const cookieHeader = (req.headers.cookie as string) || "";
    let fbp = body.userData?.fbp;
    let fbc = body.userData?.fbc;

    if (!fbp && cookieHeader) {
      const match = cookieHeader.match(/_fbp=([^;]+)/);
      if (match) fbp = match[1];
    }
    if (!fbc && cookieHeader) {
      const match = cookieHeader.match(/_fbc=([^;]+)/);
      if (match) fbc = match[1];
    }

    const userData = this.metaCapiService.buildUserData({
      ...body.userData,
      clientIp,
      clientUserAgent,
      fbp,
      fbc,
    });

    const result = await this.metaCapiService.sendEvent({
      event_name: body.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.eventId,
      event_source_url: body.eventSourceUrl || (req.headers.referer as string) || "https://paratunisie.com",
      action_source: "website",
      user_data: userData,
      custom_data: body.customData,
    });

    return result;
  }
}
