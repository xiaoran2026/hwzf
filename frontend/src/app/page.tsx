"use client";

import Link from "next/link";
import { Activity, ArrowRight, Check, FileSpreadsheet, Search, TrendingDown, Upload } from "lucide-react";

const leaks = [
  {
    title: "Repeat Purchase Leak",
    desc: "Returning customers are not coming back within the expected buying cycle.",
  },
  {
    title: "Low AOV Opportunity",
    desc: "Top products are frequently purchased alone without bundle or upsell support.",
  },
  {
    title: "Product Concentration Risk",
    desc: "Too much revenue depends on one product, limiting growth and increasing risk.",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload Your Shopify Orders",
    desc: "Use your exported order CSV. No app install, no API setup, and no extra integration work.",
  },
  {
    icon: Search,
    title: "We Analyze Lost Revenue Opportunities",
    desc: "We review repeat purchase patterns, order value, product mix, and the biggest recovery opportunities.",
  },
  {
    icon: TrendingDown,
    title: "Get Your Recovery Plan",
    desc: "See your score, estimated opportunity, benchmark gaps, and the fastest actions to recover revenue.",
  },
];

const faqs = [
  {
    q: "Do I need to connect my Shopify store?",
    a: "No. Just upload your exported Shopify order CSV. No Shopify API connection is required.",
  },
  {
    q: "What does the report include?",
    a: "The report includes estimated revenue lost, top revenue leaks, quick wins, and a revenue recovery plan.",
  },
  {
    q: "Is this financial advice?",
    a: "No. The report provides estimated opportunities based on your uploaded order data.",
  },
  {
    q: "Do you keep my raw CSV forever?",
    a: "No. Your raw CSV is permanently deleted from our servers right after your order data is extracted. Only the analysis results are kept.",
  },
  {
    q: "Do I need to upload customer emails or personal data?",
    a: "No. The audit only needs order-level fields like order_id, date, customer_id, product, quantity, and price. Customer emails, names, and addresses are never required.",
  },
  {
    q: "Is my store data shared or sold?",
    a: "Never. Your data is used only to generate your report and is never sold or shared with third parties.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-950">
      <header className="border-b border-black/5 bg-[#fafaf8]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-950 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Store Leak</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">Shopify Revenue Recovery Audit</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how" className="hover:text-gray-950 transition-colors">How It Works</a>
            <a href="#leaks" className="hover:text-gray-950 transition-colors">What It Finds</a>
            <a href="#pricing" className="hover:text-gray-950 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-950 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/demo" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors">
              See Example Report
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors">
              Get Free Audit
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-black/5">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white text-[11px] font-semibold text-gray-600 uppercase tracking-[0.16em]">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Shopify CSV Revenue Recovery Audit
              </div>

              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[0.96]">
                Recover Your Lost Shopify Revenue
                <br />
                In 5 Minutes
              </h1>

              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
                Upload your Shopify orders and discover missed repeat purchases, low-AOV opportunities,
                and hidden product growth gaps.
                <br />
                <br />
                Get a personalized revenue recovery plan in minutes. No API required.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Get Free Audit
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-black/10 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  See Example Report
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">No API required</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">Works with Shopify CSV exports</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">Get results in minutes</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">Raw CSV deleted after analysis</span>
              </div>
            </div>

            <div className="lg:justify-self-end w-full">
              <div className="bg-white rounded-[28px] border border-black/10 shadow-[0_24px_80px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Free Audit Preview</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Revenue Recovery Audit</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Revenue Health Score</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-gray-950">62<span className="text-base text-gray-500 font-semibold">/100</span></p>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    Your store is generating orders, but retention, order value, and product mix are limiting growth.
                  </p>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Estimated Revenue Opportunity", value: "$8,420/month" },
                      { label: "Main Gap", value: "Repeat purchase is 43% below benchmark" },
                      { label: "Recovery Potential", value: "High" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-t border-black/5 first:border-t-0">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-gray-950 text-white">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-semibold">3 Quick Wins</p>
                    <p className="mt-2 text-sm font-semibold">1. Launch a win-back campaign</p>
                    <p className="mt-1 text-sm text-white/80">2. Create a bundle offer</p>
                    <p className="mt-1 text-sm text-white/80">3. Reduce top-product dependency</p>
                    <p className="mt-3 text-xs text-white/60">Unlock your full recovery plan for action details and email templates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="leaks" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="mb-10 grid sm:grid-cols-3 gap-4">
              {[
                { label: "Best for", value: "Shopify DTC brands with repeat purchase potential" },
                { label: "Input", value: "A standard Shopify order CSV export" },
                { label: "Outcome", value: "A recovery plan focused on revenue, not vanity metrics" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">What This Tool Finds</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Most Shopify stores are sitting on hidden revenue opportunities</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Your order data already shows where growth is being limited.
                This audit turns that data into a clear recovery plan you can act on.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {leaks.map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-black/8 p-6">
                  <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-16 md:py-20 border-y border-black/5 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">How It Works</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Upload once. Get your revenue recovery audit.</h2>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {steps.map((step, index) => (
                <div key={step.title} className="p-6 rounded-2xl border border-black/8 bg-[#fafaf8]">
                  <div className="w-11 h-11 rounded-xl bg-gray-950 text-white flex items-center justify-center">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-950">{step.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">What You Get</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Everything you need to recover lost revenue</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Not another dashboard. Just the score, benchmarks, actions, and templates that help you recover revenue faster.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Revenue Health Score",
                "Estimated Revenue Opportunity",
                "Benchmark Comparison",
                "Top Revenue Opportunities",
                "Recovery Action Plan",
                "Email Recovery Kit",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-black/8">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 border-t border-black/5 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Example Opportunity</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">See the kind of revenue opportunity this audit can uncover</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Use the free audit to spot lost revenue, then unlock the full recovery plan only if the opportunity feels real.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-black/8 bg-[#fafaf8] p-6 md:p-8">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Beauty Brand Example</p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                    We found $9,800/month in revenue opportunity for a Shopify beauty brand
                  </h3>
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    The store had repeat purchase weakness, no bundle strategy, and too much reliance on a single top product.
                  </p>
                </div>
                <div className="grid gap-3">
                  {[
                    "Launch a 14-day win-back email",
                    "Create a 2-product bundle offer",
                    "Promote complementary products",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-white border border-black/8 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Recommended Action</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Skincare Brand",
                  result: "$9.8k/month opportunity",
                  detail: "Retention weakness and no bundle strategy were limiting repeat revenue.",
                },
                {
                  title: "Pet Supplies Store",
                  result: "$6.1k/month opportunity",
                  detail: "Top products sold well, but there was no clear replenishment sequence.",
                },
                {
                  title: "Apparel Brand",
                  result: "$7.4k/month opportunity",
                  detail: "Revenue depended too much on one hero product and weak cross-sell motion.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-gray-950">{item.result}</p>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 md:py-20 border-t border-black/5 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Simple Pricing</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Start with a free audit. Unlock the full plan only when you see value.</h2>

            <div className="mt-10 grid md:grid-cols-2 gap-4 text-left">
              <div className="rounded-[24px] border border-black/8 bg-[#fafaf8] p-6">
                <p className="text-lg font-semibold text-gray-950">Free Audit</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">$0</p>
                <p className="mt-3 text-sm text-gray-600">
                  See whether the revenue opportunity is real before you pay.
                </p>
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <p>Revenue Health Score</p>
                  <p>Estimated Revenue Opportunity</p>
                  <p>Top revenue gap</p>
                  <p>3 quick wins</p>
                </div>
                <Link href="/register" className="mt-8 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                  Get Free Audit
                </Link>
              </div>

              <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-6 ring-1 ring-orange-100">
                <p className="text-lg font-semibold text-gray-950">Full Recovery Plan</p>
                <div className="mt-2 flex items-end gap-1">
                  <p className="text-4xl font-bold tracking-tight">$19</p>
                  <p className="text-sm text-gray-500 mb-1">one-time</p>
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  Unlock the exact actions, explanations, and templates needed to recover revenue.
                </p>
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <p>Full opportunity breakdown</p>
                  <p>Calculation details</p>
                  <p>All recovery actions</p>
                  <p>Email recovery kit</p>
                </div>
                <Link href="/pricing" className="mt-8 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
                  Unlock Full Recovery Plan
                </Link>
                <p className="mt-3 text-xs text-gray-500">One-time payment. No subscription required.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-black/8 bg-[#fafaf8] p-5 text-left">
              <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-950">Typical analytics tools</p>
                  <p className="mt-1 text-gray-600">Monthly subscriptions, whether you use them or not.</p>
                </div>
                <span className="hidden sm:block text-gray-300 font-bold">vs</span>
                <div>
                  <p className="font-semibold text-gray-950">Store Leak</p>
                  <p className="mt-1 text-gray-600">A one-time $19 revenue audit. Pay once, use it when you need it. No recurring SaaS tax.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Questions founders usually ask first</h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-950">{item.q}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-950 text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Try It On Your Store</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Want to see your own revenue opportunities?</h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Upload your Shopify order CSV and get your revenue recovery audit in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-gray-100 transition-colors">
                Get Free Audit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                See Example Report
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
