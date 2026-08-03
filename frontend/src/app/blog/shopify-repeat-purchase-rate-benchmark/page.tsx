import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopify Repeat Purchase Rate Benchmark 2026: What's Healthy (and What's Leaking Revenue)",
  description:
    "Shopify repeat purchase rate benchmark by category. See if your store's retention is healthy, what's average in 2026, and how to fix repeat purchase leaks.",
  keywords: [
    "Shopify repeat purchase rate benchmark",
    "average repeat purchase rate Shopify",
    "Shopify repeat customer rate by category",
    "Shopify retention rate benchmark",
    "repeat purchase rate 2026",
  ],
  alternates: {
    canonical: "https://www.store-leak.com/blog/shopify-repeat-purchase-rate-benchmark",
  },
  openGraph: {
    title: "Shopify Repeat Purchase Rate Benchmark 2026",
    description:
      "See what's a healthy repeat purchase rate for your Shopify store in 2026, by category. Free benchmarks, calculator, and recovery tips.",
    type: "article",
    publishedTime: "2026-08-03",
    url: "https://www.store-leak.com/blog/shopify-repeat-purchase-rate-benchmark",
    siteName: "Store Leak",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Repeat Purchase Rate Benchmark 2026",
    description:
      "See what's a healthy repeat purchase rate for your Shopify store in 2026, by category.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Shopify Repeat Purchase Rate Benchmark 2026: What's Healthy (and What's Leaking Revenue)",
  description:
    "Shopify repeat purchase rate benchmark by category. See if your store's retention is healthy, what's average in 2026, and how to fix repeat purchase leaks.",
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
    url: "https://www.store-leak.com/blog/shopify-repeat-purchase-rate-benchmark",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good Shopify repeat purchase rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on category. For Beauty and Supplements, anything above 35% (90-day) is healthy. For Apparel, 25%+ is strong. For Electronics and Furniture, measure at 365 days - a healthy 365-day RPR is 25%+ and 18%+ respectively.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between repeat purchase rate and customer retention rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Repeat purchase rate counts customers who placed a 2nd order. Customer retention rate measures the percentage of customers who stayed active over a period (which can include customers who placed their 5th order). RPR is the simpler leading indicator for Shopify stores.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I measure my repeat purchase rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Monthly, with a 90-day trailing window. Weekly is too noisy. Quarterly is too slow - you'll lose 3 months of revenue before you notice a leak.",
      },
    },
    {
      "@type": "Question",
      name: "Does a high repeat purchase rate mean I don't need to acquire new customers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. RPR measures efficiency of existing customers, not growth. You still need acquisition - but a strong RPR means every acquired customer is worth more, which justifies a higher CAC.",
      },
    },
    {
      "@type": "Question",
      name: "Can I improve repeat purchase rate without paying for a tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Most RPR gains come from email flows you can build in Klaviyo or Shopify Email for free. The challenge isn't the tool - it's knowing which flow to prioritize and when.",
      },
    },
  ],
};

const benchmarks = [
  { category: "Beauty & Skincare", average: "28%", healthy: "42%", cycle: "45-60 days" },
  { category: "Pet Supplies", average: "32%", healthy: "38%", cycle: "30-45 days" },
  { category: "Health & Supplements", average: "30%", healthy: "45%", cycle: "30 days" },
  { category: "Apparel & Fashion", average: "18%", healthy: "27%", cycle: "60-90 days" },
  { category: "Home & Furniture", average: "14%", healthy: "22%", cycle: "180+ days" },
  { category: "Food & Beverage", average: "35%", healthy: "50%", cycle: "14-30 days" },
  { category: "Electronics & Gadgets", average: "12%", healthy: "18%", cycle: "180+ days" },
  { category: "Jewelry & Accessories", average: "20%", healthy: "30%", cycle: "90 days" },
];

const causes = [
  {
    title: "Cause 1: No replenishment sequence",
    desc: "Customers buy once, you never remind them to reorder before they run out. Most common in Beauty, Pet, Supplements.",
    fix: "Fix: Time-based email triggers tied to product usage.",
  },
  {
    title: "Cause 2: No cross-sell motion",
    desc: "Customers buy one product, you never show them what else pairs with it. Most common in Apparel, Home.",
    fix: "Fix: Post-purchase bundle offers and 'complete the look' flows.",
  },
  {
    title: "Cause 3: Weak first-purchase experience",
    desc: "Product arrived late, packaging was off, onboarding was missing.",
    fix: "Fix: Audit unboxing, shipping SLA, and post-purchase email quality.",
  },
  {
    title: "Cause 4: Over-reliance on discount-driven acquisition",
    desc: "You acquired customers with a 30% off code - they only return when you offer another discount.",
    fix: "Fix: Re-engage with value (education, community) instead of coupons.",
  },
];

const actions = [
  {
    title: "Launch a replenishment email flow",
    category: "Beauty, Pet, Supplements",
    desc: "Trigger an email 5 days before the customer is expected to run out. Even a simple 'Time to reorder?' email at day 30 typically lifts RPR by 6-9 points.",
  },
  {
    title: "Send a 'second-order' win-back at day 45",
    category: "Sub-60-day categories",
    desc: "If a customer hasn't returned by day 45, send a targeted win-back. Subject line: 'We saved your cart - here's what's new.' Average lift: 4-7 points.",
  },
  {
    title: "Bundle complementary products at checkout",
    category: "All categories",
    desc: "Customers who buy 2+ SKUs on their first order return at 2.3x the rate of single-SKU buyers. Bundle offers at checkout are the fastest way to seed this behavior.",
  },
  {
    title: "Build a post-purchase education series",
    category: "Supplements, Electronics",
    desc: "3-5 emails in the first 14 days teaching the customer how to get more value from the product. Lifts RPR by 3-5 points.",
  },
  {
    title: "Reduce dependency on your top product",
    category: "All categories",
    desc: "If 60%+ of your revenue comes from one SKU, your RPR is artificially capped. Introduce a complementary product and cross-sell it post-purchase.",
  },
];

const faqs = [
  {
    q: "What is a good Shopify repeat purchase rate?",
    a: "It depends on category. For Beauty and Supplements, anything above 35% (90-day) is healthy. For Apparel, 25%+ is strong. For Electronics and Furniture, measure at 365 days - a healthy 365-day RPR is 25%+ and 18%+ respectively.",
  },
  {
    q: "What's the difference between repeat purchase rate and customer retention rate?",
    a: "Repeat purchase rate counts customers who placed a 2nd order. Customer retention rate measures the percentage of customers who stayed active over a period (which can include customers who placed their 5th order). RPR is the simpler leading indicator for Shopify stores.",
  },
  {
    q: "How often should I measure my repeat purchase rate?",
    a: "Monthly, with a 90-day trailing window. Weekly is too noisy. Quarterly is too slow - you'll lose 3 months of revenue before you notice a leak.",
  },
  {
    q: "Does a high repeat purchase rate mean I don't need to acquire new customers?",
    a: "No. RPR measures efficiency of existing customers, not growth. You still need acquisition - but a strong RPR means every acquired customer is worth more, which justifies a higher CAC.",
  },
  {
    q: "Can I improve repeat purchase rate without paying for a tool?",
    a: "Yes. Most RPR gains come from email flows you can build in Klaviyo or Shopify Email for free. The challenge isn't the tool - it's knowing which flow to prioritize and when.",
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
            <span className="text-gray-400">11 min read</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.02]">
            Shopify Repeat Purchase Rate Benchmark 2026: What's Healthy (and What's Leaking Revenue)
          </h1>
        </header>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-black/8 bg-white p-5 my-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">TL;DR</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>The average Shopify repeat purchase rate across categories is <strong>24.7%</strong>, but healthy varies a lot by niche - from 18% (Apparel) to 38% (Pet Supplies).</li>
              <li>Most stores think they have a traffic problem. They actually have a <strong>repeat purchase leak</strong> - customers who buy once and never return within their expected buying cycle.</li>
              <li>A 10-point gap to your category benchmark can mean <strong>$3,000-$12,000/month</strong> in missed revenue, depending on AOV and order volume.</li>
              <li>Not sure where you stand? <Link href="/register" className="text-gray-900 underline font-semibold">Upload your Shopify order CSV</Link> and get a free repeat purchase audit in minutes - no API required.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              What Is Shopify Repeat Purchase Rate (and Why It Matters More Than Conversion Rate)
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Repeat purchase rate (RPR) is the percentage of customers who place a second order within a defined window - usually 90 or 180 days.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              It's the single most under-tracked metric on Shopify. Most founders obsess over conversion rate and CAC, but <strong>a 1% lift in RPR is typically worth 5-10x a 1% lift in conversion rate</strong> for stores with even modest order volume.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mt-4">Here's why:</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>Acquiring a new customer costs <strong>5-7x</strong> more than retaining one.</li>
              <li>A repeat customer's AOV is <strong>67% higher</strong> on average than a first-time buyer.</li>
              <li>Repeat customers refer at <strong>2x the rate</strong> of one-time buyers.</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              Yet most Shopify stores only measure RPR once a year - if at all. That's why it's the <strong>#1 silent revenue leak</strong> we find in our <Link href="/demo" className="text-gray-900 underline font-semibold">Shopify revenue audits</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              Shopify Repeat Purchase Rate Benchmark 2026 (By Category)
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              These benchmarks are based on anonymized order data from Shopify stores analyzed via Store Leak in 2025-2026, supplemented by public benchmarks from Shopify Plus, Klaviyo, and IRP Commerce.
            </p>
            <div className="rounded-2xl border border-black/8 bg-[#fafaf8] p-4 mt-4 text-sm text-gray-600 leading-relaxed">
              <strong>How to read this table:</strong> "Healthy" means the top quartile of stores in that category. "Average" is the median. If you're below average, you have a clear repeat purchase leak.
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Category</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Average RPR (90-day)</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-950">Healthy RPR (Top 25%)</th>
                    <th className="text-left py-3 font-semibold text-gray-950">Typical Buying Cycle</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((b) => (
                    <tr key={b.category} className="border-b border-black/5">
                      <td className="py-3 pr-4 text-gray-800">{b.category}</td>
                      <td className="py-3 pr-4 text-gray-600">{b.average}</td>
                      <td className="py-3 pr-4 text-gray-600">{b.healthy}</td>
                      <td className="py-3 text-gray-600">{b.cycle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold tracking-tight mt-8 mb-3">Key insights from the data</h3>
            <ol className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <li><strong>Beauty and supplements have the highest RPR ceilings</strong> - replenishment cycles are short and predictable. If your beauty store is below 35% in 90 days, you're leaving serious money on the table.</li>
              <li><strong>Apparel is consistently weak</strong> - most fashion stores treat every sale as a one-off acquisition. The top quartile proves 27%+ is achievable with the right post-purchase flow.</li>
              <li><strong>Electronics and furniture look "low" but that's normal</strong> - long buying cycles mean RPR measured at 90 days will always be small. For these categories, measure at 365 days instead.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              How to Calculate Your Shopify Repeat Purchase Rate
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              You don't need a fancy tool to calculate RPR. The formula is straightforward:
            </p>
            <div className="rounded-2xl border border-black/8 bg-gray-950 text-white p-4 mt-4 font-mono text-sm">
              Repeat Purchase Rate = (Customers with 2+ orders in window) ÷ (Total customers in window) × 100
            </div>

            <h3 className="text-xl font-bold tracking-tight mt-8 mb-3">The manual way (using Shopify CSV export)</h3>
            <ol className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>Go to <strong>Shopify Admin → Orders → Export</strong>.</li>
              <li>Export "Orders by customer" for the last 180 days as a CSV.</li>
              <li>Count customers with more than one <code className="px-1.5 py-0.5 rounded bg-gray-100 text-xs">order_id</code> in the export.</li>
              <li>Divide by total unique customers. Multiply by 100.</li>
            </ol>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              This is what your CSV export contains, and what we use at <Link href="/register" className="text-gray-900 underline font-semibold">Store Leak</Link> when analyzing your repeat purchase leak - no API, no app install, just the data you already have.
            </p>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 mt-6">
              <p className="text-sm font-semibold text-gray-950">The faster way</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                <Link href="/register" className="font-semibold text-orange-700 underline">Upload your Shopify order CSV</Link> and we'll calculate your RPR, compare it to your category benchmark, and estimate the revenue opportunity from closing the gap - in about 60 seconds.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              What Causes a Low Repeat Purchase Rate (and How to Tell Which One Is Yours)
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              A low RPR isn't a single problem. It's a symptom with usually one of four root causes. Knowing which one you have determines the fix.
            </p>

            <div className="mt-6 space-y-4">
              {causes.map((cause) => (
                <div key={cause.title} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-950">{cause.title}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{cause.desc}</p>
                  <p className="mt-2 text-sm font-semibold text-orange-700">{cause.fix}</p>
                </div>
              ))}
            </div>

            <p className="text-base text-gray-700 leading-relaxed mt-6">
              Not sure which one applies to your store? Your order CSV actually reveals which cause is most likely - we cover this in the <Link href="/pricing" className="text-gray-900 underline font-semibold">Full Recovery Plan</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              5 Concrete Actions to Improve Your Shopify Repeat Purchase Rate
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              These are the highest-leverage moves we recommend in 2026, ranked by typical impact.
            </p>

            <div className="mt-6 space-y-4">
              {actions.map((action, i) => (
                <div key={action.title} className="rounded-2xl border border-black/8 bg-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-950">{action.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400 font-semibold mt-1">{action.category}</p>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{action.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              How Much Revenue Is a Low Repeat Purchase Rate Actually Costing You?
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              This is the question most founders skip - and it's the most important one.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mt-4">Here's the back-of-the-napkin math:</p>
            <div className="rounded-2xl border border-black/8 bg-gray-950 text-white p-4 mt-3 font-mono text-sm">
              Missed revenue = (Benchmark RPR - Your RPR) × New customers/month × Average repeat AOV
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fafaf8] p-5 mt-4">
              <p className="text-sm font-semibold text-gray-950">Example</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>- Your beauty store: RPR 22% (vs. category healthy 42%)</p>
                <p>- New customers/month: 600</p>
                <p>- Average repeat AOV: $78</p>
              </div>
              <div className="mt-3 rounded-xl bg-gray-950 text-white p-3 font-mono text-sm">
                Missed revenue = (0.42 - 0.22) × 600 × $78 = $9,360/month
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                That's <strong>$112,320/year</strong> in repeat revenue you're not capturing - from customers who already bought from you once.
              </p>
            </div>

            <p className="text-base text-gray-700 leading-relaxed mt-6">
              You don't have to do this math by hand. <Link href="/register" className="text-gray-900 underline font-semibold">Upload your order CSV</Link> and we'll calculate your exact gap and opportunity - for free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4">
              Shopify Repeat Purchase Rate FAQ
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
                  Find Your Repeat Purchase Leak in 60 Seconds
                </h2>
                <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed max-w-xl">
                  If you've read this far, you probably already know whether your repeat purchase rate is healthy. What you don't know is <strong>exactly how much revenue you're leaving on the table</strong> - and which action will recover the most.
                </p>
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  Upload your Shopify order CSV and get:
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
                  <li>- Your <strong>Revenue Health Score</strong> (0-100)</li>
                  <li>- Your <strong>exact RPR gap</strong> vs. category benchmark</li>
                  <li>- Estimated <strong>monthly revenue opportunity</strong></li>
                  <li>- <strong>3 quick wins</strong> tailored to your store</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  It's free, takes 60 seconds, and your CSV is deleted right after analysis.
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