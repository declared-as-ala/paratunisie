const configuredWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
  /\D/g,
  "",
);

export const hasConfiguredWhatsApp = Boolean(configuredWhatsAppNumber);
export const whatsappHref = configuredWhatsAppNumber
  ? `https://wa.me/${configuredWhatsAppNumber}`
  : "/aide";

export const phoneNumber = "+216 97 991 266";
export const phoneHref = "tel:+21697991266";
