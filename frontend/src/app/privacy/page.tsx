"use client";

import Link from "next/link";

const items = [
  {
    title: "What we collect",
    body: "We collect account details needed to run the product, store metadata you create inside the app, and CSV content required to generate reports.",
  },
  {
    title: "How CSV uploads are used",
    body: "CSV files are used to parse order and store performance data so the app can generate a diagnosis report, estimated revenue loss, and recommended actions.",
  },
  {
    title: "What we avoid",
    body: "We should avoid storing unnecessary personally identifiable information, avoid logging customer IDs or order IDs, and avoid keeping original CSV files longer than needed after parsing and report generation.",
  },
  {
    title: "Your control",
    body: "You can contact support if you need clarification about uploaded data, account data, or report retention behavior.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Privacy</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Privacy policy for the CSV-based revenue leak workflow.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            StoreAI Doctor is designed to keep setup lightweight. The product uses CSV uploads to generate diagnosis reports and should minimize the amount of sensitive data it stores.
          </p>

          <div className="mt-8 grid gap-4">
            {items.map((item) => (
              <section key={item.title} className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
                <h2 className="text-lg font-semibold text-gray-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{item.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <p className="text-sm font-semibold text-gray-950">Operational note</p>
            <p className="mt-2 text-sm leading-7 text-gray-700">
              If you upload ecommerce exports, review them before upload and remove fields you do not need. This product is intended to focus on diagnosis, not long-term storage of raw customer data.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Create account
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
