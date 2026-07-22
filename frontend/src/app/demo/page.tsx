"use client";

import Link from "next/link";
import UnlockButton from "@/components/payment/UnlockButton";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const demo = {
  storeName: "Demo Store",
  healthScore: 62,
  estimatedLostRevenue: 12370,
  biggestLeak: "Repeat Purchase Drop",
  quickestFix: "Launch a win-back campaign",
  recoveryPotential: "High",
  summary:
    "This store is generating consistent orders, but repeat purchase is weak, average order value is below potential, and too much revenue depends on one product.",
  leaks: [
    {
      priority: "P1",
      title: "Repeat Purchase Is Lower Than Expected",
      impact: 4250,
      difficulty: "Medium",
      time: "2 hours",
      why: "A large share of customers purchase once and do not return within the expected buying cycle.",
      action: "Launch a 14-day and 30-day win-back email sequence for past buyers.",
    },
    {
      priority: "P2",
      title: "Average Order Value Is Below Potential",
      impact: 3180,
      difficulty: "Medium",
      time: "1 day",
      why: "Top-selling products are usually purchased alone, with no strong bundle or upsell offer.",
      action: "Create a simple 2-product bundle using the top-selling products and test a cart upsell message.",
    },
    {
      priority: "P2",
      title: "Revenue Depends Too Much on One Product",
      impact: 2940,
      difficulty: "Medium",
      time: "2-3 days",
      why: "One product drives a high percentage of total revenue, which limits product mix growth and increases risk.",
      action: "Push two complementary products through email, collection pages, and post-purchase recommendations.",
    },
  ],
  quickWins: [
    { title: "Send a win-back email to customers inactive for 30-45 days", impact: 1200, difficulty: "Easy", time: "1-2 hours" },
    { title: "Bundle the top 2 products to increase order value", impact: 980, difficulty: "Easy", time: "2-4 hours" },
    { title: "Test a higher free-shipping threshold", impact: 640, difficulty: "Easy", time: "1 hour" },
  ],
};

export default function DemoPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.18em]">Example Report</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold text-gray-950 tracking-tight">
          See What a Revenue Recovery Audit Looks Like
        </h1>
        <p className="mt-4 text-base text-gray-600 max-w-3xl leading-relaxed">
          This example shows the kind of revenue opportunities, benchmark gaps, and recovery actions you will see after uploading your Shopify orders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
            Get Free Audit
          </Link>
          <UnlockButton
            label="Unlock Full Recovery Plan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Sample audit</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold text-gray-950 tracking-tight">
          You may be missing {fmtCurrency(demo.estimatedLostRevenue)}/month in revenue opportunity
        </h1>
        <p className="mt-4 text-base text-gray-600 max-w-3xl leading-relaxed">
          {demo.summary} This is a sample audit based on demo store data. Your actual numbers will depend on your uploaded order history.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Revenue Health Score</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{demo.healthScore} / 100</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Main Opportunity</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{demo.biggestLeak}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Quickest Win</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{demo.quickestFix}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Recovery Potential</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{demo.recoveryPotential}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">How We Calculated This</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Your Repeat Purchase Rate", value: "18%" },
              { label: "Estimated Healthy Benchmark", value: "32%" },
              { label: "Gap", value: "14%" },
              { label: "Average Order Value", value: "$42" },
              { label: "Retention Opportunity", value: "+$4,250/month" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-gray-950">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Benchmark Comparison</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            {[
              {
                title: "Repeat Purchase Rate",
                current: "18%",
                benchmark: "32%",
                progress: 56,
                note: "This store is missing repeat revenue because too many first-time buyers never return.",
              },
              {
                title: "Average Order Value",
                current: "$42",
                benchmark: "$50",
                progress: 84,
                note: "There is room to lift AOV through bundles, thresholds, and simple upsell offers.",
              },
              {
                title: "Top Product Concentration",
                current: "41%",
                benchmark: "29% or lower",
                progress: 70,
                note: "Revenue depends too heavily on one product, which limits product mix growth.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{item.current}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Benchmark</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-600">{item.benchmark}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-emerald-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Top Revenue Opportunities</h2>
          <div className="space-y-4">
            {demo.leaks.map((p) => (
              <div key={p.title} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-900 text-white">{p.priority}</span>
                      <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-2 mb-4">
                      <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Impact</p>
                        <p className="text-[13px] font-semibold text-emerald-600">+{fmtCurrency(p.impact)}/month</p>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Difficulty</p>
                        <p className="text-[13px] font-semibold text-gray-900">{p.difficulty}</p>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Estimated Time</p>
                        <p className="text-[13px] font-semibold text-gray-900">{p.time}</p>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Action</p>
                        <p className="text-[13px] font-semibold text-orange-600">Recovery Ready</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">Why This Matters:</span> {p.why}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">Recommended Action:</span> {p.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Fastest Recovery Actions</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {demo.quickWins.map((item) => (
              <div key={item.title} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">{item.title}</p>
                <p className="mt-3 text-xs text-gray-500">Potential Impact</p>
                <p className="text-sm font-semibold text-emerald-600">+{fmtCurrency(item.impact)}/month</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.difficulty}</span>
                  <span>{item.time}</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">Use this this week to test recovery potential.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Revenue Recovery Plan</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Now</p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>Launch a 14-day win-back campaign</li>
                <li>Create one bundle offer for top-selling products</li>
                <li>Add a simple cart upsell message</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Next</p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>Promote complementary products in email</li>
                <li>Track returning customer rate weekly</li>
                <li>Compare AOV before and after bundle launch</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Later</p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>Reduce dependency on the top product</li>
                <li>Build a repeat purchase playbook</li>
                <li>Improve product mix across categories</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Email Recovery Kit</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "14-Day Win-Back Email",
                subject: "We miss you - here is something for your next order",
                goal: "Bring recent one-time buyers back quickly",
              },
              {
                title: "30-Day Reminder Offer",
                subject: "A special offer for your next purchase",
                goal: "Recover customers before they fully churn",
              },
              {
                title: "60-Day Last Chance Campaign",
                subject: "Still interested? Here is a final reason to come back",
                goal: "Reactivate colder customers with a stronger hook",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Subject</p>
                <p className="mt-1 text-sm text-gray-800">{item.subject}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Goal</p>
                <p className="mt-1 text-sm text-gray-700">{item.goal}</p>
                <div className="mt-4 rounded-xl bg-white border border-gray-100 p-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Hi {"{{first_name}}"}, we noticed it has been a while since your last order. If you have been thinking about coming back, here is a small reason to do it today.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-950">Unlock Your Full Recovery Plan</h2>
            <p className="mt-2 text-sm text-gray-600">
              See all recovery opportunities, calculation details, and the complete email recovery kit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <UnlockButton
              label="Unlock Full Recovery Plan - $19"
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-black/5">
              Get Free Audit
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

