import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopify Average Order Value (AOV) Benchmark 2026: What's Normal By Category",
  description:
    "Shopify average order value (AOV) benchmark by category. See how your store's AOV compares to industry averages in 2026 and find opportunities to increase it.",
  keywords: [
    "Shopify average order value benchmark",
    "Shopify AOV by category",
    "average order value Shopify 2026",
    "Shopify AOV benchmark",
    "how to increase Shopify AOV",
  ],
  alternates: {
    canonical: "https://www.store-leak.com/blog/shopify-aov-benchmark",
  },
  openGraph: {
    title: "Shopify AOV Benchmark 2026: What's Normal By Category",
    description:
      "See what's a healthy average order value for your Shopify store in 2026, by category. Benchmarks, calculators, and uplift tactics.",
    type: "article",
    publishedTime: "2026-08-03",
    url: "https://www.store-leak.com/blog/shopify-aov-benchmark",
    siteName: "Store Leak",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify AOV Benchmark 2026",
    description:
      "See what's a healthy average order value for your Shopify store in 2026, by category.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Shopify Average Order Value (AOV) Benchmark 2026: What's Normal By Category",
  description:
    "Shopify average order value (AOV) benchmark by category. See how your store's AOV compares to industry averages in 2026 and find opportunities to increase it.",
  datePublished: "2026-08-03",
  author: {
    "@type": "Organization",
    name: "Store Leak",
    url: "https://www.store-leak.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Store Leak",
    url: "https://www.store-leak.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    url: "https://www.store-leak.com/blog/shopify-aov-benchmark",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good average order value for Shopify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It varies by category. Beauty and supplements stores typically see AOV of 50-80 USD. Apparel ranges widely from 40-120 USD. Home and furniture stores have higher AOV at 150-400 USD on average. Compare against your category's median to determine what's healthy for your store.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate my Shopify average order value?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AOV = Total revenue / Number of orders. For Shopify stores, go to Analytics -> Reports -> Sales, and divide total sales by order count for your chosen period.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my AOV so low compared to benchmarks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common causes: single-product focus without upsells, no bundle strategy, free shipping threshold too high or too low, weak cross-sell flow, or missing post-purchase offers. Your order CSV can reveal which specific leak is limiting your AOV.",
      },
    },
    {
      "@type": "Question",
      name: "How much can I realistically increase my AOV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most stores can achieve a 15-30% AOV lift through bundle offers, upsells, and free shipping thresholds. Stores with a good bundle strategy can see 40-60%+ increases within 30 days.",
      },
    },
    {
      "@type": "Question",
      name: "Should I raise prices to increase AOV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Raising prices works if your brand supports it, but it risks conversion. The safer path is increasing SKUs per order through bundling and upsells. A store with 30% higher AOV but 10% lower conversion still grows revenue.",
      },
    },
  ],
};

const benchmarks = [
  { category: "Beauty & Skincare", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Pet Supplies", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Health & Supplements", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Apparel & Fashion", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Home & Furniture", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Food & Beverage", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Electronics & Gadgets", avgAOV: "", healthyAOV: "", range: "-" },
  { category: "Jewelry & Accessories", avgAOV: "", healthyAOV: "", range: "-" },
];

const aovLeaks = [
  {
    title: "Single-product focus",
    desc: "Your top SKU drives most revenue, but customers buy it alone without complementary products.",
    impact: "Capped at the price of your hero product. No room for organic AOV growth.",
    fix: "Bundle with accessories or refills. A 2-product bundle at 15% off typically lifts AOV by 35-50%.",
  },
  {
    title: "No upsell or cross-sell flow",
    desc: "You're not showing customers what else they might want before or after checkout.",
    impact: "Leaving 20-40% of potential AOV on the table for every order.",
    fix: "Add post-purchase upsells in Shopify or use a tool like ReConvert. Even a simple 'customers also bought' widget helps.",
  },
  {
    title: "Free shipping threshold misalignment",
    desc: "Threshold is set too high (customers give up) or too low (no incentive to add more).",
    impact: "Either lost conversions or missed AOV opportunities.",
    fix: "Set threshold at 1.5x your current AOV. For example, if AOV is , offer free shipping at . This nudges 25-35% of customers to add one more item.",
  },
  {
    title: "No minimum order value (MOV) for promotions",
    desc: "Discount codes apply to any order, not just orders above a threshold.",
    impact: "Discounts cannibalize margin without lifting AOV.",
    fix: "Run 'spend , get 15% off' instead of '15% off everything'. This turns discounts into AOV drivers.",
  },
];

const tactics = [
  {
    title: "Launch a complementary product bundle",
    category: "Beauty, Supplements, Pet",
    desc: "Pair your best seller with its natural companion. Example: cleanser + toner, shampoo + conditioner. Offer 15% off the bundle vs. buying separately.",
    lift: "+35-50% AOV",
  },
  {
    title: "Set a strategic free shipping threshold",
    category: "All categories",
    desc: "Set free shipping at 1.5x your current AOV. Track how many customers add items to qualify. This is the lowest-effort, highest-impact AOV lever.",
    lift: "+15-25% AOV",
  },
  {
    title: "Add a post-purchase upsell flow",
    category: "Apparel, Jewelry, Electronics",
    desc: "After checkout, offer a relevant upsell. Example: 'You bought that dress - complete the look with this necklace.' Use ReConvert or a Klaviyo flow.",
    lift: "+20-35% AOV",
  },
  {
    title: "Offer a tiered discount structure",
    category: "All categories",
    desc: "Instead of one flat discount, use tiers: Spend  get 10% off, spend  get 15% off, spend  get 20% off. This naturally pushes AOV upward.",
    lift: "+18-30% AOV",
  },
  {
    title: "Implement a 'complete the set' flow",
    category: "Home, Beauty, Fitness",
    desc: "If a customer bought item 1 of a 5-item set, send an email showing what's needed to complete it, with a discount incentive. Works especially well for skincare routines and home collections.",
    lift: "+25-40% AOV on repeat orders",
  },
];

const faqs = [
  {
    q: "What is a good average order value for Shopify?",
    a: "It varies by category. Beauty and supplements stores typically see AOV of 50-80 USD. Apparel ranges widely from 40-120 USD. Home and furniture stores have higher AOV at 150-400 USD on average. Compare against your category's median to determine what's healthy for your store.",
  },
  {
    q: "How do I calculate my Shopify average order value?",
    a: "AOV = Total revenue / Number of orders. For Shopify stores, go to Analytics -> Reports -> Sales, and divide total sales by order count for your chosen period.",
  },
  {
    q: "Why is my AOV so low compared to benchmarks?",
    a: "Common causes: single-product focus without upsells, no bundle strategy, free shipping threshold too high or too low, weak cross-sell flow, or missing post-purchase offers. Your order CSV can reveal which specific leak is limiting your AOV.",
  },
  {
    q: "How much can I realistically increase my AOV?",
    a: "Most stores can achieve a 15-30% AOV lift through bundle offers, upsells, and free shipping thresholds. Stores with a good bundle strategy can see 40-60%+ increases within 30 days.",
  },
  {
    q: "Should I raise prices to increase AOV?",
    a: "Raising prices works if your brand supports it, but it risks conversion. The safer path is increasing SKUs per order through bundling and upsells. A store with 30% higher AOV but 10% lower conversion still grows revenue.",
  },
];

export default function BlogPostPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="border-b border-black/5 bg-[#fafaf8]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-950 text-white flex items-center justify-center">
              <span className="text-sm font-bold">SL</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Store Leak</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">Shopify Revenue Recovery Audit</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-950 transition-colors">Home</Link>
            <Link href="/case-studies" className="hover:text-gray-950 transition-colors">Case Studies</Link>
            <Link href="/blog" className="hover:text-gray-950 transition-colors">Blog</Link>
          </nav>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
          >
            Get Free Audit
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <header>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase tracking-[0.12em]">
              Benchmarks
            </span>
            <span className="text-gray-400">August 3, 2026</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">9 min read</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.02]">
            Shopify Average Order Value (AOV) Benchmark 2026: What's Normal By Category
          </h1>
        </header>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-black/8 bg-white p-5 my-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">TL;DR</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>The <strong>average Shopify AOV across all categories is </strong>, but category matters more than any other factor.</li>
              <li>Most stores have a <strong>AOV leak</strong> — customers buying single products without bundle or upsell support.</li>
              <li>A 20% AOV gap to your category benchmark can mean <strong>,000-,000/month</strong> in missed revenue.</li>
              <li>Not sure where you stand? <Link href="/register" className="text-gray-900 underline font-semibold">Upload your Shopify order CSV</Link> and get a free AOV audit in minutes.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              What Is Average Order Value (AOV) and Why It Matters
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Average Order Value (AOV) is exactly what it sounds like: the average amount a customer spends per order. The formula is simple:
            </p>
            <div className="rounded-2xl border border-black/8 bg-gray-950 text-white p-4 mt-4 font-mono text-sm">
              AOV = Total Revenue / Number of Orders
            </div>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              AOV is one of the three levers that drive e-commerce revenue (alongside conversion rate and traffic). It's also the <strong>most under-optimized lever</strong> on most Shopify stores.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              Why AOV matters more than you think:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>A higher AOV means <strong>more revenue per visitor</strong> — your traffic becomes more valuable.</li>
              <li>A higher AOV means you can <strong>afford more acquisition cost</strong> (CAC) without hurting margins.</li>
              <li>A higher AOV often signals <strong>better product-market fit</strong> — customers are buying more because they trust your brand.</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              Yet most Shopify stores focus on conversion rate and traffic at the expense of AOV. That's why AOV is one of the key metrics we analyze in our <Link href="/demo" className="text-gray-900 underline font-semibold">Shopify revenue audits</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              Shopify AOV Benchmark 2026 (By Category)
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              These benchmarks are based on anonymized order data from Shopify stores analyzed via Store Leak in 2025-2026, supplemented by public benchmarks from Shopify Plus, IRP Commerce, and eMarketer.
            </p>
            <div className="rounded-2xl border border-black/8 bg-[#fafaf8] p-4 mt-4 text-sm text-gray-600 leading-relaxed">
              <strong>How to read this table:</strong> "Healthy" means the top quartile of stores in that category. "Average" is the median. If you're below average, you have a clear AOV leak.
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Category</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Avg AOV</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Healthy AOV (Top 25%)</th>
                    <th className="text-left py-3 font-semibold text-gray-950">Typical Range</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((b) => (
                    <tr key={b.category} className="border-b border-black/5">
                      <td className="py-3 pr-4 text-gray-800">{b.category}</td>
                      <td className="py-3 pr-4 text-gray-600">{b.avgAOV}</td>
                      <td className="py-3 pr-4 text-gray-600">{b.healthyAOV}</td>
                      <td className="py-3 text-gray-600">{b.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold tracking-tight mt-8 mb-3">Key insights from the data</h3>
            <ol className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <li><strong>Home & Furniture has the highest AOV</strong> — average , healthy at . But this category also has the lowest repeat purchase rate, so stores need to balance AOV with retention.</li>
              <li><strong>Beauty and supplements have the most room to grow</strong> — the gap between average () and healthy () is  per order. With bundle strategies, this is very achievable.</li>
              <li><strong>Apparel AOV is deceptively high</strong> — the  average includes luxury and premium brands. Mass-market apparel often sits closer to -50. Bundle and cross-sell are the fastest way to climb toward the healthy  mark.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              How to Calculate Your Shopify AOV
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              You don't need a fancy tool to calculate AOV. Here's the manual way:
            </p>
            <ol className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>Go to <strong>Shopify Admin → Analytics → Reports → Sales</strong>.</li>
              <li>Set the date range you want to analyze (we recommend the last 90 days).</li>
              <li>Note the <strong>total sales</strong> and <strong>total orders</strong>.</li>
              <li>Divide total sales by total orders.</li>
            </ol>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 mt-6">
              <p className="text-sm font-semibold text-gray-950">The faster way</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                <Link href="/register" className="font-semibold text-orange-700 underline">Upload your Shopify order CSV</Link> and we'll calculate your AOV, compare it to your category benchmark, and estimate the revenue opportunity from closing the gap — in about 60 seconds.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              4 Hidden AOV Leaks (and How to Fix Them)
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              A low AOV rarely means "your products are too cheap." It usually means you're leaving money on the table through one of these four common leaks.
            </p>

            <div className="mt-6 space-y-4">
              {aovLeaks.map((leak) => (
                <div key={leak.title} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-950">{leak.title}</p>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{leak.desc}</p>
                  <p className="mt-3 text-sm font-semibold text-gray-700">Impact: {leak.impact}</p>
                  <p className="mt-1 text-sm font-semibold text-orange-700">Fix: {leak.fix}</p>
                </div>
              ))}
            </div>

            <p className="text-base text-gray-700 leading-relaxed mt-6">
              Not sure which leak applies to your store? Your order CSV reveals it — we cover this in the <Link href="/pricing" className="text-gray-900 underline font-semibold">Full Recovery Plan</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              5 Concrete Tactics to Increase Your Shopify AOV
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              These are the highest-leverage moves we recommend in 2026, ranked by typical impact.
            </p>

            <div className="mt-6 space-y-4">
              {tactics.map((tactic, i) => (
                <div key={tactic.title} className="rounded-2xl border border-black/8 bg-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-950">{tactic.title}</p>
                          <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400 font-semibold mt-1">{tactic.category}</p>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          {tactic.lift}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{tactic.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              How Much Revenue Is a Low AOV Actually Costing You?
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Here's the back-of-the-napkin math for your AOV leak:
            </p>
            <div className="rounded-2xl border border-black/8 bg-gray-950 text-white p-4 mt-3 font-mono text-sm">
              Missed revenue = (Healthy AOV - Your AOV) × Orders per month
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fafaf8] p-5 mt-4">
              <p className="text-sm font-semibold text-gray-950">Example</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>- Your beauty store AOV:  (vs. category healthy )</p>
                <p>- Orders per month: 450</p>
              </div>
              <div className="mt-3 rounded-xl bg-gray-950 text-white p-3 font-mono text-sm">
                Missed revenue = ( - ) × 450 = ,200/month
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                That's <strong>,400/year</strong> — from orders you're already getting, just without the extra revenue per order.
              </p>
            </div>

            <p className="text-base text-gray-700 leading-relaxed mt-6">
              You don't have to do this math by hand. <Link href="/register" className="text-gray-900 underline font-semibold">Upload your order CSV</Link> and we'll calculate your exact gap and opportunity — for free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              Shopify AOV FAQ
            </h2>

            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-950">{faq.q}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 rounded-[28px] border-2 border-dashed border-orange-200 bg-orange-50/60 p-8 md:p-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">Stop Guessing</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-gray-950">
                  Find Your AOV Leak in 60 Seconds
                </h2>
                <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed max-w-xl">
                  If you've read this far, you probably already know whether your AOV is healthy. What you don't know is <strong>exactly how much revenue you're leaving on the table</strong> — and which tactic will recover the most.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
                  <li>- Your <strong>Revenue Health Score</strong> (0-100)</li>
                  <li>- Your <strong>exact AOV gap</strong> vs. category benchmark</li>
                  <li>- Estimated <strong>monthly revenue opportunity</strong></li>
                  <li>- <strong>3 quick wins</strong> tailored to your store</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  Free, takes 60 seconds, CSV deleted after analysis.
                </p>
              </div>
              <div className="lg:justify-self-end">
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Get Your Free Revenue Audit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}