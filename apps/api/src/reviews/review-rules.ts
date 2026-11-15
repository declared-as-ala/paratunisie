import { createHash, randomBytes } from "node:crypto";

/**
 * Rules for authentic review collection (pure functions).
 *  - A review invitation is tied to ONE real order line (order + product + customer). Its secret token is stored only as a hash.
 *  - Only that link can create a "verified purchase" review. Nothing is auto-approved: every review waits for a moderator.
 *  - Submissions are screened for spam and manipulation signals; suspicious ones are still stored but flagged for the moderator.
 */
export const INVITATION_TTL_DAYS = 60;
export const MIN_BODY = 15;
export const MAX_BODY = 2000;
export const MAX_TITLE = 120;

export const generateToken = (): string => randomBytes(24).toString("base64url");
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const URL_OR_CONTACT = /(https?:\/\/|www\.|\b[\w.+-]+@[\w-]+\.[\w.]+\b|(?:\+?216[\s.-]?)?\b\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b)/i;
const SHOUTING = /^[^a-zà-ÿ]*[A-ZÀ-Ý][A-ZÀ-Ý\s!?.,'’-]{14,}$/;

export type ReviewInput = { rating: unknown; title?: unknown; body?: unknown };
export type ReviewScreening = { ok: boolean; errors: string[]; flags: string[]; clean?: { rating: number; title: string | null; body: string | null } };

const compact = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

/** Validates the customer's text. `errors` reject the submission; `flags` accept it but warn the moderator. */
export function screenReview(input: ReviewInput, previousBodies: string[] = []): ReviewScreening {
  const errors: string[] = [];
  const flags: string[] = [];
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push("La note doit être un nombre entier de 1 à 5.");
  const title = compact(input.title);
  const body = compact(input.body);
  if (title.length > MAX_TITLE) errors.push(`Le titre ne doit pas dépasser ${MAX_TITLE} caractères.`);
  if (body.length > 0 && body.length < MIN_BODY) errors.push(`Votre commentaire doit contenir au moins ${MIN_BODY} caractères, ou rester vide.`);
  if (body.length > MAX_BODY) errors.push(`Votre commentaire ne doit pas dépasser ${MAX_BODY} caractères.`);
  const text = `${title} ${body}`;
  if (URL_OR_CONTACT.test(text)) errors.push("Les liens, adresses e-mail et numéros de téléphone ne sont pas autorisés dans un avis.");
  if (errors.length) return { ok: false, errors, flags };
  if (/(.)\1{7,}/.test(text)) flags.push("caractères répétés");
  if (body && SHOUTING.test(body)) flags.push("texte en majuscules");
  const words = body.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 8 && new Set(words).size / words.length < 0.45) flags.push("mots très répétés");
  if (body && previousBodies.some((b) => compact(b).toLowerCase() === body.toLowerCase())) flags.push("texte identique à un avis existant");
  return { ok: true, errors, flags, clean: { rating, title: title || null, body: body || null } };
}

export type InvitationState = { usedAt: Date | null; expiresAt: Date };
export function invitationStatus(inv: InvitationState, now = new Date()): "valid" | "used" | "expired" {
  if (inv.usedAt) return "used";
  if (inv.expiresAt.getTime() < now.getTime()) return "expired";
  return "valid";
}

export const expiryFrom = (now = new Date()): Date => new Date(now.getTime() + INVITATION_TTL_DAYS * 24 * 3600 * 1000);
