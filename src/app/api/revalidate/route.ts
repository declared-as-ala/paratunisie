import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * On-demand invalidation of the public catalogue cache (see docs/seo/CACHING_PLAN.md).
 * Called server-to-server by the API after product / category / brand / article / price / stock changes.
 *
 * Disabled (503) unless REVALIDATE_SECRET is configured. POST only. Only allow-listed tags can be flushed.
 * Entries are expired immediately (not stale-while-revalidate) so a changed price or stock level is never shown after the
 * change was saved.
 */
const ALLOWED_TAGS = new Set(["catalogue"]);

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return Response.json({ ok: false, error: "disabled" }, { status: 503 });

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!provided || !safeEqual(provided, secret)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag") ?? "catalogue";
  if (!ALLOWED_TAGS.has(tag)) return Response.json({ ok: false, error: "unknown tag" }, { status: 400 });

  revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, tag, at: new Date().toISOString() });
}
