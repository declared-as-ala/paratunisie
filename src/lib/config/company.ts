/**
 * Authoritative company information registry for ParaTunisie.
 * Only verified, documented facts are exposed here.
 * Any unverified claims (e.g. unsupported certifications, unverified registrations) are omitted.
 */

export const COMPANY_CONFIG = {
  name: "ParaTunisie",
  legalName: "ParaTunisie",
  commercialName: "ParaTunisie — Compléments Alimentaires & Nutrition Sportive en Tunisie",
  siteUrl: "https://paratunisie.com",
  logoUrl: "https://paratunisie.com/logo.png",
  
  // Verified Contact & Support
  phone: "+216 97 991 266",
  phoneRaw: "+21697991266",
  phoneDisplay: "97 991 266",
  email: "contact@paratunisie.com",
  supportHours: "Lundi - Samedi : 09h00 - 19h00",
  
  // Verified Operations in Tunisia
  country: "Tunisia",
  countryCode: "TN",
  currency: "TND",
  currencySymbol: "DT",
  coverage: "24 Gouvernorats de Tunisie",
  deliveryTime: "24 à 48 heures ouvrables",
  shippingFeeTnd: 7.0,
  freeShippingThresholdTnd: 99.0,
  
  // Payment methods
  paymentMethods: ["Paiement à la livraison (Espèces / Cash on Delivery)"],
  paymentMethodCode: "http://purl.org/goodrelations/v1#CashOnDelivery",
  
  // Official Social & Communication Profiles
  socials: {
    facebook: "https://www.facebook.com/paratunisie",
    instagram: "https://www.instagram.com/paratunisie",
    whatsapp: "https://wa.me/21697991266",
  },
  
  // Guarantees & Real Terms
  guarantees: {
    authenticity: "Références de Grandes Marques Reconnues",
    shipping: "Livraison Express 24-48h sur toute la Tunisie",
    payment: "Paiement sécurisé à la réception du colis",
    support: "Service client à votre écoute par téléphone et WhatsApp",
  }
} as const;
