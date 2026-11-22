import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

/**
 * Keeps the storefront's opt-in public cache (see docs/seo/CACHING_PLAN.md) fresh: after any successful write request
 * (product / price / stock / category / brand / article / review edits, new orders that decrement stock) it schedules one
 * debounced POST to the web app's /api/revalidate endpoint, which expires every entry tagged "catalogue" immediately.
 *
 * Inactive unless BOTH WEB_REVALIDATE_URL and REVALIDATE_SECRET are set, so shipping this code changes nothing by itself.
 * Writes that do not go through HTTP (CLI imports, sync cron jobs, manual SQL) are covered by the short TTL instead.
 */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Writes that never change what the public catalogue shows.
const IGNORED = /\/(tracking|analytics|auth|admin-auth|meta-capi|abandoned-checkouts|notifications|diagnostic|wishlist|product-requests)(?:[/?]|$)/;

export function shouldInvalidate(method: string, url: string): boolean {
  return WRITE_METHODS.has(method.toUpperCase()) && !IGNORED.test(url);
}

@Injectable()
export class WebCacheInvalidationInterceptor implements NestInterceptor {
  private timer: ReturnType<typeof setTimeout> | undefined;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method?: string; originalUrl?: string; url?: string }>();
    const relevant = shouldInvalidate(req.method ?? "GET", req.originalUrl ?? req.url ?? "");
    return next.handle().pipe(
      tap(() => {
        if (relevant) this.schedule();
      }),
    );
  }

  private schedule(): void {
    const url = process.env.WEB_REVALIDATE_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!url || !secret || this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      fetch(url, { method: "POST", headers: { "x-revalidate-secret": secret }, signal: AbortSignal.timeout(3000) }).catch(() => {
        // Best effort: the TTL guarantees the cache still expires on its own.
      });
    }, 1500);
    this.timer.unref?.();
  }
}
