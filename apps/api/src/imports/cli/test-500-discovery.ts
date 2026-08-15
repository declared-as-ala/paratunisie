import { TunisieParaProvider } from "../provider/tunisiepara.provider";

async function test500Discovery() {
  console.log("Testing TunisiePara catalog discovery with limit 500...");
  const provider = new TunisieParaProvider();
  const startTime = Date.now();

  const products = await provider.discoverProducts({ limit: 500 });
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("=================================================");
  console.log(` DISCOVERY COMPLETED IN ${durationSec} SECONDS `);
  console.log(` Discovered Products Count: ${products.length}`);
  console.log(" First product:", products[0]?.sourceTitle);
  console.log(" Last product:", products[products.length - 1]?.sourceTitle);
  console.log("=================================================");
}

void test500Discovery();
