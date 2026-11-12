/**
 * Landing-page checkout draft: stable anonymous session, first-touch attribution, debounced background
 * saves with retry, and local restore. A draft is NOT an order — it never triggers a Purchase.
 */

const API = "/api/v1";
const STORE_KEY = "_pt_lp_checkout_v1";
const ATTR_KEY = "_pt_lp_attr_v1";
const RESTORE_TTL_MS = 24 * 60 * 60 * 1000; // restore an unfinished form for 24 h
const DEBOUNCE_MS = 1500;
const MAX_RETRIES = 4;

export interface LandingFormState {
  customerName: string;
  phone: string;
  gouvernorat: string;
  fullAddress: string;
  quantity: number;
  contactConsent: boolean;
}

export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
  referrerHost?: string;
}

interface Stored {
  sid: string;
  startedAt: number;
  updatedAt: number;
  form?: LandingFormState;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / quota: the draft still works for this page view */
  }
}
function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function newSid(): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "").slice(0, 16) : Math.random().toString(36).slice(2, 18);
  return `chk_lp_${Date.now().toString(36)}_${rand}`;
}

function readStored(): Stored | null {
  const raw = safeGet(STORE_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Stored;
    if (!s?.sid || Date.now() - s.updatedAt > RESTORE_TTL_MS) return null;
    return s;
  } catch {
    return null;
  }
}

/** Same id across refreshes/returns within 24 h, so the server upserts one record instead of duplicating. */
export function getLandingSession(): { sid: string; restored?: LandingFormState } {
  if (typeof window === "undefined") return { sid: "ssr" };
  const existing = readStored();
  if (existing) return { sid: existing.sid, restored: existing.form };
  const fresh: Stored = { sid: newSid(), startedAt: Date.now(), updatedAt: Date.now() };
  safeSet(STORE_KEY, JSON.stringify(fresh));
  return { sid: fresh.sid };
}

export function persistLandingForm(sid: string, form: LandingFormState) {
  if (typeof window === "undefined") return;
  const cur = readStored();
  safeSet(STORE_KEY, JSON.stringify({ sid, startedAt: cur?.startedAt ?? Date.now(), updatedAt: Date.now(), form } satisfies Stored));
}

/** After a confirmed order the next visit starts clean (new session id, empty form). */
export function clearLandingSession() {
  if (typeof window === "undefined") return;
  safeRemove(STORE_KEY);
}

/** First-touch UTM / fbclid / referrer, kept for the browser session. Contains no personal data. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.sessionStorage.getItem(ATTR_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    /* fall through */
  }
  const q = new URLSearchParams(window.location.search);
  const clip = (v: string | null, n: number) => (v ? v.slice(0, n) : undefined);
  let referrerHost: string | undefined;
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) referrerHost = host.slice(0, 120);
    }
  } catch {
    /* ignore */
  }
  const attr: Attribution = {
    utmSource: clip(q.get("utm_source"), 120),
    utmMedium: clip(q.get("utm_medium"), 120),
    utmCampaign: clip(q.get("utm_campaign"), 200),
    utmContent: clip(q.get("utm_content"), 200),
    fbclid: clip(q.get("fbclid"), 300),
    referrerHost,
  };
  try {
    window.sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {
    /* ignore */
  }
  return attr;
}

export interface DraftContext {
  sid: string;
  landingId: string;
  productId: string;
  productVariantId: string;
  purchaseEventId: string;
  attribution: Attribution;
}

export function buildDraftBody(ctx: DraftContext, form: LandingFormState) {
  return {
    checkoutSessionId: ctx.sid,
    source: "LANDING_PAGE",
    landingId: ctx.landingId,
    productId: ctx.productId,
    productVariantId: ctx.productVariantId,
    quantity: form.quantity,
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    gouvernorat: form.gouvernorat || undefined,
    fullAddress: form.fullAddress.trim() || undefined,
    contactConsent: form.contactConsent,
    privacyNoticeShown: true,
    purchaseEventId: ctx.purchaseEventId,
    sourceUrl: window.location.origin + window.location.pathname,
    ...ctx.attribution,
  };
}

/**
 * Debounced, de-duplicated, retrying background saver. `push()` is cheap to call on every change; identical
 * payloads are skipped, bursts collapse into one request, failures retry with backoff and on reconnect.
 */
export class DraftSaver {
  private timer?: ReturnType<typeof setTimeout>;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private pending?: string;
  private lastSent?: string;
  private inFlight = false;
  private retries = 0;
  private stopped = false;

  constructor(private readonly onSaved?: () => void) {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.flush);
      window.addEventListener("pagehide", this.flush);
      document.addEventListener("visibilitychange", this.onVisibility);
    }
  }

  private onVisibility = () => {
    if (document.visibilityState === "hidden") this.flush();
  };

  push(body: object) {
    if (this.stopped) return;
    const json = JSON.stringify(body);
    if (json === this.lastSent || json === this.pending) return;
    this.pending = json;
    this.retries = 0;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.flush, DEBOUNCE_MS);
  }

  /** Send now (page hiding, reconnect). Never marks the checkout abandoned — the server does that on inactivity. */
  flush = () => {
    if (this.stopped || !this.pending || this.inFlight) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    const json = this.pending;
    this.inFlight = true;
    fetch(`${API}/abandoned-checkouts/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    })
      .then((res) => {
        if (res.status >= 500 || res.status === 429) throw new Error(String(res.status));
        this.lastSent = json; // 2xx saved; 4xx will never succeed by retrying the same payload
        if (this.pending === json) this.pending = undefined;
        this.retries = 0;
        this.onSaved?.();
      })
      .catch(() => {
        if (this.retries >= MAX_RETRIES || this.stopped) return;
        this.retries += 1;
        this.retryTimer = setTimeout(this.flush, 2000 * 2 ** (this.retries - 1));
      })
      .finally(() => {
        this.inFlight = false;
        if (this.pending && this.pending !== json && !this.timer) this.timer = setTimeout(this.flush, DEBOUNCE_MS);
      });
  };

  /** After a confirmed order: stop all further draft traffic. */
  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.pending = undefined;
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.flush);
      window.removeEventListener("pagehide", this.flush);
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
  }
}
