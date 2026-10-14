import { NextRequest, NextResponse } from "next/server";

/** Resolve persisted slug migrations before rendering, with an actual HTTP 301. */
export async function proxy(request: NextRequest) {
  if (!['GET', 'HEAD'].includes(request.method) || /\.[a-z0-9]+$/i.test(request.nextUrl.pathname)) return NextResponse.next();
  const base = process.env.API_URL || 'http://localhost:3001/api/v1';
  try {
    const response = await fetch(`${base}/catalogue/seo/redirect?path=${encodeURIComponent(request.nextUrl.pathname)}`, {
      cache: 'no-store', signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const redirect = await response.json();
      if (redirect?.newPath?.startsWith('/') && !redirect.newPath.startsWith('//') && redirect.newPath !== request.nextUrl.pathname) {
        const target = new URL(redirect.newPath, 'https://paratunisie.com');
        // Preserve a real page number, dropping obsolete filters and tracking.
        const page = request.nextUrl.searchParams.get('page');
        if (page && /^[1-9]\d*$/.test(page) && Number(page) > 1) target.searchParams.set('page', page);
        return NextResponse.redirect(target, 301);
      }
    }
  } catch { /* The page still handles a missing entity when the API recovers. */ }
  return NextResponse.next();
}

export const config = { matcher: ['/produits/:path*', '/marques/:path*', '/conseils/:path*', '/:category'] };
