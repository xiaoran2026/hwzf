"use client";

import Link from "next/link";
import UnlockButton from "@/components/payment/UnlockButton";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Checkout cancelled</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
          Your full report is still waiting for you.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
          No charge was completed. You can return to checkout anytime, or keep reviewing the preview until you are ready.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[28px] border border-black/5 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Still available</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">Report preview</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">You can keep reviewing the summary, top leak, and quick win before paying.</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">When ready</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">One-time unlock</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">Return to checkout when the value is clear. No subscription required.</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Fastest next step</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">Open demo or report</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">Review the recovery plan preview, then decide if you want the full breakdown.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <UnlockButton
                label="Try checkout again"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View demo report
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Back to billing
              </Link>
            </div>
          </section>

          <aside className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">Full report unlock</p>
            <h2 className="mt-3 text-xl font-bold text-gray-950">$19 one-time</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">
              Unlock all leak findings, every recovery action, and the complete revenue recovery plan.
            </p>
            <div className="mt-5 space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Top leaks</span>
                <span className="font-semibold text-gray-950">All</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recovery actions</span>
                <span className="font-semibold text-gray-950">All</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PDF download</span>
                <span className="font-semibold text-gray-950">Included</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
