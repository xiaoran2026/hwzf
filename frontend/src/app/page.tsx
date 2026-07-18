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
    title: "Upload Your Shopify CSV",
    desc: "Use your exported order report. No API setup, no app install, no extra integration work.",
  },
  {
    icon: Search,
    title: "We Find Revenue Leaks",
    desc: "The tool checks repeat purchase, order value, product mix, and missed recovery opportunities.",
  },
  {
    icon: TrendingDown,
    title: "Get Your Recovery Report",
    desc: "See estimated revenue lost, top leaks, and the fastest actions to recover revenue.",
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
    a: "No. Raw files should only be kept as long as needed to generate the report.",
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
              <p className="text-sm font-bold tracking-tight">StoreAI Doctor</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">Revenue Leak Checker</p>
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
              View Demo
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors">
              Upload My CSV
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
                Shopify CSV Revenue Leak Checker
              </div>

              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[0.96]">
                Find Lost Revenue
                <br />
                in Your Shopify Store
              </h1>

              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
                Upload your Shopify order CSV and get a simple report on lost revenue, biggest leaks,
                and the fastest fixes. No API required.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Upload My CSV
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-black/10 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  View Demo Report
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">No API required</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">Works with Shopify CSV exports</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-gray-700">Get results in minutes</span>
              </div>
            </div>

            <div className="lg:justify-self-end w-full">
              <div className="bg-white rounded-[28px] border border-black/10 shadow-[0_24px_80px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Sample Output</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Revenue Leak Report</p>
                  </div>
                  <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                    Estimated
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Estimated Revenue Lost</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-gray-950">$12,370<span className="text-base text-gray-500 font-semibold">/month</span></p>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    Repeat purchase is weak, AOV is below potential, and too much revenue depends on one product.
                  </p>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Biggest Leak", value: "Repeat Purchase Drop" },
                      { label: "Quickest Fix", value: "Launch a win-back campaign" },
                      { label: "Recovery Potential", value: "High" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-t border-black/5 first:border-t-0">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-gray-950 text-white">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-semibold">Quick Win</p>
                    <p className="mt-2 text-sm font-semibold">Send a 14-day win-back email to inactive buyers</p>
                    <p className="mt-1 text-xs text-white/60">Potential impact: +$1,200/month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="leaks" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">What This Tool Finds</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Most Shopify stores are leaking revenue without knowing it</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Your order data already tells the story. This tool helps you find the biggest revenue leaks,
                estimate the impact, and see what to fix first.
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
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Upload once. See the leaks. Fix what matters.</h2>
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
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">A report that tells you what is hurting growth</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Not another dashboard. Not a wall of metrics. Just the numbers and actions that help you recover lost revenue.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Estimated Revenue Lost",
                "Top 3 Revenue Leaks",
                "Quick Wins",
                "Revenue Recovery Plan",
                "Priority Actions",
                "PDF Report Download",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-black/8">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 md:py-20 border-t border-black/5 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Simple Pricing</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Start free. Unlock the full report only when you see value.</h2>

            <div className="mt-10 grid md:grid-cols-2 gap-4 text-left">
              <div className="rounded-[24px] border border-black/8 bg-[#fafaf8] p-6">
                <p className="text-lg font-semibold text-gray-950">Free</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">$0</p>
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <p>1 basic analysis</p>
                  <p>Summary view</p>
                  <p>Top leak</p>
                  <p>1 quick win</p>
                </div>
                <Link href="/register" className="mt-8 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                  Try Free
                </Link>
              </div>

              <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-6 ring-1 ring-orange-100">
                <p className="text-lg font-semibold text-gray-950">Full Report</p>
                <div className="mt-2 flex items-end gap-1">
                  <p className="text-4xl font-bold tracking-tight">$19</p>
                  <p className="text-sm text-gray-500 mb-1">one-time</p>
                </div>
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <p>Full revenue leak breakdown</p>
                  <p>All recovery actions</p>
                  <p>Complete recovery plan</p>
                  <p>PDF download</p>
                </div>
                <Link href="/pricing" className="mt-8 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
                  Unlock Full Report
                </Link>
                <p className="mt-3 text-xs text-gray-500">No subscription required</p>
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
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Want to check your own store?</h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Upload your Shopify CSV and get your own revenue leak report in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-gray-100 transition-colors">
                Upload My CSV
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                View Demo Report
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
