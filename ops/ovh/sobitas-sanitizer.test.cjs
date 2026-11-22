"use strict";
// Run: node ops/ovh/sobitas-sanitizer.test.cjs   (needs @prisma/client resolvable, as the sync script does)
const assert = require("assert");
const { clean } = require("./sobitas-sync.cjs");
const cases = [
  ["Retrouvez **X 390g** chez **PROTEIN.TN**, votre spécialiste.\nComposition : créatine.", /^Composition : créatine\.$/],
  ["Disponible sur **www.protein.tn**, votre boutique n°1.\nUtilisation : 1 dose.", /^Utilisation : 1 dose\.$/],
  ["**CONSEIL DE L'EXPERT PROTEIN.TN :**\nPrendre après l'effort.", /^Prendre après l'effort\.$/],
  ["Vendu par Sobitas Nutrition.\nOK ligne.", /^OK ligne\.$/],
  ["Livraison gratuite dès 100 DT\nBonne formule.", /^Bonne formule\.$/],
  ["Whey Protéine Tunisie premium", /ParaTunisie|Whey Protéine Tunisie/],
];
for (const [input, expected] of cases) {
  const out = clean(input);
  assert.match(out, expected, `input: ${input} -> ${out}`);
  assert.doesNotMatch(out, /protein\.tn|sobitas/i, `legacy brand left in: ${out}`);
}
console.log("sanitizer tests passed:", cases.length);
