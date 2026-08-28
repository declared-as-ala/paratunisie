const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const PRODUCT_URLS = [
  "https://protein.tn/accessoires/protein-shaker-450ml-sport-life",
  "https://protein.tn/accessoires/bande-genoux",
  "https://protein.tn/accessoires/lifting-straps",
  "https://protein.tn/accessoires/bouteille-d-eau-2-2-litres",
  "https://protein.tn/accessoires/bandes-de-poignet",
  "https://protein.tn/accessoires/bandes-de-tirage",
  "https://protein.tn/accessoires/gants-de-musculation",
  "https://protein.tn/accessoires/gant-de-fitness",
  "https://protein.tn/accessoires/ceinture-dos-gold-s-gym",
  "https://protein.tn/accessoires/ceinture-dos-de-musculation",
  "https://protein.tn/accessoires/shaker-universal-nutrition-700ml",
  "https://protein.tn/accessoires/bouteille-d-eau-1-8-litres",
  "https://protein.tn/accessoires/gut-blaster-ab-slings",
  "https://protein.tn/accessoires/dip-belt",
  "https://protein.tn/accessoires/shaker-kong-700ml",
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return resolve(fetchUrl(redirectUrl));
      }
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return resolve(downloadBinary(redirectUrl, destPath));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  const uploadsDir = path.resolve(__dirname, '../public/uploads/products');
  const apiUploadsDir = path.resolve(__dirname, '../apps/api/public/uploads/products');
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(apiUploadsDir, { recursive: true });

  const results = [];

  for (let i = 0; i < PRODUCT_URLS.length; i++) {
    const url = PRODUCT_URLS[i];
    console.log(`\n[${i + 1}/${PRODUCT_URLS.length}] Fetching ${url}...`);

    try {
      const html = await fetchUrl(url);

      // Extract JSON-LD product
      let pJson = null;
      const jsonMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      for (const m of jsonMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          if (parsed['@type'] === 'Product') {
            pJson = parsed;
            break;
          }
        } catch (e) {}
      }

      const slug = url.split('/').pop();
      let name = pJson?.name || slug.replace(/-/g, ' ').toUpperCase();
      let priceDT = parseFloat(pJson?.offers?.price || '39');
      if (isNaN(priceDT) || priceDT <= 0) priceDT = 39;
      const priceMillimes = Math.round(priceDT * 1000);
      let rawImageUrl = Array.isArray(pJson?.image) ? pJson.image[0] : pJson?.image;

      if (!rawImageUrl) {
        const imgMatch = html.match(/https:\/\/admin\.protein\.tn\/storage\/produits\/[^"'\s]+/);
        if (imgMatch) rawImageUrl = imgMatch[0];
      }

      let webpFilename = `${slug}.webp`;
      let localImagePath = path.join(uploadsDir, webpFilename);
      let apiImagePath = path.join(apiUploadsDir, webpFilename);

      if (rawImageUrl) {
        const tempExt = path.extname(rawImageUrl.split('?')[0]) || '.jpg';
        const tempPath = path.join(uploadsDir, `temp_${i}${tempExt}`);
        try {
          console.log(`  Downloading image: ${rawImageUrl}`);
          await downloadBinary(rawImageUrl, tempPath);
          execSync(
            `ffmpeg -i "${tempPath}" -vf "scale=800:800:force_original_aspect_ratio=decrease,pad=800:800:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 85 "${localImagePath}" -y`,
            { stdio: 'pipe' }
          );
          fs.copyFileSync(localImagePath, apiImagePath);
          fs.unlinkSync(tempPath);
          console.log(`  ✅ WebP converted: ${webpFilename}`);
        } catch (err) {
          console.error(`  ⚠️ Image error:`, err.message);
        }
      }

      let brand = 'Kong Sport Nutrition';
      if (name.includes("GOLD'S GYM") || name.includes("GOLD’S GYM")) brand = "Gold's Gym";
      else if (name.includes("UNIVERSAL NUTRITION")) brand = "Universal Nutrition";
      else if (name.includes("SPORT LIFE")) brand = "Sport Life";
      else if (name.includes("KONG")) brand = "Kong Sport Nutrition";

      let benefit = 'Accessoire de musculation & fitness haute durabilité';
      let usage = 'Idéal pour vos entraînements quotidiens, renforcement musculaire et hydratation.';
      let dosage = 'Usage régulier, entretien facile.';
      let composition = 'Matériaux certifiés haute résistance, coutures renforcées, sans BPA.';

      if (name.toLowerCase().includes('shaker')) {
        benefit = 'Mélange fluide sans grumeaux, fermeture étanche anti-fuite, plastique haute densité sans BPA.';
        usage = 'Verser eau ou lait, ajouter protéine/BCAA, secouer 15 secondes.';
      } else if (name.toLowerCase().includes('ceinture') || name.toLowerCase().includes('belt')) {
        benefit = 'Soutien lombaire et abdominal renforcé pour charges lourdes (Squat, Deadlift, Rowing).';
        usage = 'Serrer autour du tronc avant les séries de force maximale.';
      } else if (name.toLowerCase().includes('gant') || name.toLowerCase().includes('straps') || name.toLowerCase().includes('bande')) {
        benefit = 'Grip ultra-adhérent, protection des mains et stabilisation des poignets/genoux.';
        usage = 'Ajuster avec les velcros avant les exercices de tirage ou de poussée.';
      } else if (name.toLowerCase().includes('bouteille')) {
        benefit = 'Grande capacité d’hydratation, poignée ergonomique et graduation visible.';
        usage = 'Remplir avec votre boisson d’entraînement pour une hydratation optimale.';
      }

      // Tunisian SEO metadata
      const seoTitle = `${name} Prix Tunisie (${priceDT} DT) | Accessoires ParaTunisie`;
      const seoDescription = `Achetez ${name} en Tunisie au meilleur prix (${priceDT} DT). Matériel de sport et accessoires 100% authentiques chez ParaTunisie. Livraison express 24-48h à Tunis, Sousse, Sfax. Paiement à la livraison.`;
      const seoKeywords = `${name.toLowerCase()}, ${name.toLowerCase()} tunisie, accessoires musculation tunisie, shaker tunisie, gants sport tunisie, prix ${priceDT} dt, livraison tunisie`;
      const seoFaq = [
        {
          question: `Quel est le prix de ${name} en Tunisie ?`,
          answer: `${name} est disponible chez ParaTunisie au prix de ${priceDT} DT avec garantie d'authenticité et livraison à domicile.`
        },
        {
          question: `Le produit ${name} est-il disponible en stock ?`,
          answer: `Oui, ${name} est actuellement en stock prêt pour expédition immédiate partout en Tunisie.`
        },
        {
          question: `Quelles sont les modalités de paiement pour ${name} ?`,
          answer: `Vous pouvez régler votre commande en espèces à la livraison auprès du livreur ou par carte bancaire en ligne.`
        }
      ];

      results.push({
        id: `acc_${i + 1}`,
        name,
        slug,
        benefit,
        description: pJson?.description || `${name} est un équipement incontournable pour optimiser vos performances sportives et votre confort d'entraînement en Tunisie. Conçu avec des matériaux robustes et ergonomiques.`,
        usage,
        dosage,
        composition,
        brand,
        categorySlug: 'accessoires',
        categoryName: 'Accessoires & Shakers',
        priceMillimes,
        priceDT,
        stock: 50,
        image: `/uploads/products/${webpFilename}`,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoFaq,
      });

    } catch (e) {
      console.error(`Error processing ${url}:`, e.message);
    }
  }

  fs.writeFileSync('scripts/scraped_accessoires.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n🎉 Total scraped and normalized: ${results.length} accessoire products!`);
}

main().catch(console.error);
