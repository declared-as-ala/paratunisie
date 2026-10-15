const SITE_URL = "https://paratunisie.com";
const INDEXNOW_KEY = "c89b7399b13f4ab5a7c2c4af0c6792f7";

/**
 * Pings IndexNow (Bing, Yandex) that URLs changed. Best-effort — failures are
 * swallowed since this is a discovery hint, not something anything depends on.
 * Key file lives at public/c89b7399b13f4ab5a7c2c4af0c6792f7.txt, matching
 * what IndexNow's protocol requires for key verification.
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.map((path) => (path.startsWith("http") ? path : `${SITE_URL}${path}`)),
      }),
    });
  } catch {
    // Discovery hint only — never block or fail a publish on this.
  }
}
