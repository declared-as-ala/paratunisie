import Link from "next/link";
import { ChevronDown, Mail, MessageCircle, Phone, Star } from "lucide-react";

import type { LandingProduct, ProductRating, PublicReview } from "@/lib/api/client";
import { COMPANY_CONFIG } from "@/lib/config/company";
import { FLAT_DELIVERY_FEE_MILLIMES } from "@/lib/tunisia";

/**
 * Below-the-fold content. Server-rendered (no client JS): every statement comes from the catalogue record
 * or from the documented store policies (/livraison, /authenticite, company registry) — nothing invented.
 */
export function WheyLandingDetails({
  product,
  reviews = [],
  rating,
  seoSection,
}: {
  product: LandingProduct;
  reviews?: PublicReview[];
  rating?: ProductRating;
  seoSection?: React.ReactNode;
}) {
  const fee = FLAT_DELIVERY_FEE_MILLIMES / 1000;

  const faq: { q: string; a: React.ReactNode }[] = [
    { q: "كيفاش نخلّص؟", a: "الدفع عند الاستلام: تخلّص كاش وقت توصلك الكوموند، ما فمّا حتى خلاص مسبق ولا كارط بنكية." },
    {
      q: "قدّاش التوصيل؟",
      a: `التوصيل ${fee} DT لكل الولايات. المبلغ الصحيح يبان في ملخّص الكوموند قبل ما تأكّد.`,
    },
    { q: "وقتاش توصلني الكوموند؟", a: "العاصمة الكبرى (تونس، أريانة، بن عروس، منوبة): 24 ساعة عمل. باقي الولايات: من 24 لـ 48 ساعة عمل." },
    {
      q: "المنتوج أصلي؟",
      a: (
        <>
          ParaTunisie تبيع منتوجات أصلية فقط.{" "}
          <Link href="/authenticite" className="font-bold text-[var(--lp-brand)] underline underline-offset-2">
            اقرا ضمان الأصالة
          </Link>
          .
        </>
      ),
    },
    { q: "كيفاش نتواصل معاكم؟", a: `تنجم تتصل بينا على ${COMPANY_CONFIG.phone} (${COMPANY_CONFIG.supportHours}) ولا تكتب لنا على واتساب.` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pb-12 pt-4 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-2">
        {product.description && (
          <section className="rounded-3xl border border-[var(--lp-line)] bg-white p-5 sm:p-7" aria-labelledby="lp-desc">
            <h2 id="lp-desc" className="text-lg font-extrabold text-[var(--lp-brand-deep)]">وصف المنتوج</h2>
            <p dir="auto" className="mt-3 text-[0.9375rem] leading-7 text-[var(--lp-ink)]/80">{product.description}</p>
          </section>
        )}
        {product.usage && (
          <section className="rounded-3xl border border-[var(--lp-line)] bg-white p-5 sm:p-7" aria-labelledby="lp-usage">
            <h2 id="lp-usage" className="text-lg font-extrabold text-[var(--lp-brand-deep)]">طريقة الاستعمال</h2>
            <p dir="auto" className="mt-3 text-[0.9375rem] leading-7 text-[var(--lp-ink)]/80">{product.usage}</p>
            <p className="mt-4 rounded-xl bg-[var(--lp-cream)] p-3 text-xs leading-6 text-[var(--lp-ink)]/70">
              مكمّل غذائي: ما يعوّضش نظام غذائي متوازن. إذا عندك حالة صحية ولا تاخذ دواء، استشير طبيب ولا مختص صحة قبل الاستعمال.
            </p>
          </section>
        )}
      </div>

      {rating && rating.count > 0 && reviews.length > 0 && (
        <section aria-labelledby="lp-reviews">
          <h2 id="lp-reviews" className="flex items-center gap-2 text-lg font-extrabold text-[var(--lp-brand-deep)]">
            آراء الحرفاء
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--lp-brand)]" dir="ltr">
              <Star className="size-4 fill-[var(--lp-accent)] text-[var(--lp-accent)]" aria-hidden /> {rating.average.toFixed(1)} ({rating.count})
            </span>
          </h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {reviews.slice(0, 4).map((r) => (
              <li key={r.id} className="rounded-2xl border border-[var(--lp-line)] bg-white p-4">
                <p className="flex items-center gap-1 text-[var(--lp-accent)]" aria-label={`${r.rating} / 5`} dir="ltr">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-4 ${i < r.rating ? "fill-current" : "opacity-25"}`} aria-hidden />
                  ))}
                </p>
                {r.title && <p className="mt-2 font-bold" dir="auto">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm leading-6 text-[var(--lp-ink)]/80" dir="auto">{r.body}</p>}
                <p className="mt-2 text-xs text-[var(--lp-ink)]/55">
                  {r.user?.name || "Client ParaTunisie"}
                  {r.verified ? " · شراء مؤكد" : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {seoSection}

      <section aria-labelledby="lp-faq">
        <h2 id="lp-faq" className="text-lg font-extrabold text-[var(--lp-brand-deep)]">أسئلة متكرّرة</h2>
        <div className="mt-3 divide-y divide-[var(--lp-line)] overflow-hidden rounded-3xl border border-[var(--lp-line)] bg-white">
          {faq.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-[0.9375rem] font-bold text-[var(--lp-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-[var(--lp-brand)] transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="px-5 pb-4 text-sm leading-7 text-[var(--lp-ink)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--lp-brand-deep)] p-6 text-white sm:p-8" aria-labelledby="lp-contact">
        <h2 id="lp-contact" className="text-lg font-extrabold">تحب تسأل قبل ما تطلب؟</h2>
        <p className="mt-1 text-sm text-white/75">{COMPANY_CONFIG.supportHours}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`tel:${COMPANY_CONFIG.phoneRaw}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[var(--lp-brand-deep)]">
            <Phone className="size-4" aria-hidden /> <span dir="ltr">{COMPANY_CONFIG.phone}</span>
          </a>
          <a
            href={`https://wa.me/${COMPANY_CONFIG.phoneRaw.replace(/\D/g, "")}?text=${encodeURIComponent(`عسلامة، نحب نسأل على ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/40 px-5 text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" aria-hidden /> واتساب
          </a>
          <a href={`mailto:${COMPANY_CONFIG.email}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/40 px-5 text-sm font-bold text-white">
            <Mail className="size-4" aria-hidden /> <span dir="ltr">{COMPANY_CONFIG.email}</span>
          </a>
        </div>
      </section>

      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" aria-label="تصفح المتجر">
        <Link href="/whey-proteine" className="font-bold text-[var(--lp-brand)] underline underline-offset-4">شوف كل الواي بروتين</Link>
        <Link href="/nutrition-sportive" className="font-bold text-[var(--lp-brand)] underline underline-offset-4">التغذية الرياضية</Link>
        <Link href="/" className="font-bold text-[var(--lp-brand)] underline underline-offset-4">الصفحة الرئيسية</Link>
      </nav>

      <footer className="border-t border-[var(--lp-line)] pt-6 text-center text-xs text-[var(--lp-ink)]/60">
        <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="روابط قانونية">
          <Link href="/confidentialite" className="underline underline-offset-2">سياسة الخصوصية</Link>
          <Link href="/cgv" className="underline underline-offset-2">شروط البيع</Link>
          <Link href="/retours" className="underline underline-offset-2">الإرجاع</Link>
          <Link href="/livraison" className="underline underline-offset-2">التوصيل</Link>
        </nav>
        © {new Date().getFullYear()} ParaTunisie · paratunisie.com
      </footer>
    </div>
  );
}
