#!/usr/bin/env node
/**
 * ============================================================================
 * PARATUNISIE & PROTEIN.TN — MARKETING HUB SERVER
 * High-performance Email & SMS Marketing Automation Engine
 * ============================================================================
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// 1. LOAD ENVIRONMENT VARIABLES FROM .env or apps/api/.env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "apps", "api", ".env")
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log(`[Config] Loaded environment from: ${envPath}`);
      break;
    }
  }
}
loadEnv();

// Configuration Values
const CONFIG = {
  port: Number(process.env.MARKETING_PORT) || 4500,
  smtp: {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    username: process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com",
    password: process.env.MAIL_PASSWORD || "",
    fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || "alamissaoui.dev@gmail.com",
    fromName: process.env.MAIL_FROM_NAME || "ParaTunisie & Protein.tn"
  },
  sms: {
    apiUrl: process.env.SMS_API_URL || "https://www.winsmspro.com/sms/sms/api",
    apiKey: process.env.SMS_API_KEY || "",
    senderId: process.env.SMS_SENDER_ID || "SOBITAS"
  }
};

// 2. LOAD & NORMALIZE CONTACTS (protein_tn_contacts.json)
const CONTACTS_FILE = path.join(__dirname, "..", "protein_tn_contacts.json");
let allContacts = [];
let validEmailContacts = [];
let validPhoneContacts = [];

function normalizeTunisianPhone(input) {
  if (!input) return null;
  const raw = String(input).trim();
  const digits = raw.replace(/\D/g, "");
  let local8 = "";
  if (digits.length === 8) {
    local8 = digits;
  } else if (digits.length === 11 && digits.startsWith("216")) {
    local8 = digits.slice(3);
  } else if (digits.length > 8 && digits.endsWith(digits.slice(-8))) {
    local8 = digits.slice(-8);
  }
  if (!/^[234579]\d{7}$/.test(local8)) return null;
  return "216" + local8;
}

function loadContacts() {
  if (!fs.existsSync(CONTACTS_FILE)) {
    console.error(`[Error] Contacts file not found at: ${CONTACTS_FILE}`);
    return;
  }

  try {
    const rawData = fs.readFileSync(CONTACTS_FILE, "utf8");
    const parsed = JSON.parse(rawData);

    allContacts = [];
    validEmailContacts = [];
    validPhoneContacts = [];

    // Parse Users
    (parsed.users || []).forEach(u => {
      const email = u.email && u.email.includes("@") && u.email.includes(".") ? u.email.toLowerCase().trim() : null;
      const phone = normalizeTunisianPhone(u.phone);
      const contact = {
        id: u.id,
        name: u.name ? u.name.trim() : "Client",
        email,
        phone,
        type: "user"
      };
      allContacts.push(contact);
      if (email) validEmailContacts.push(contact);
      if (phone) validPhoneContacts.push(contact);
    });

    // Parse Clients
    (parsed.clients || []).forEach(c => {
      const email = c.email && c.email.includes("@") && c.email.includes(".") ? c.email.toLowerCase().trim() : null;
      const phone = normalizeTunisianPhone(c.phone_1) || normalizeTunisianPhone(c.phone_2);
      const contact = {
        id: c.id,
        name: c.name ? c.name.trim() : "Client",
        email,
        phone,
        type: "client"
      };
      allContacts.push(contact);
      if (email) validEmailContacts.push(contact);
      if (phone) validPhoneContacts.push(contact);
    });

    console.log(`[Contacts] Loaded ${allContacts.length} total contacts.`);
    console.log(`[Contacts] ${validEmailContacts.length} contacts with verified email.`);
    console.log(`[Contacts] ${validPhoneContacts.length} contacts with verified Tunisian mobile.`);
  } catch (err) {
    console.error("[Contacts] Failed to parse contacts JSON:", err.message);
  }
}
loadContacts();

// 3. NODEMAILER TRANSPORTER
let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.warn("[Warning] Nodemailer not found, email sending might require npm install nodemailer.");
}

function getMailTransporter() {
  if (!nodemailer) throw new Error("Nodemailer module is not installed");
  return nodemailer.createTransport({
    host: CONFIG.smtp.host,
    port: CONFIG.smtp.port,
    secure: CONFIG.smtp.port === 465,
    auth: {
      user: CONFIG.smtp.username,
      pass: CONFIG.smtp.password
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000
  });
}

// 4. SMS SENDER (WinSMS Pro) - Resilient with Retries & Timeout
async function sendWinSms(toPhone, message, senderId) {
  const normalized = normalizeTunisianPhone(toPhone);
  if (!normalized) {
    return { success: false, error: `Numéro tunisien invalide: ${toPhone}` };
  }

  const effectiveSender = senderId || CONFIG.sms.senderId || "SOBITAS";
  const apiKey = CONFIG.sms.apiKey;
  const timeoutMs = 30000;
  const maxRetries = 3;

  // Try both HTTPS and HTTP endpoints if needed
  const apiUrls = [
    CONFIG.sms.apiUrl || "https://www.winsmspro.com/sms/sms/api",
    "http://www.winsmspro.com/sms/sms/api"
  ];

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const apiUrl = apiUrls[(attempt - 1) % apiUrls.length];
    try {
      const params = new URLSearchParams({
        action: "send-sms",
        api_key: apiKey,
        to: normalized,
        from: effectiveSender,
        sms: message
      });

      const url = `${apiUrl}?${params.toString()}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal
      });

      clearTimeout(timer);
      const text = await res.text();

      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {};
      }

      const code = parsed.code == null ? "" : String(parsed.code).toLowerCase();
      const isSuccess = ["200", "100", "ok"].includes(code) ||
        (!code && /^(ok|success|successfully sent)[.!\s]*$/i.test(text.trim()));

      if (res.ok && isSuccess) {
        return {
          success: true,
          messageId: parsed.reference || parsed.id || parsed.msg_id || "SENT",
          balance: parsed.balance,
          raw: text
        };
      } else {
        lastError = parsed.message || text || "WinSMS API error";
        // If code is not transient (e.g. invalid credentials or quota), don't retry endlessly
        if (code === "106" || code === "102" || code === "103") {
          return { success: false, error: lastError, raw: text };
        }
      }
    } catch (err) {
      lastError = err.message || "Erreur réseau";
      console.warn(`[SMS] Tentative ${attempt}/${maxRetries} vers ${normalized} échouée: ${lastError}`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  return { success: false, error: lastError || "Échec d'envoi après 3 tentatives" };
}

// 5. CAMPAIGN RUNNER ENGINE
let activeCampaign = {
  id: null,
  channel: "email",
  status: "idle", // "idle" | "running" | "paused" | "stopped" | "finished"
  total: 0,
  sent: 0,
  failed: 0,
  remaining: 0,
  percent: 0,
  logs: [],
  sseClients: new Set()
};

function broadcastSse(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  activeCampaign.sseClients.forEach(res => {
    try {
      res.write(payload);
    } catch {
      activeCampaign.sseClients.delete(res);
    }
  });
}

async function runCampaignLoop(options) {
  const { channel, recipients, subject, content, fromName, replyTo, senderId, throttleMs } = options;

  activeCampaign = {
    ...activeCampaign,
    id: "camp_" + Date.now(),
    channel,
    status: "running",
    total: recipients.length,
    sent: 0,
    failed: 0,
    remaining: recipients.length,
    percent: 0,
    logs: []
  };

  broadcastSse({
    status: "running",
    total: activeCampaign.total,
    sent: 0,
    failed: 0,
    remaining: activeCampaign.total,
    percent: 0
  });

  let transporter = null;
  if (channel === "email") {
    try {
      transporter = getMailTransporter();
    } catch (err) {
      console.error("[Campaign] SMTP init error:", err.message);
      activeCampaign.status = "stopped";
      broadcastSse({ status: "stopped", error: err.message });
      return;
    }
  }

  for (let i = 0; i < recipients.length; i++) {
    // Check pause or stop
    while (activeCampaign.status === "paused") {
      await new Promise(r => setTimeout(r, 500));
    }
    if (activeCampaign.status === "stopped") {
      console.log("[Campaign] Stopped by user.");
      break;
    }

    const contact = recipients[i];
    const destination = channel === "email" ? contact.email : contact.phone;

    // Personalize content
    const personalizedContent = content
      .replace(/\{\{name\}\}/gi, contact.name || "Cher client")
      .replace(/\{\{phone\}\}/gi, contact.phone || "")
      .replace(/\{\{email\}\}/gi, contact.email || "")
      .replace(/\{\{id\}\}/gi, contact.id || "");

    const personalizedSubject = (subject || "")
      .replace(/\{\{name\}\}/gi, contact.name || "Cher client")
      .replace(/\{\{phone\}\}/gi, contact.phone || "");

    let result = { success: false };

    if (channel === "email") {
      try {
        const info = await transporter.sendMail({
          from: `"${fromName || CONFIG.smtp.fromName}" <${CONFIG.smtp.fromAddress}>`,
          replyTo: replyTo || CONFIG.smtp.fromAddress,
          to: destination,
          subject: personalizedSubject,
          html: personalizedContent
        });
        result = { success: true, details: `ID: ${info.messageId}` };
      } catch (err) {
        result = { success: false, error: err.message };
      }
    } else {
      // SMS
      result = await sendWinSms(destination, personalizedContent, senderId);
      if (result.success) {
        result.details = `WinSMS Ref: ${result.messageId}`;
      }
    }

    if (result.success) {
      activeCampaign.sent++;
    } else {
      activeCampaign.failed++;
    }
    activeCampaign.remaining = activeCampaign.total - (activeCampaign.sent + activeCampaign.failed);
    activeCampaign.percent = Math.round(((activeCampaign.sent + activeCampaign.failed) / activeCampaign.total) * 100);

    const logEntry = {
      timestamp: Date.now(),
      name: contact.name,
      destination,
      success: result.success,
      details: result.details || "",
      error: result.error || ""
    };

    activeCampaign.logs.push(logEntry);

    broadcastSse({
      status: activeCampaign.status,
      total: activeCampaign.total,
      sent: activeCampaign.sent,
      failed: activeCampaign.failed,
      remaining: activeCampaign.remaining,
      percent: activeCampaign.percent,
      latestLog: logEntry
    });

    // Pacing throttle delay
    if (i < recipients.length - 1 && activeCampaign.status === "running") {
      await new Promise(r => setTimeout(r, throttleMs || 1000));
    }
  }

  if (activeCampaign.status !== "stopped") {
    activeCampaign.status = "finished";
  }

  broadcastSse({
    status: activeCampaign.status,
    total: activeCampaign.total,
    sent: activeCampaign.sent,
    failed: activeCampaign.failed,
    remaining: activeCampaign.remaining,
    percent: activeCampaign.percent
  });

  // Save to history file
  try {
    const historyFile = path.join(__dirname, "..", "campaigns_history.json");
    let history = [];
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
    }
    history.unshift({
      id: activeCampaign.id,
      channel: activeCampaign.channel,
      date: new Date().toISOString(),
      total: activeCampaign.total,
      sent: activeCampaign.sent,
      failed: activeCampaign.failed
    });
    fs.writeFileSync(historyFile, JSON.stringify(history.slice(0, 50), null, 2), "utf8");
  } catch (e) {
    console.error("[Campaign] Failed to save history:", e.message);
  }
}

// 6. HTTP SERVER & REST API
const UI_DIR = path.join(__dirname, "marketing-ui");

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---
  if (pathname === "/api/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      config: {
        smtpHost: CONFIG.smtp.host,
        smtpPort: CONFIG.smtp.port,
        smtpUser: CONFIG.smtp.username,
        fromAddress: CONFIG.smtp.fromAddress,
        fromName: CONFIG.smtp.fromName,
        smsProvider: "WinSMS Pro",
        smsSenderId: CONFIG.sms.senderId
      },
      counts: {
        total: allContacts.length,
        validEmails: validEmailContacts.length,
        validPhones: validPhoneContacts.length
      },
      contactsSample: allContacts.slice(0, 50)
    }));
    return;
  }

  if (pathname === "/api/audience-count" && req.method === "GET") {
    const channel = parsedUrl.searchParams.get("channel") || "email";
    const filter = parsedUrl.searchParams.get("filter") || "all";

    let count = 0;
    if (filter === "test_only") {
      count = 1;
    } else {
      const base = channel === "email" ? validEmailContacts : validPhoneContacts;
      if (filter === "users") {
        count = base.filter(c => c.type === "user").length;
      } else if (filter === "clients") {
        count = base.filter(c => c.type === "client").length;
      } else {
        count = base.length;
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count }));
    return;
  }

  if (pathname === "/api/contacts" && req.method === "GET") {
    const limit = Number(parsedUrl.searchParams.get("limit")) || 100;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      total: allContacts.length,
      contacts: allContacts.slice(0, limit)
    }));
    return;
  }

  // Test Send Endpoint
  if (pathname === "/api/test-send" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { channel, recipient, subject, content, fromName, replyTo, senderId } = data;

        const renderedContent = content
          .replace(/\{\{name\}\}/gi, "Test Destinataire")
          .replace(/\{\{phone\}\}/gi, recipient)
          .replace(/\{\{email\}\}/gi, recipient)
          .replace(/\{\{id\}\}/gi, "TEST-999");

        if (channel === "email") {
          const transporter = getMailTransporter();
          const info = await transporter.sendMail({
            from: `"${fromName || CONFIG.smtp.fromName}" <${CONFIG.smtp.fromAddress}>`,
            replyTo: replyTo || CONFIG.smtp.fromAddress,
            to: recipient,
            subject: `[TEST] ${subject || 'Notification Marketing'}`,
            html: renderedContent
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, messageId: info.messageId }));
        } else {
          // SMS Test
          const result = await sendWinSms(recipient, renderedContent, senderId);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Start Campaign Endpoint
  if (pathname === "/api/campaign/start" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { channel, filter, subject, content, fromName, replyTo, senderId, throttleMs } = data;

        let recipients = [];
        const base = channel === "email" ? validEmailContacts : validPhoneContacts;

        if (filter === "users") {
          recipients = base.filter(c => c.type === "user");
        } else if (filter === "clients") {
          recipients = base.filter(c => c.type === "client");
        } else if (filter === "test_only") {
          recipients = [base[0] || { name: "Test Client", email: CONFIG.smtp.username, phone: "21909597" }];
        } else {
          recipients = [...base];
        }

        if (!recipients.length) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Aucun destinataire trouvé pour ce filtre." }));
          return;
        }

        // Start asynchronously in background
        runCampaignLoop({
          channel,
          recipients,
          subject,
          content,
          fromName,
          replyTo,
          senderId,
          throttleMs
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: recipients.length }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Campaign Playback Controls
  if (pathname === "/api/campaign/pause" && req.method === "POST") {
    activeCampaign.status = "paused";
    broadcastSse({ status: "paused" });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (pathname === "/api/campaign/resume" && req.method === "POST") {
    activeCampaign.status = "running";
    broadcastSse({ status: "running" });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (pathname === "/api/campaign/stop" && req.method === "POST") {
    activeCampaign.status = "stopped";
    broadcastSse({ status: "stopped" });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // SSE Stream
  if (pathname === "/api/campaign/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write("\n");
    activeCampaign.sseClients.add(res);

    req.on("close", () => {
      activeCampaign.sseClients.delete(res);
    });
    return;
  }

  // Progress Polling Endpoint
  if (pathname === "/api/campaign/progress" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: activeCampaign.status,
      total: activeCampaign.total,
      sent: activeCampaign.sent,
      failed: activeCampaign.failed,
      remaining: activeCampaign.remaining,
      percent: activeCampaign.percent
    }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(UI_DIR, pathname === "/" ? "index.html" : pathname);
  const ext = path.extname(filePath).toLowerCase();

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// START SERVER
server.listen(CONFIG.port, () => {
  console.log("\n==================================================================");
  console.log(`🚀 Marketing Hub Server running at: http://localhost:${CONFIG.port}`);
  console.log(`📧 Gmail SMTP : ${CONFIG.smtp.username}`);
  console.log(`💬 WinSMS Pro : Sender ID [${CONFIG.sms.senderId}]`);
  console.log(`📁 Contacts   : ${allContacts.length} total (${validEmailContacts.length} emails, ${validPhoneContacts.length} phones)`);
  console.log("==================================================================\n");
});
