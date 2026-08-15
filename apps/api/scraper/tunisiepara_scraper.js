const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://tunisiepara.com";
const CATALOG_URL = `${BASE_URL}/categorie-produit/marques/`;

const OUTPUT_DIR = path.join(__dirname, "tunisiepara_data");
const IMAGES_DIR = path.join(OUTPUT_DIR, "images");

const args = process.argv.slice(2);

function getArg(name, defaultValue = null) {
  const prefix = `--${name}=`;

  const item = args.find((arg) => arg.startsWith(prefix));

  if (!item) {
    return defaultValue;
  }

  return item.substring(prefix.length);
}

const MAX_PRODUCTS = getArg("max-products")
  ? parseInt(getArg("max-products"), 10)
  : null;

const DOWNLOAD_IMAGES = args.includes("--download-images");

const WORKERS = Math.min(
  Math.max(parseInt(getArg("workers", "3"), 10), 1),
  5
);

const MIN_DELAY = 700;
const MAX_DELAY = 1300;

const http = axios.create({
  timeout: 30000,

  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",

    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  },

  maxRedirects: 5,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return (
    MIN_DELAY +
    Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY))
  );
}

async function ensureFolders() {
  await fs.promises.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  if (DOWNLOAD_IMAGES) {
    await fs.promises.mkdir(IMAGES_DIR, {
      recursive: true,
    });
  }
}

function cleanText(text) {
  if (!text) {
    return null;
  }

  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  if (!text) {
    return "product";
  }

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

function unique(array) {
  return [...new Set(array)];
}

function absoluteUrl(url) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url, BASE_URL).toString();
  } catch {
    return null;
  }
}

async function request(url, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await sleep(randomDelay());

      return await http.get(url, options);
    } catch (error) {
      lastError = error;

      const status = error.response?.status;

      console.log(
        `Request failed ${status || ""} ${url} attempt ${attempt}/5`
      );

      if (
        status &&
        ![
          408,
          429,
          500,
          502,
          503,
          504,
        ].includes(status)
      ) {
        break;
      }

      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }

  throw lastError;
}

async function getHtml(url) {
  const response = await request(url, {
    responseType: "text",
  });

  return response.data;
}

/* -------------------------------------------------------
   PRICE
------------------------------------------------------- */

function parsePrice(price) {
  if (!price) {
    return null;
  }

  const cleaned = price
    .replace(/\s/g, "")
    .replace(",", ".");

  const value = parseFloat(cleaned);

  if (Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 1000);
}

function extractPrices(text) {
  if (!text) {
    return [];
  }

  const regex =
    /(\d+(?:[.,]\d{1,3})?)\s*(?:DT|D\.T|TND)/gi;

  const prices = [];

  let match;

  while ((match = regex.exec(text)) !== null) {
    const value = parsePrice(match[1]);

    if (value !== null) {
      prices.push(value);
    }
  }

  return prices;
}

/* -------------------------------------------------------
   JSON LD
------------------------------------------------------- */

function extractJsonLd($) {
  const products = [];

  function walk(value) {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(walk);

      return;
    }

    if (typeof value !== "object") {
      return;
    }

    let type = value["@type"];

    if (!Array.isArray(type)) {
      type = [type];
    }

    if (type.includes("Product")) {
      products.push(value);
    }

    Object.values(value).forEach(walk);
  }

  $("script[type='application/ld+json']").each(
    (_, element) => {
      try {
        const json = JSON.parse(
          $(element).html()
        );

        walk(json);
      } catch {}
    }
  );

  return products[0] || null;
}

/* -------------------------------------------------------
   DISCOVERY
------------------------------------------------------- */

function getProductLinks(html) {
  const $ = cheerio.load(html);

  const urls = [];

  $("a[href*='/shop/']").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const url = absoluteUrl(href);

    if (
      url &&
      url.includes("/shop/") &&
      url.includes("tunisiepara.com")
    ) {
      urls.push(
        url.split("#")[0].replace(/\/?$/, "/")
      );
    }
  });

  return unique(urls);
}

function detectLastPage(html) {
  const $ = cheerio.load(html);

  const pages = [];

  $(".page-numbers").each((_, element) => {
    const text = cleanText(
      $(element).text()
    );

    if (/^\d+$/.test(text || "")) {
      pages.push(parseInt(text, 10));
    }
  });

  $("a[href]").each((_, element) => {
    const href =
      $(element).attr("href") || "";

    const match =
      href.match(/\/page\/(\d+)\//);

    if (match) {
      pages.push(
        parseInt(match[1], 10)
      );
    }
  });

  if (!pages.length) {
    return 1;
  }

  return Math.max(...pages);
}

function catalogPage(page) {
  if (page === 1) {
    return CATALOG_URL;
  }

  return `${CATALOG_URL}page/${page}/`;
}

async function discoverProducts() {
  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    " TUNISIEPARA CATALOG DISCOVERY"
  );
  console.log(
    "======================================"
  );

  console.log(
    "Fetching first catalog page..."
  );

  const firstHtml =
    await getHtml(CATALOG_URL);

  const lastPage =
    detectLastPage(firstHtml);

  console.log(
    `Detected ${lastPage} catalog pages`
  );

  const urls = new Set(
    getProductLinks(firstHtml)
  );

  console.log(
    `Page 1: ${urls.size} unique products`
  );

  const checkpoint =
    path.join(
      OUTPUT_DIR,
      "product_urls.json"
    );

  for (
    let page = 2;
    page <= lastPage;
    page++
  ) {
    try {
      const html =
        await getHtml(
          catalogPage(page)
        );

      const links =
        getProductLinks(html);

      links.forEach((url) =>
        urls.add(url)
      );

      console.log(
        `Discovery ${page}/${lastPage} | products: ${urls.size}`
      );

      if (
        page % 10 === 0 ||
        page === lastPage
      ) {
        await fs.promises.writeFile(
          checkpoint,
          JSON.stringify(
            [...urls],
            null,
            2
          )
        );
      }
    } catch (error) {
      await saveError({
        stage: "discovery",
        page,
        url: catalogPage(page),
        error: error.message,
      });
    }
  }

  let result = [...urls];

  if (MAX_PRODUCTS) {
    result =
      result.slice(
        0,
        MAX_PRODUCTS
      );
  }

  await fs.promises.writeFile(
    checkpoint,
    JSON.stringify(
      result,
      null,
      2
    )
  );

  console.log("");
  console.log(
    `Discovery finished: ${result.length} unique products`
  );

  return result;
}

/* -------------------------------------------------------
   PRODUCT DATA
------------------------------------------------------- */

function extractTitle($, jsonLd) {
  let title =
    cleanText(
      $("h1.product_title")
        .first()
        .text()
    );

  if (!title) {
    title =
      cleanText(
        $("h1").first().text()
      );
  }

  if (
    !title &&
    jsonLd?.name
  ) {
    title =
      cleanText(jsonLd.name);
  }

  return title;
}

function extractSku($, jsonLd) {
  let sku =
    cleanText(
      $(".sku").first().text()
    );

  if (sku) {
    return sku;
  }

  if (jsonLd?.sku) {
    return cleanText(
      String(jsonLd.sku)
    );
  }

  const meta =
    cleanText(
      $(".product_meta").text()
    ) || "";

  const match =
    meta.match(
      /(?:UGS|SKU)\s*:\s*([^\s,]+)/i
    );

  return match
    ? match[1]
    : null;
}

function extractProductPrices(
  $,
  jsonLd
) {
  const priceText =
    $(".summary .price")
      .first()
      .text() ||
    $("p.price")
      .first()
      .text();

  const prices =
    extractPrices(priceText);

  const result = {
    currency: "TND",

    regularPriceMillimes:
      null,

    salePriceMillimes:
      null,

    currentPriceMillimes:
      null,
  };

  if (prices.length >= 2) {
    result.regularPriceMillimes =
      prices[0];

    result.salePriceMillimes =
      prices[
        prices.length - 1
      ];

    result.currentPriceMillimes =
      prices[
        prices.length - 1
      ];
  } else if (
    prices.length === 1
  ) {
    result.currentPriceMillimes =
      prices[0];
  }

  if (
    result.currentPriceMillimes ===
      null &&
    jsonLd?.offers
  ) {
    let offers =
      jsonLd.offers;

    if (
      Array.isArray(offers)
    ) {
      offers =
        offers[0];
    }

    if (offers?.price) {
      const value =
        Number(
          String(
            offers.price
          ).replace(",", ".")
        );

      if (
        !Number.isNaN(value)
      ) {
        result.currentPriceMillimes =
          Math.round(
            value * 1000
          );
      }
    }

    if (
      offers?.priceCurrency
    ) {
      result.currency =
        offers.priceCurrency;
    }
  }

  return result;
}

/* -------------------------------------------------------
   CATEGORIES
------------------------------------------------------- */

function extractCategories($) {
  const categories = [];

  $(
    ".product_meta .posted_in a[href]"
  ).each((_, element) => {
    const name =
      cleanText(
        $(element).text()
      );

    const url =
      absoluteUrl(
        $(element).attr("href")
      );

    if (
      name &&
      url
    ) {
      categories.push({
        name,
        url,
        slug:
          slugFromUrl(url),
      });
    }
  });

  return uniqueObjects(
    categories,
    (x) => x.url
  );
}

function slugFromUrl(url) {
  try {
    const parsed =
      new URL(url);

    const parts =
      parsed.pathname
        .replace(/\/$/, "")
        .split("/");

    return decodeURIComponent(
      parts[
        parts.length - 1
      ]
    );
  } catch {
    return null;
  }
}

function categoryHierarchy(
  category
) {
  try {
    const parsed =
      new URL(
        category.url
      );

    const parts =
      parsed.pathname
        .replace(
          /^\/|\/$/g,
          ""
        )
        .split("/");

    const index =
      parts.indexOf(
        "categorie-produit"
      );

    if (index === -1) {
      return [];
    }

    const segments =
      parts.slice(
        index + 1
      );

    const result = [];

    let current =
      `${BASE_URL}/categorie-produit/`;

    let parent = null;

    for (
      const segment
      of segments
    ) {
      current +=
        `${segment}/`;

      result.push({
        slug: segment,

        url: current,

        parentSlug:
          parent,
      });

      parent =
        segment;
    }

    if (
      result.length
    ) {
      result[
        result.length - 1
      ].name =
        category.name;
    }

    return result;
  } catch {
    return [];
  }
}

/* -------------------------------------------------------
   BRANDS
------------------------------------------------------- */

function extractBrands(
  $,
  jsonLd
) {
  const brands = [];

  $(
    "a[href*='/para-marques/']"
  ).each((_, element) => {
    const name =
      cleanText(
        $(element).text()
      );

    const url =
      absoluteUrl(
        $(element)
          .attr("href")
      );

    if (name) {
      brands.push({
        name,
        url,
      });
    }
  });

  if (
    typeof jsonLd?.brand ===
    "string"
  ) {
    brands.push({
      name:
        cleanText(
          jsonLd.brand
        ),

      url: null,
    });
  }

  if (
    jsonLd?.brand?.name
  ) {
    brands.push({
      name:
        cleanText(
          jsonLd.brand.name
        ),

      url: null,
    });
  }

  return uniqueObjects(
    brands.filter(
      (b) => b.name
    ),
    (b) =>
      `${b.name}|${b.url || ""}`
  );
}

/* -------------------------------------------------------
   IMAGES
------------------------------------------------------- */

function extractImages(
  $,
  jsonLd
) {
  const images = [];

  function add(url) {
    const absolute =
      absoluteUrl(url);

    if (!absolute) {
      return;
    }

    images.push(
      absolute
    );
  }

  if (jsonLd?.image) {
    if (
      typeof jsonLd.image ===
      "string"
    ) {
      add(jsonLd.image);
    }

    if (
      Array.isArray(
        jsonLd.image
      )
    ) {
      for (
        const image
        of jsonLd.image
      ) {
        if (
          typeof image ===
          "string"
        ) {
          add(image);
        } else if (
          image?.url
        ) {
          add(image.url);
        }
      }
    }
  }

  $(
    ".woocommerce-product-gallery__image a[href]"
  ).each((_, element) => {
    add(
      $(element)
        .attr("href")
    );
  });

  $(
    ".woocommerce-product-gallery img"
  ).each((_, element) => {
    const attributes = [
      "data-large_image",
      "data-src",
      "src",
    ];

    for (
      const attribute
      of attributes
    ) {
      const value =
        $(element)
          .attr(attribute);

      if (value) {
        add(value);
      }
    }

    const srcset =
      $(element)
        .attr("srcset");

    if (srcset) {
      const candidates =
        srcset
          .split(",")
          .map((item) => {
            const parts =
              item
                .trim()
                .split(/\s+/);

            return {
              url:
                parts[0],

              width:
                parseInt(
                  parts[1],
                  10
                ) || 0,
            };
          })
          .sort(
            (a, b) =>
              b.width -
              a.width
          );

      if (
        candidates[0]
      ) {
        add(
          candidates[0]
            .url
        );
      }
    }
  });

  const ogImage =
    $(
      "meta[property='og:image']"
    ).attr("content");

  if (ogImage) {
    add(ogImage);
  }

  return unique(images).map(
    (url) => ({
      sourceUrl: url,
      localPath: null,
      sha256: null,
    })
  );
}

/* -------------------------------------------------------
   DESCRIPTION
------------------------------------------------------- */

function extractDescription($) {
  let text =
    $(
      "#tab-description"
    )
      .first()
      .text();

  if (!text) {
    text =
      $(
        ".woocommerce-Tabs-panel--description"
      )
        .first()
        .text();
  }

  return cleanText(text);
}

function extractShortDescription(
  $
) {
  return cleanText(
    $(
      ".woocommerce-product-details__short-description"
    ).text()
  );
}

/* -------------------------------------------------------
   ATTRIBUTES
------------------------------------------------------- */

function extractAttributes($) {
  const attributes = {};

  $(
    "table.woocommerce-product-attributes tr"
  ).each((_, row) => {
    const key =
      cleanText(
        $(row)
          .find(
            ".woocommerce-product-attributes-item__label"
          )
          .text()
      );

    const value =
      cleanText(
        $(row)
          .find(
            ".woocommerce-product-attributes-item__value"
          )
          .text()
      );

    if (
      key &&
      value
    ) {
      attributes[key] =
        value;
    }
  });

  return attributes;
}

/* -------------------------------------------------------
   STOCK
------------------------------------------------------- */

function extractStock(
  $,
  jsonLd
) {
  const text =
    cleanText(
      $("p.stock")
        .first()
        .text()
    );

  if (text) {
    const lower =
      text.toLowerCase();

    if (
      lower.includes(
        "rupture"
      )
    ) {
      return "OUT_OF_STOCK";
    }

    if (
      lower.includes(
        "stock"
      )
    ) {
      return "IN_STOCK";
    }
  }

  let offers =
    jsonLd?.offers;

  if (
    Array.isArray(offers)
  ) {
    offers =
      offers[0];
  }

  const availability =
    String(
      offers?.availability ||
        ""
    ).toLowerCase();

  if (
    availability.includes(
      "instock"
    )
  ) {
    return "IN_STOCK";
  }

  if (
    availability.includes(
      "outofstock"
    )
  ) {
    return "OUT_OF_STOCK";
  }

  return null;
}

/* -------------------------------------------------------
   RATING
------------------------------------------------------- */

function extractRating(
  $,
  jsonLd
) {
  const aggregate =
    jsonLd?.aggregateRating;

  if (aggregate) {
    return {
      rating:
        aggregate.ratingValue
          ? Number(
              aggregate.ratingValue
            )
          : null,

      reviewCount:
        aggregate.reviewCount
          ? Number(
              aggregate.reviewCount
            )
          : aggregate.ratingCount
          ? Number(
              aggregate.ratingCount
            )
          : null,
    };
  }

  return {
    rating: null,
    reviewCount: null,
  };
}

/* -------------------------------------------------------
   IMAGE DOWNLOAD
------------------------------------------------------- */

async function downloadImage(
  image,
  productTitle
) {
  try {
    const response =
      await request(
        image.sourceUrl,
        {
          responseType:
            "arraybuffer",
        }
      );

    const buffer =
      Buffer.from(
        response.data
      );

    if (!buffer.length) {
      return;
    }

    const sha =
      crypto
        .createHash(
          "sha256"
        )
        .update(buffer)
        .digest("hex");

    const contentType =
      String(
        response.headers[
          "content-type"
        ] || ""
      )
        .split(";")[0]
        .toLowerCase();

    const extensions = {
      "image/jpeg":
        ".jpg",

      "image/png":
        ".png",

      "image/webp":
        ".webp",

      "image/avif":
        ".avif",
    };

    const extension =
      extensions[
        contentType
      ] || ".jpg";

    const filename =
      `${slugify(
        productTitle
      )}-${sha.substring(
        0,
        12
      )}${extension}`;

    const target =
      path.join(
        IMAGES_DIR,
        filename
      );

    if (
      !fs.existsSync(
        target
      )
    ) {
      await fs.promises.writeFile(
        target,
        buffer
      );
    }

    image.localPath =
      `images/${filename}`;

    image.sha256 =
      sha;
  } catch (error) {
    console.log(
      `Image failed: ${image.sourceUrl}`
    );
  }
}

/* -------------------------------------------------------
   PRODUCT SCRAPER
------------------------------------------------------- */

async function scrapeProduct(
  url
) {
  const html =
    await getHtml(url);

  const $ =
    cheerio.load(html);

  const jsonLd =
    extractJsonLd($);

  const title =
    extractTitle(
      $,
      jsonLd
    );

  const categories =
    extractCategories($);

  const hierarchy =
    categories.flatMap(
      categoryHierarchy
    );

  const images =
    extractImages(
      $,
      jsonLd
    );

  if (
    DOWNLOAD_IMAGES
  ) {
    for (
      const image
      of images
    ) {
      await downloadImage(
        image,
        title
      );
    }
  }

  const rating =
    extractRating(
      $,
      jsonLd
    );

  return {
    source: {
      provider:
        "tunisiepara",

      url,

      slug:
        slugFromUrl(url),

      scrapedAt:
        new Date()
          .toISOString(),
    },

    title,

    sku:
      extractSku(
        $,
        jsonLd
      ),

    prices:
      extractProductPrices(
        $,
        jsonLd
      ),

    stock:
      extractStock(
        $,
        jsonLd
      ),

    brands:
      extractBrands(
        $,
        jsonLd
      ),

    categories,

    categoryHierarchy:
      uniqueObjects(
        hierarchy,
        (item) =>
          item.url
      ),

    images,

    shortDescription:
      extractShortDescription(
        $
      ),

    description:
      extractDescription(
        $
      ),

    attributes:
      extractAttributes(
        $
      ),

    rating:
      rating.rating,

    reviewCount:
      rating.reviewCount,
  };
}

/* -------------------------------------------------------
   JSONL CHECKPOINT
------------------------------------------------------- */

async function loadCompleted() {
  const file =
    path.join(
      OUTPUT_DIR,
      "products.jsonl"
    );

  const completed =
    new Set();

  const products = [];

  if (
    !fs.existsSync(file)
  ) {
    return {
      completed,
      products,
    };
  }

  const content =
    await fs.promises.readFile(
      file,
      "utf8"
    );

  for (
    const line
    of content.split(
      /\r?\n/
    )
  ) {
    if (!line.trim()) {
      continue;
    }

    try {
      const product =
        JSON.parse(line);

      products.push(
        product
      );

      if (
        product.source?.url
      ) {
        completed.add(
          product.source.url
        );
      }
    } catch {}
  }

  return {
    completed,
    products,
  };
}

async function saveProduct(
  product
) {
  const file =
    path.join(
      OUTPUT_DIR,
      "products.jsonl"
    );

  await fs.promises.appendFile(
    file,

    JSON.stringify(
      product
    ) + "\n"
  );
}

async function saveError(
  error
) {
  const file =
    path.join(
      OUTPUT_DIR,
      "errors.jsonl"
    );

  await fs.promises.appendFile(
    file,

    JSON.stringify({
      ...error,

      timestamp:
        new Date()
          .toISOString(),
    }) + "\n"
  );
}

/* -------------------------------------------------------
   WORKER POOL
------------------------------------------------------- */

async function processProducts(
  urls
) {
  const {
    completed,
  } =
    await loadCompleted();

  const todo =
    urls.filter(
      (url) =>
        !completed.has(url)
    );

  console.log("");
  console.log(
    `Total products: ${urls.length}`
  );

  console.log(
    `Already completed: ${completed.size}`
  );

  console.log(
    `Remaining: ${todo.length}`
  );

  let index = 0;

  let processed =
    completed.size;

  async function worker(
    workerId
  ) {
    while (true) {
      const current =
        index++;

      if (
        current >=
        todo.length
      ) {
        return;
      }

      const url =
        todo[current];

      console.log(
        `[Worker ${workerId}] ${processed + 1}/${urls.length} ${url}`
      );

      try {
        const product =
          await scrapeProduct(
            url
          );

        await saveProduct(
          product
        );

        processed++;

        console.log(
          `✓ ${product.title}`
        );
      } catch (error) {
        console.log(
          `✗ ${url}`
        );

        console.log(
          error.message
        );

        await saveError({
          stage:
            "product",

          url,

          error:
            error.message,
        });
      }
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          WORKERS,
      },

      (_, i) =>
        worker(i + 1)
    )
  );
}

/* -------------------------------------------------------
   UTILS
------------------------------------------------------- */

function uniqueObjects(
  items,
  keyFn
) {
  const seen =
    new Set();

  const output = [];

  for (
    const item
    of items
  ) {
    const key =
      keyFn(item);

    if (
      !seen.has(key)
    ) {
      seen.add(key);

      output.push(
        item
      );
    }
  }

  return output;
}

/* -------------------------------------------------------
   FINAL JSON
------------------------------------------------------- */

async function finalize() {
  const {
    products,
  } =
    await loadCompleted();

  const productMap =
    new Map();

  for (
    const product
    of products
  ) {
    if (
      product.source?.url
    ) {
      productMap.set(
        product.source.url,
        product
      );
    }
  }

  const finalProducts =
    [...productMap.values()];

  const brands =
    new Map();

  const categories =
    new Map();

  for (
    const product
    of finalProducts
  ) {
    for (
      const brand
      of product.brands || []
    ) {
      const key =
        brand.url ||
        brand.name
          .toLowerCase();

      brands.set(
        key,
        brand
      );
    }

    for (
      const category
      of product.categories ||
      []
    ) {
      categories.set(
        category.url,
        {
          ...category,

          parentUrl:
            null,
        }
      );
    }

    for (
      const category
      of product.categoryHierarchy ||
      []
    ) {
      if (
        !categories.has(
          category.url
        )
      ) {
        categories.set(
          category.url,
          {
            name:
              category.name ||
              category.slug
                .replace(
                  /-/g,
                  " "
                ),

            slug:
              category.slug,

            url:
              category.url,

            parentUrl:
              null,
          }
        );
      }
    }
  }

  /* Resolve category parent */

  for (
    const [
      url,
      category,
    ]
    of categories
  ) {
    try {
      const parsed =
        new URL(url);

      const parts =
        parsed.pathname
          .replace(
            /^\/|\/$/g,
            ""
          )
          .split("/");

      const index =
        parts.indexOf(
          "categorie-produit"
        );

      const segments =
        parts.slice(
          index + 1
        );

      if (
        segments.length >
        1
      ) {
        const parent =
          `${BASE_URL}/categorie-produit/` +
          segments
            .slice(0, -1)
            .join("/") +
          "/";

        if (
          categories.has(
            parent
          )
        ) {
          category.parentUrl =
            parent;
        }
      }
    } catch {}
  }

  const finalBrands =
    [...brands.values()];

  const finalCategories =
    [...categories.values()];

  const metadata = {
    source:
      BASE_URL,

    generatedAt:
      new Date()
        .toISOString(),

    counts: {
      products:
        finalProducts.length,

      brands:
        finalBrands.length,

      categories:
        finalCategories.length,

      productsWithImages:
        finalProducts.filter(
          (product) =>
            product.images
              ?.length
        ).length,

      productsWithBrand:
        finalProducts.filter(
          (product) =>
            product.brands
              ?.length
        ).length,

      productsWithCategory:
        finalProducts.filter(
          (product) =>
            product.categories
              ?.length
        ).length,

      productsWithPrice:
        finalProducts.filter(
          (product) =>
            product.prices
              ?.currentPriceMillimes !==
            null
        ).length,

      productsInStock:
        finalProducts.filter(
          (product) =>
            product.stock ===
            "IN_STOCK"
        ).length,

      productsOutOfStock:
        finalProducts.filter(
          (product) =>
            product.stock ===
            "OUT_OF_STOCK"
        ).length,
    },
  };

  await fs.promises.writeFile(
    path.join(
      OUTPUT_DIR,
      "products.json"
    ),

    JSON.stringify(
      finalProducts,
      null,
      2
    )
  );

  await fs.promises.writeFile(
    path.join(
      OUTPUT_DIR,
      "brands.json"
    ),

    JSON.stringify(
      finalBrands,
      null,
      2
    )
  );

  await fs.promises.writeFile(
    path.join(
      OUTPUT_DIR,
      "categories.json"
    ),

    JSON.stringify(
      finalCategories,
      null,
      2
    )
  );

  const catalog = {
    metadata,

    brands:
      finalBrands,

    categories:
      finalCategories,

    products:
      finalProducts,
  };

  await fs.promises.writeFile(
    path.join(
      OUTPUT_DIR,
      "catalog.json"
    ),

    JSON.stringify(
      catalog,
      null,
      2
    )
  );

  console.log("");
  console.log(
    "======================================"
  );

  console.log(
    " SCRAPING COMPLETE"
  );

  console.log(
    "======================================"
  );

  console.log(
    JSON.stringify(
      metadata,
      null,
      2
    )
  );

  console.log("");
  console.log(
    "Final file:"
  );

  console.log(
    path.join(
      OUTPUT_DIR,
      "catalog.json"
    )
  );
}

/* -------------------------------------------------------
   MAIN
------------------------------------------------------- */

async function main() {
  await ensureFolders();

  console.log("");
  console.log(
    "TunisiePara Scraper"
  );

  console.log(
    `Download images: ${DOWNLOAD_IMAGES}`
  );

  console.log(
    `Workers: ${WORKERS}`
  );

  if (
    MAX_PRODUCTS
  ) {
    console.log(
      `TEST MODE: ${MAX_PRODUCTS} products`
    );
  } else {
    console.log(
      "FULL CATALOG MODE"
    );
  }

  const urlsFile =
    path.join(
      OUTPUT_DIR,
      "product_urls.json"
    );

  let urls;

  if (
    fs.existsSync(
      urlsFile
    )
  ) {
    urls =
      JSON.parse(
        await fs.promises.readFile(
          urlsFile,
          "utf8"
        )
      );

    if (
      MAX_PRODUCTS
    ) {
      urls =
        urls.slice(
          0,
          MAX_PRODUCTS
        );
    }

    console.log(
      `Using ${urls.length} previously discovered URLs`
    );
  } else {
    urls =
      await discoverProducts();
  }

  await processProducts(
    urls
  );

  await finalize();
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "FATAL ERROR"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);