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
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight mb-3">Simple Pricing</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Start free. Unlock the full revenue leak report only when you see value.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Link href="/demo" className="text-sm font-semibold text-orange-600 hover:text-orange-700">View Demo Report</Link>
          <span className="text-gray-300">·</span>
          <Link href="/register" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Try Free First</Link>
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
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.id === "FREE" ? "Free" : "Full Report"}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  {plan.id === "FREE"
                    ? "See the summary, top leak, and one quick win."
                    : "Unlock the full revenue leak breakdown, recovery actions, and PDF download."}
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
                    Try Free
                  </Link>
                ) : (
                  <UnlockButton
                    label="Unlock Full Report"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-orange-500 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                )}

                <div className="mt-5 space-y-2 text-xs text-gray-600">
                  {plan.id === "FREE" ? (
                    <>
                      <div className="flex items-center justify-between"><span>Report previews</span><span className="font-semibold text-gray-900">1</span></div>
                      <div className="flex items-center justify-between"><span>Summary view</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Top leak</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Quick win</span><span className="font-semibold text-gray-900">1</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between"><span>Full leak breakdown</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>Recovery actions</span><span className="font-semibold text-gray-900">All</span></div>
                      <div className="flex items-center justify-between"><span>Revenue recovery plan</span><span className="font-semibold text-gray-900">Included</span></div>
                      <div className="flex items-center justify-between"><span>PDF report download</span><span className="font-semibold text-gray-900">Included</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400">No subscription required for the full report unlock.</p>
      </div>
    </div>
  );
}
