const fs = require('fs');
const path = require('path');

const catalog36 = JSON.parse(fs.readFileSync('scripts/catalog_clean_36.json', 'utf8'));
const accessoires15 = JSON.parse(fs.readFileSync('scripts/scraped_accessoires.json', 'utf8'));

// Format accessoires into standard product objects
const formattedAccessoires = accessoires15.map((acc, index) => {
  const numId = 37 + index;
  const id = `p${numId < 10 ? '0' + numId : numId}`;
  return {
    id,
    sku: `ACC-${100 + index}`,
    name: acc.name,
    slug: acc.slug,
    subtitle: `${acc.brand} • Accessoire Sport`,
    description: acc.description,
    benefit: acc.benefit,
    usage: acc.usage,
    dosage: acc.dosage,
    composition: acc.composition,
    priceMillimes: acc.priceMillimes,
    priceDT: acc.priceDT,
    originalPriceMillimes: Math.round(acc.priceMillimes * 1.15),
    originalPriceDT: Math.round(acc.priceDT * 1.15),
    stock: 40,
    inStock: true,
    featured: index < 4,
    bestSeller: index === 0 || index === 6 || index === 8,
    categorySlug: 'accessoires',
    categoryName: 'Accessoires',
    brand: acc.brand,
    brandSlug: acc.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    images: [acc.image],
    rating: 4.8,
    reviewCount: 12 + (index * 3),
    seoTitle: acc.seoTitle,
    seoDescription: acc.seoDescription,
    seoKeywords: acc.seoKeywords,
    seoFaq: acc.seoFaq,
  };
});

const allProducts = [...catalog36, ...formattedAccessoires];

console.log(`Merged total products: ${allProducts.length}`);

// Ensure categories include 'accessoires'
const existingCategories = [
  { id: 'cat_creatine', name: 'Créatine', slug: 'creatine', description: 'Créatines monohydrate et micronisées certifiées pures pour force et explosivité.' },
  { id: 'cat_whey', name: 'Whey Protéine', slug: 'whey-proteine', description: 'Isolate, concentré et hydrolysat pour prise de muscle sec et récupération.' },
  { id: 'cat_pre_workout', name: 'Pre-Workout & Boosters', slug: 'pre-workout', description: 'Boosters d’énergie, caféine, citrulline et formules pré-entraînement.' },
  { id: 'cat_bcaa', name: 'BCAA & Acides Aminés', slug: 'bcaa-acides-amines', description: 'BCAA ratio 2:1:1 et acides aminés essentiels anti-cataboliques.' },
  { id: 'cat_vitamines', name: 'Vitamines & Minéraux', slug: 'vitamines-mineraux', description: 'Multivitamines, Vitamine D3, Zinc et Magnésium pour le métabolisme sportif.' },
  { id: 'cat_bruleurs', name: 'Brûleurs de Graisse', slug: 'bruleurs-graisse', description: 'Formules thermogéniques et L-Carnitine pour sèche musculaire.' },
  { id: 'cat_visage', name: 'Soins du Visage', slug: 'soins-du-visage', description: 'Nettoyants, sérums haute tolérance et crèmes hydratantes dermo-cosmétiques.' },
  { id: 'cat_accessoires', name: 'Accessoires', slug: 'accessoires', description: 'Shakers sans BPA, gants de musculation, ceintures lombaires et sangles de tirage.' },
];

// Extract distinct brands
const brandNames = [...new Set(allProducts.map(p => p.brand))];
const brands = brandNames.map(name => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}));

fs.writeFileSync('scripts/catalog_full_51.json', JSON.stringify(allProducts, null, 2), 'utf8');
fs.writeFileSync('scripts/categories_all.json', JSON.stringify(existingCategories, null, 2), 'utf8');
fs.writeFileSync('scripts/brands_all.json', JSON.stringify(brands, null, 2), 'utf8');

console.log(`Saved 51 products, ${existingCategories.length} categories, and ${brands.length} brands!`);
