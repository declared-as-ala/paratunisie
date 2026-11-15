import { expiryFrom, generateToken, hashToken, invitationStatus, screenReview } from "./review-rules";

describe("screenReview", () => {
  it("accepts a genuine review and normalises whitespace", () => {
    const r = screenReview({ rating: "4", title: "  Bon produit ", body: "Livraison rapide,   le goût est correct." });
    expect(r.ok).toBe(true);
    expect(r.clean).toEqual({ rating: 4, title: "Bon produit", body: "Livraison rapide, le goût est correct." });
    expect(r.flags).toEqual([]);
  });
  it("accepts a rating without text", () => {
    expect(screenReview({ rating: 5 }).clean).toEqual({ rating: 5, title: null, body: null });
  });
  it.each([0, 6, 3.5, "abc", null, undefined])("rejects rating %s", (rating) => {
    expect(screenReview({ rating: rating as number, body: "Un commentaire assez long." }).ok).toBe(false);
  });
  it("rejects too-short and too-long comments", () => {
    expect(screenReview({ rating: 4, body: "ok" }).ok).toBe(false);
    expect(screenReview({ rating: 4, body: "x".repeat(2001) }).ok).toBe(false);
  });
  it.each(["Voir https://exemple.com pour moins cher", "écrivez-moi sur www.shop.tn", "contactez ali@mail.com", "appelez le 97 123 456 pour une offre", "whatsapp +216 22 333 444 merci"])("rejects links and contact details: %s", (body) => {
    expect(screenReview({ rating: 5, body }).ok).toBe(false);
  });
  it("accepts but flags suspicious text for the moderator", () => {
    expect(screenReview({ rating: 5, body: "SUPER PRODUIT A ACHETER ABSOLUMENT" }).flags).toContain("texte en majuscules");
    expect(screenReview({ rating: 5, body: "bonnnnnnnnnn produit" }).flags).toContain("caractères répétés");
    expect(screenReview({ rating: 5, body: "bien bien bien bien bien bien bien bien bien bien" }).flags).toContain("mots très répétés");
    expect(screenReview({ rating: 5, body: "Produit conforme à la description." }, ["produit conforme à la description."]).flags).toContain("texte identique à un avis existant");
  });
});

describe("invitation tokens", () => {
  it("generates long unique tokens and stores only their hash", () => {
    const a = generateToken(), b = generateToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(a)).not.toContain(a);
    expect(hashToken(a)).toBe(hashToken(a));
  });
  it("reports valid, used and expired invitations", () => {
    const now = new Date("2026-11-15T12:00:00Z");
    expect(invitationStatus({ usedAt: null, expiresAt: expiryFrom(now) }, now)).toBe("valid");
    expect(invitationStatus({ usedAt: new Date(), expiresAt: expiryFrom(now) }, now)).toBe("used");
    expect(invitationStatus({ usedAt: null, expiresAt: new Date("2026-11-01T00:00:00Z") }, now)).toBe("expired");
  });
});
