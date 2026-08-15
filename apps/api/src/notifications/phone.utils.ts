/**
 * Normalizes Tunisian phone numbers for WinSMS Pro API (216XXXXXXXX).
 * Accepts formats:
 * - 99123456
 * - +21699123456
 * - 21699123456
 * - 99 123 456
 */
export function normalizeTunisianPhone(input?: string | null): {
  raw: string;
  providerFormat: string;
  formattedInternational: string;
  isValid: boolean;
} {
  if (!input) {
    return { raw: "", providerFormat: "", formattedInternational: "", isValid: false };
  }

  const raw = String(input).trim();
  // Strip all non-digit characters
  const digits = raw.replace(/\D/g, "");

  let local8 = "";

  if (digits.length === 8) {
    local8 = digits;
  } else if (digits.length === 11 && digits.startsWith("216")) {
    local8 = digits.slice(3);
  } else if (digits.length > 8 && digits.endsWith(digits.slice(-8))) {
    // Handling prefixes
    local8 = digits.slice(-8);
  }

  // Tunisian mobile/landline numbers start with 2, 3, 4, 5, 7, 9
  const isValid = /^[234579]\d{7}$/.test(local8);

  if (!isValid) {
    return {
      raw,
      providerFormat: digits,
      formattedInternational: raw,
      isValid: false,
    };
  }

  const providerFormat = `216${local8}`;
  const formattedInternational = `+216 ${local8.slice(0, 2)} ${local8.slice(2, 5)} ${local8.slice(5)}`;

  return {
    raw,
    providerFormat,
    formattedInternational,
    isValid: true,
  };
}

/**
 * Masks phone number for privacy-compliant logging (+21699****56).
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return "N/A";
  const normalized = normalizeTunisianPhone(phone);
  if (!normalized.isValid) {
    const s = normalized.raw;
    return s.length > 4 ? `${s.slice(0, 3)}****${s.slice(-2)}` : "****";
  }
  const digits = normalized.providerFormat; // 21699123456
  return `+${digits.slice(0, 5)}****${digits.slice(-2)}`;
}

/**
 * Partially masks email for privacy-compliant logging (a***i@gmail.com).
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "N/A";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local.charAt(0)}*@${domain}`;
  return `${local.charAt(0)}***${local.slice(-1)}@${domain}`;
}
