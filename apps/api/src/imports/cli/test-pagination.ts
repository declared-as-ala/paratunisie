import * as cheerio from "cheerio";

async function testPagination() {
  console.log("Testing TunisiePara catalog pagination...");
  const res = await fetch("https://tunisiepara.com/boutique/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("Pagination links found:");
  $("a.page-numbers, .pagination a, nav.woocommerce-pagination a, .next, a[href*='/page/'], a[href*='paged=']").each((_, el) => {
    console.log(`- Text: "${$(el).text().trim()}" | Class: "${$(el).attr("class")}" | Href: "${$(el).attr("href")}"`);
  });

  console.log("\nTesting direct fetch of page 2...");
  const page2Res = await fetch("https://tunisiepara.com/boutique/page/2/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  console.log(`Page 2 Status: ${page2Res.status}`);
  const page2Html = await page2Res.text();
  const $2 = cheerio.load(page2Html);
  const p2Items = $2(".product, article.product, li.product, div.product-small");
  console.log(`Page 2 Products Found: ${p2Items.length}`);
}

void testPagination();
