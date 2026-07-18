import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Products</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Product diagnosis is included in the revenue leak report.
          </h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Instead of a separate product analytics module, the MVP focuses on a single output: a report that highlights the biggest leaks, quick wins, and a recovery plan based on your CSV.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
              <h2 className="text-lg font-semibold text-gray-950">Upload new data</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">Refresh your diagnosis by uploading a new CSV export.</p>
              <Link
                href="/stores"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Upload CSV
              </Link>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
              <h2 className="text-lg font-semibold text-gray-950">Review reports</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">See product-related leaks and top items inside your report.</p>
              <Link
                href="/reports"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View reports
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Demo report
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
