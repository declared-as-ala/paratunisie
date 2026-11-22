"use strict";
// Read-only Search Console queries. Never prints credentials.
// usage: node gsc-query.cjs <key.json> perf <dimension|none> [days] | sitemaps | inspect <url>
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const [keyPath, cmd, arg1, arg2] = process.argv.slice(2);
const SITE = "sc-domain:paratunisie.com";
const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

function call(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(url, { method, headers, timeout: 30000 }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, json: d ? JSON.parse(d) : {} }));
    });
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const u = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: key.client_email, scope: process.env.GSC_WRITE === "1" ? "https://www.googleapis.com/auth/webmasters" : "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3000 });
  const jwt = u + "." + crypto.createSign("RSA-SHA256").update(u).sign(key.private_key, "base64url");
  const r = await call("POST", "https://oauth2.googleapis.com/token", { "Content-Type": "application/x-www-form-urlencoded" }, "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + jwt);
  if (r.status !== 200) throw new Error("token HTTP " + r.status);
  return r.json.access_token;
}
const iso = (d) => d.toISOString().slice(0, 10);

(async () => {
  const t = await token();
  const auth = { Authorization: "Bearer " + t, "Content-Type": "application/json" };
  if (cmd === "perf") {
    const days = Number(arg2) || 90;
    const end = new Date(Date.now() - 2 * 864e5), start = new Date(end.getTime() - days * 864e5);
    const body = { startDate: iso(start), endDate: iso(end), rowLimit: Number(process.env.ROWS||15), ...(process.env.START ? { startDate: process.env.START } : {}), ...(process.env.END ? { endDate: process.env.END } : {}) };
    if (arg1 && arg1 !== "none") { body.dimensions = arg1.split(","); }
    const r = await call("POST", `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, auth, JSON.stringify(body));
    console.log("HTTP", r.status, `range ${body.startDate}..${body.endDate}`);
    if (r.status !== 200) return console.log(JSON.stringify(r.json.error || r.json).slice(0, 300));
    for (const row of r.json.rows || []) console.log(JSON.stringify({ k: row.keys, clicks: row.clicks, impressions: row.impressions, ctr: +(row.ctr * 100).toFixed(2), pos: +row.position.toFixed(1) }));
    if (!(r.json.rows || []).length) console.log("no rows");
  } else if (cmd === "sitemaps") {
    const r = await call("GET", `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`, auth);
    console.log("HTTP", r.status);
    for (const s of r.json.sitemap || []) console.log(JSON.stringify({ path: s.path, lastSubmitted: s.lastSubmitted, lastDownloaded: s.lastDownloaded, errors: s.errors, warnings: s.warnings, contents: s.contents }));
    if (!(r.json.sitemap || []).length) console.log(JSON.stringify(r.json).slice(0, 300));
  } else if (cmd === "submit-sitemap") {
    // Write action: requires GSC_WRITE=1. Resubmits an existing sitemap of this property only.
    if (process.env.GSC_WRITE !== "1") return console.log("refused: set GSC_WRITE=1 to submit");
    const r = await call("PUT", `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(arg1)}`, { Authorization: auth.Authorization });
    console.log("submit HTTP", r.status, JSON.stringify(r.json).slice(0, 200));
  } else if (cmd === "inspect") {
    const r = await call("POST", "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", auth, JSON.stringify({ inspectionUrl: arg1, siteUrl: SITE, languageCode: "fr" }));
    console.log("HTTP", r.status);
    const s = r.json.inspectionResult && r.json.inspectionResult.indexStatusResult;
    console.log(s ? JSON.stringify({ verdict: s.verdict, coverage: s.coverageState, robots: s.robotsTxtState, indexing: s.indexingState, lastCrawl: s.lastCrawlTime, googleCanonical: s.googleCanonical, userCanonical: s.userCanonical }) : JSON.stringify(r.json).slice(0, 300));
  }
})().catch((e) => console.log("failed:", e.message));
