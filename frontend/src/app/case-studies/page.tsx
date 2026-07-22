"use client";

import Link from "next/link";

const studies = [
  {
    store: "Skincare Brand",
    niche: "Beauty / DTC",
    opportunity: "$9,800/month",
    problem: "Repeat purchase was weak, and there was no bundle strategy supporting higher order value.",
    actions: [
      "Launch a 14-day win-back email sequence",
      "Create a 2-product bundle around the best sellers",
      "Promote complementary products after purchase",
    ],
  },
  {
    store: "Pet Supplies Store",
    niche: "Pets / Replenishment",
    opportunity: "$6,100/month",
    problem: "Customers bought frequently needed items once, but there was no replenishment reminder flow.",
    actions: [
      "Send replenishment reminders based on product cycle",
      "Offer free shipping thresholds to lift AOV",
      "Cross-sell repeat-use products in email",
    ],
  },
  {
    store: "Apparel Brand",
    niche: "Fashion / DTC",
    opportunity: "$7,400/month",
    problem: "Revenue depended too much on one hero product, and cross-sell behavior was weak.",
    actions: [
      "Bundle hero products with accessories",
      "Push complementary products in post-purchase email",
      "Track top-product concentration monthly",
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-950">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <section className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Case Studies</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight leading-[0.98]">
            Example revenue opportunities found in Shopify stores
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            These are example audit outcomes showing the kinds of recovery opportunities, gaps, and actions the product is designed to surface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Free Audit
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-white border border-black/10 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              See Example Report
            </Link>
          </div>
        </section>

        <section className="mt-12 grid lg:grid-cols-3 gap-5">
          {studies.map((study) => (
            <article key={study.store} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-950">{study.store}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400 font-semibold">{study.niche}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Opportunity</p>
                  <p className="mt-1 text-lg font-bold text-gray-950">{study.opportunity}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-orange-500 font-semibold">Main Problem</p>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{study.problem}</p>
              </div>

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Recommended Actions</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {study.actions.map((action) => (
                    <li key={action} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[28px] border-2 border-dashed border-orange-200 bg-orange-50/60 p-8 md:p-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">Founding Store Program</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-gray-950">
                Your store could be the next real case study
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                The examples above are illustrative. We are now onboarding 20 Shopify stores for a
                completely free full audit — including the recovery plan and email kit — in exchange
                for permission to publish your results (anonymized if you prefer).
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-white border border-orange-200 text-gray-700">Full audit, $0</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-orange-200 text-gray-700">Anonymized if preferred</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-orange-200 text-gray-700">20 spots this month</span>
              </div>
            </div>
            <div className="lg:justify-self-end">
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Apply for a Free Full Audit
              </Link>
              <p className="mt-3 text-xs text-gray-500 lg:text-right">
                Best fit: Shopify DTC brands with 1,000+ orders.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[28px] bg-gray-950 text-white p-8 md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">How To Use This</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Use the free audit to validate the opportunity first</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Step 1</p>
              <p className="mt-2 text-white/70 leading-relaxed">Upload your Shopify order export and see whether the revenue opportunity looks meaningful.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Step 2</p>
              <p className="mt-2 text-white/70 leading-relaxed">Review your score, top gap, benchmark comparison, and first quick wins for free.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Step 3</p>
              <p className="mt-2 text-white/70 leading-relaxed">Unlock the full recovery plan only if the opportunity is worth acting on.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
