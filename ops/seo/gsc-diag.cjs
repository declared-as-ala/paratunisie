"use strict";
// Diagnostic only: exchange the service-account key for a token and list visible Search Console properties.
// Never prints the key or the token.
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");

const keyPath = process.argv[2];
const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({
  iss: key.client_email,
  scope: "https://www.googleapis.com/auth/webmasters.readonly",
  aud: "https://oauth2.googleapis.com/token",
  iat: now,
  exp: now + 3000,
});
const jwt = unsigned + "." + crypto.createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");

function req(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(url, { method, headers, timeout: 15000 }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  const form = "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + jwt;
  const tok = await req("POST", "https://oauth2.googleapis.com/token", { "Content-Type": "application/x-www-form-urlencoded" }, form);
  console.log("token exchange HTTP", tok.status);
  if (tok.status !== 200) { console.log("error:", (JSON.parse(tok.body).error_description || JSON.parse(tok.body).error || "").slice(0, 200)); return; }
  const access = JSON.parse(tok.body).access_token;
  const sites = await req("GET", "https://www.googleapis.com/webmasters/v3/sites", { Authorization: "Bearer " + access });
  console.log("sites.list HTTP", sites.status);
  const parsed = JSON.parse(sites.body);
  if (sites.status !== 200) { console.log("error:", JSON.stringify(parsed.error && { code: parsed.error.code, status: parsed.error.status, message: (parsed.error.message || "").slice(0, 200) })); return; }
  const list = (parsed.siteEntry || []).map((s) => `${s.siteUrl} [${s.permissionLevel}]`);
  console.log("visible properties:", list.length ? list : "NONE (service account has not been added to any property)");
})().catch((e) => console.log("diagnostic failed:", e.message));
