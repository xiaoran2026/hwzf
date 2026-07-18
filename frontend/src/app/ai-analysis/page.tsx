import Link from "next/link";

const items = [
  {
    title: "Upload a CSV",
    body: "Start with a Shopify, WooCommerce, or Amazon export. No API connection required.",
    href: "/stores",
    cta: "Go to uploads",
  },
  {
    title: "Open your reports",
    body: "Review money lost, top revenue leaks, quick wins, and your recovery plan.",
    href: "/reports",
    cta: "View reports",
  },
  {
    title: "See a demo first",
    body: "If you are new, the demo report explains exactly what you get before paying.",
    href: "/demo",
    cta: "View demo report",
  },
];

export default function RevenueLeaksPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Revenue leaks</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Diagnosis lives in the report, not in a separate dashboard module.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            This project is intentionally staying small: CSV upload → revenue leak report → recovery actions. Use the pages below to get to results fast.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
                <h2 className="text-lg font-semibold text-gray-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Data privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
