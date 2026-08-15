import { PrismaClient } from "@prisma/client";

const urls = [
  "postgresql://paratunisie:paratunisie_dev_password@127.0.0.1:5432/paratunisie?schema=public",
  "postgresql://postgres:postgres@127.0.0.1:5432/paratunisie?schema=public",
  "postgresql://postgres:admin@127.0.0.1:5432/paratunisie?schema=public",
  "postgresql://postgres:123456@127.0.0.1:5432/paratunisie?schema=public",
  "postgresql://postgres:root@127.0.0.1:5432/paratunisie?schema=public",
  "postgresql://paratunisie:paratunisie_dev_password@127.0.0.1:5433/paratunisie?schema=public",
  "postgresql://postgres:postgres@127.0.0.1:5433/paratunisie?schema=public"
];

async function check() {
  for (const url of urls) {
    console.log(`Testing URL: ${url}`);
    const client = new PrismaClient({ datasources: { db: { url } } });
    try {
      await client.$connect();
      const count = await client.category.count();
      console.log(`>>> SUCCESS! DB Connected! Category count: ${count}`);
      await client.$disconnect();
      return url;
    } catch (e: any) {
      console.log(`Failed: ${e.message.split('\n')[0]}`);
      try { await client.$disconnect(); } catch {}
    }
  }
}

check();
