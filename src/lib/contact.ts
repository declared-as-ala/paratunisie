const configuredWhatsAppNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "21697991266";

export const hasConfiguredWhatsApp = true;
export const whatsappHref = `https://wa.me/${configuredWhatsAppNumber}`;

export const phoneNumber = "+216 97 991 266";
export const phoneHref = "tel:+21697991266";
