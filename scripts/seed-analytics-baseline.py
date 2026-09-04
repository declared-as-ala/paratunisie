import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

print("Connected to VPS! Writing seed script...")

node_script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding realistic analytics history...");
  
  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true, brandId: true, categoryId: true }, take: 25 });
  const orders = await prisma.order.findMany({ select: { id: true, createdAt: true, totalMillimes: true } });

  const countries = [
    { name: "Tunisie", code: "TN", cities: ["Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul", "Ariana"], weight: 0.85 },
    { name: "France", code: "FR", cities: ["Paris", "Lyon", "Marseille"], weight: 0.08 },
    { name: "Algérie", code: "DZ", cities: ["Alger", "Oran"], weight: 0.04 },
    { name: "Allemagne", code: "DE", cities: ["Berlin", "Munich"], weight: 0.02 },
    { name: "Canada", code: "CA", cities: ["Montréal"], weight: 0.01 },
  ];

  const channels = [
    { channel: "organic_search", utmSource: "google", utmMedium: "organic", weight: 0.40 },
    { channel: "social_instagram", utmSource: "instagram", utmMedium: "social", utmCampaign: "promo_rentree", weight: 0.25 },
    { channel: "direct", weight: 0.15 },
    { channel: "paid_search", utmSource: "google", utmMedium: "cpc", utmCampaign: "creatine_tunisie", weight: 0.10 },
    { channel: "social_facebook", utmSource: "facebook", utmMedium: "cpc", utmCampaign: "whey_anabolic", weight: 0.07 },
    { channel: "social_tiktok", utmSource: "tiktok", utmMedium: "organic", weight: 0.03 },
  ];

  const searchKeywords = [
    { kw: "creatine", results: 5 },
    { kw: "creatine monohydrate", results: 4 },
    { kw: "whey proteine", results: 12 },
    { kw: "anabolic whey", results: 2 },
    { kw: "ashwagandha", results: 2 },
    { kw: "vitamine c", results: 3 },
    { kw: "zinc", results: 2 },
    { kw: "gainer", results: 6 },
    { kw: "pre workout", results: 4 },
    { kw: "bcaa", results: 4 },
    { kw: "l-carnitine", results: 2 },
    { kw: "collagene marin", results: 0 },
    { kw: "omega 3 triple force", results: 0 },
    { kw: "glutamine pure", results: 0 },
  ];

  const now = new Date();

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const sessionsPerDay = Math.floor(40 + Math.random() * 45);

    for (let s = 0; s < sessionsPerDay; s++) {
      const vid = 'v_seed_' + Math.random().toString(36).substring(2, 12);
      const sid = 's_seed_' + Math.random().toString(36).substring(2, 12);

      const countryRoll = Math.random();
      let selectedCountry = countries[0];
      let acc = 0;
      for (const c of countries) {
        acc += c.weight;
        if (countryRoll <= acc) { selectedCountry = c; break; }
      }

      const chanRoll = Math.random();
      let selectedChan = channels[0];
      let accChan = 0;
      for (const ch of channels) {
        accChan += ch.weight;
        if (chanRoll <= accChan) { selectedChan = ch; break; }
      }

      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const sessionTime = new Date(dayDate);
      sessionTime.setHours(hour, minute, 0, 0);

      const deviceType = Math.random() < 0.72 ? "mobile" : (Math.random() < 0.92 ? "desktop" : "tablet");
      const browser = Math.random() < 0.65 ? "Chrome" : (Math.random() < 0.85 ? "Safari" : (Math.random() < 0.95 ? "Firefox" : "Edge"));
      const os = deviceType === "mobile" ? (browser === "Safari" ? "iOS" : "Android") : "Windows";

      const pageViewsCount = Math.floor(1 + Math.random() * 5);
      const isBounce = pageViewsCount === 1;
      const durationSeconds = isBounce ? Math.floor(5 + Math.random() * 15) : pageViewsCount * Math.floor(25 + Math.random() * 40);

      const session = await prisma.analyticsSession.create({
        data: {
          visitorId: vid,
          sessionToken: sid,
          startedAt: sessionTime,
          lastActiveAt: new Date(sessionTime.getTime() + durationSeconds * 1000),
          durationSeconds,
          pageViewsCount,
          isBounce,
          isNewVisitor: Math.random() > 0.35,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          city: selectedCountry.cities[Math.floor(Math.random() * selectedCountry.cities.length)],
          deviceType,
          browser,
          os,
          channel: selectedChan.channel,
          utmSource: selectedChan.utmSource || null,
          utmMedium: selectedChan.utmMedium || null,
          utmCampaign: selectedChan.utmCampaign || null,
        }
      });

      await prisma.analyticsEvent.create({
        data: {
          sessionId: session.id,
          visitorId: vid,
          eventType: "PAGE_VIEW",
          pageUrl: "https://paratunisie.com/",
          pagePath: "/",
          pageType: "home",
          pageTitle: "ParaTunisie | Parapharmacie en Ligne",
          timeOnPageSeconds: Math.floor(15 + Math.random() * 30),
          createdAt: sessionTime,
        }
      });

      if (Math.random() < 0.75 && products.length > 0) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const prodTime = new Date(sessionTime.getTime() + 15000);
        await prisma.analyticsEvent.create({
          data: {
            sessionId: session.id,
            visitorId: vid,
            eventType: "PRODUCT_VIEW",
            pageUrl: `https://paratunisie.com/produits/${prod.slug}`,
            pagePath: `/produits/${prod.slug}`,
            pageType: "product",
            pageTitle: prod.name,
            productId: prod.id,
            categoryId: prod.categoryId,
            brandId: prod.brandId,
            timeOnPageSeconds: Math.floor(30 + Math.random() * 60),
            createdAt: prodTime,
          }
        });

        if (Math.random() < 0.30) {
          const cartTime = new Date(prodTime.getTime() + 20000);
          await prisma.analyticsEvent.create({
            data: {
              sessionId: session.id,
              visitorId: vid,
              eventType: "ADD_TO_CART",
              pageUrl: `https://paratunisie.com/produits/${prod.slug}`,
              pagePath: `/produits/${prod.slug}`,
              pageType: "product",
              pageTitle: prod.name,
              productId: prod.id,
              quantity: 1,
              createdAt: cartTime,
            }
          });

          if (Math.random() < 0.60) {
            await prisma.analyticsEvent.create({
              data: {
                sessionId: session.id,
                visitorId: vid,
                eventType: "BEGIN_CHECKOUT",
                pageUrl: "https://paratunisie.com/checkout",
                pagePath: "/checkout",
                pageType: "checkout",
                pageTitle: "Commande | ParaTunisie",
                createdAt: new Date(cartTime.getTime() + 10000),
              }
            });
          }
        }
      }

      if (Math.random() < 0.25) {
        const searchItem = searchKeywords[Math.floor(Math.random() * searchKeywords.length)];
        await prisma.analyticsEvent.create({
          data: {
            sessionId: session.id,
            visitorId: vid,
            eventType: "SEARCH",
            pageUrl: `https://paratunisie.com/shop?q=${encodeURIComponent(searchItem.kw)}`,
            pagePath: "/shop",
            pageType: "search",
            searchKeyword: searchItem.kw,
            searchResultsCount: searchItem.results,
            createdAt: sessionTime,
          }
        });
      }
    }
  }

  console.log("✅ Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
"""

cmd1 = f"cat << 'EOF' > /tmp/seed_analytics.js\n{node_script}\nEOF\n"
stdin, stdout, stderr = client.exec_command(cmd1)
stdout.read()

cmd2 = "docker cp /tmp/seed_analytics.js paratunisie-api:/app/seed_analytics.js"
stdin, stdout, stderr = client.exec_command(cmd2)
stdout.read()

print("Running seed script inside paratunisie-api...")
stdin, stdout, stderr = client.exec_command("docker exec paratunisie-api node seed_analytics.js")
for line in iter(stdout.readline, ""):
    print(line, end="")
print("STDERR:", stderr.read().decode("utf-8"))

client.close()
