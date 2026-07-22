"use client";

import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/lib/api";
import { PLANS, type PlanId } from "@/lib/planConfig";
import { useEffect, useState } from "react";
import Link from "next/link";
import UnlockButton from "@/components/payment/UnlockButton";

const CARD_CLASS = "bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

export default function PricingPage() {
  const { user, isLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      async function fetchPlan() {
        try {
          const res = await paymentApi.getUsage();
          if (res.data.code === 200 && res.data.data) {
            const plan = res.data.data.plan as PlanId;
            setCurrentPlan(plan);
          }
        } catch { /* silent */ }
      }
      fetchPlan();
    }
  }, [isLoading, user]);

  const plans = PLANS.filter((p) => p.id === "FREE" || p.id === "PRO");

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight mb-3">Start With a Free Audit</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          See your revenue score, estimated opportunity, and first recovery actions before paying anything.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Link href="/demo" className="text-sm font-semibold text-orange-600 hover:text-orange-700">See Example Report</Link>
          <span className="text-gray-300">·</span>
          <Link href="/register" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Try Free Audit</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === "FREE"
            ? currentPlan === "FREE"
            : currentPlan === "PRO" || currentPlan === "STARTER";
          const isPaid = plan.id === "PRO";
          
          return (
            <div key={plan.id} className={`${CARD_CLASS} relative overflow-hidden ${isPaid ? "border-orange-200 ring-2 ring-orange-500/20" : ""}`}>
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-br-lg uppercase">
                  Current
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.id === "FREE" ? "Free Audit" : "Full Recovery Plan"}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  {plan.id === "FREE"
                    ? "See the core opportunity before you decide to unlock the full plan."
                    : "Unlock the full revenue breakdown, action plan, calculation details, and email templates."}
                </p>

                <div className="mb-5">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-400">$</span>
                      <span className="text-3xl font-bold text-gray-900">19</span>
                      <span className="text-sm text-gray-400">one-time</span>
                    </div>
                  )}
                </div>

                {isCurrentPlan ? (
                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gray-100 py-2.5 text-xs font-semibold text-gray-400 cursor-default"
                  >
                    Current Plan
                  </Link>
                ) : plan.id === "FREE" ? (
                  <Link
                    href="/register"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gray-900 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Get Free Audit
                  </Link>
                ) : (
                  <UnlockButton
                    label="Unlock Full Recovery Plan"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-orange-500 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                )}

                <div className="mt-5 space-y-2 text-xs text-gray-600">
                  {plan.id === "FREE" ? (
                    <>
                      <div className="flex items-center justify-between"><span>Revenue Health Score</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Estimated opportunity</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Top revenue gap</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Quick wins</span><span className="font-semibold text-gray-900">3</span></div>
                      <div className="flex items-center justify-between"><span>Benchmark comparison</span><span className="font-semibold text-gray-900">1</span></div>
                      <div className="flex items-center justify-between"><span>Recovery plan preview</span><span className="font-semibold text-gray-900">Included</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between"><span>Full opportunity breakdown</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Calculation details</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Recovery actions</span><span className="font-semibold text-gray-900">All</span></div>
                      <div className="flex items-center justify-between"><span>Recovery roadmap</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Email Recovery Kit</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>PDF report download</span><span className="font-semibold text-gray-900">Included</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${CARD_CLASS} p-5 md:p-6`}>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Compare Access</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">What you see for free vs what you unlock for $19</h2>
          <p className="mt-2 text-sm text-gray-600">
            The free audit proves there is value. The paid plan gives you the full roadmap to recover it.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="py-3 pr-4 font-semibold">Feature</th>
                <th className="py-3 px-4 font-semibold">Free Audit</th>
                <th className="py-3 pl-4 font-semibold">Full Recovery Plan</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                ["Revenue Health Score", "Included", "Included"],
                ["Estimated revenue opportunity", "Included", "Included"],
                ["Top gap summary", "Included", "Included"],
                ["Benchmark comparison", "1 key benchmark", "Full context"],
                ["Recovery actions", "Preview only", "Full prioritized list"],
                ["Calculation details", "—", "Included"],
                ["Email Recovery Kit", "Preview only", "Included"],
                ["PDF export", "—", "Included"],
              ].map(([feature, free, paid]) => (
                <tr key={feature} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-3 pr-4 font-medium text-gray-900">{feature}</td>
                  <td className="py-3 px-4">{free}</td>
                  <td className="py-3 pl-4">{paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Use free first",
            body: "Start with the free audit to see if your store has a meaningful revenue opportunity.",
          },
          {
            title: "Unlock only if useful",
            body: "Pay once when you want the full explanation, roadmap, and recovery templates.",
          },
          {
            title: "No recurring SaaS tax",
            body: "This is built like a revenue audit you can use on demand, not another monthly subscription.",
          },
        ].map((item) => (
          <div key={item.title} className={`${CARD_CLASS} p-5`}>
            <p className="text-sm font-semibold text-gray-950">{item.title}</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400">One-time payment. No subscription required. Use it when you need a revenue audit, not another monthly SaaS.</p>
      </div>
    </div>
  );
}
