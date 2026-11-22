/**
 * Optional product identifiers. They are NEVER generated or guessed: a value is stored only if a human typed it and it is
 * structurally valid (GS1 check digit for GTIN). Empty input clears the field.
 */
export const GTIN_LENGTHS = [8, 12, 13, 14] as const;

/** GS1 mod-10 check digit validation, valid for GTIN-8/12/13/14. */
export function isValidGtin(value: string): boolean {
  if (!/^\d+$/.test(value) || !(GTIN_LENGTHS as readonly number[]).includes(value.length)) return false;
  const digits = value.split("").map(Number);
  const check = digits.pop() as number;
  let sum = 0;
  digits.reverse().forEach((d, i) => { sum += d * (i % 2 === 0 ? 3 : 1); });
  return (10 - (sum % 10)) % 10 === check;
}

export type IdentifierResult = { ok: true; value: string | null } | { ok: false; error: string };

export function normalizeGtin(input: unknown): IdentifierResult {
  const raw = String(input ?? "").replace(/[\s-]/g, "");
  if (!raw) return { ok: true, value: null };
  if (!isValidGtin(raw)) return { ok: false, error: "GTIN/EAN invalide : 8, 12, 13 ou 14 chiffres avec clé de contrôle correcte." };
  return { ok: true, value: raw };
}

export function normalizeMpn(input: unknown): IdentifierResult {
  const raw = String(input ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return { ok: true, value: null };
  if (raw.length > 60 || !/^[A-Za-z0-9][A-Za-z0-9 ._\/-]*$/.test(raw)) return { ok: false, error: "MPN invalide : 60 caractères maximum, lettres, chiffres et . _ / - uniquement." };
  return { ok: true, value: raw };
}
