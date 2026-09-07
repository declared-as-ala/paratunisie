import { COMPANY_CONFIG } from "./config/company";

const configuredWhatsAppNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
  COMPANY_CONFIG.phoneRaw.replace(/\D/g, "");

export const hasConfiguredWhatsApp = true;
export const whatsappHref = `https://wa.me/${configuredWhatsAppNumber}`;

export const phoneNumber = COMPANY_CONFIG.phone;
export const phoneHref = `tel:${COMPANY_CONFIG.phoneRaw}`;

