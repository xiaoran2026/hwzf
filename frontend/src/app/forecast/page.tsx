import Link from "next/link";

export default function ForecastPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Forecast</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Forecast is not part of the MVP path.
          </h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            For validation, the product stays focused on revenue leak diagnosis from CSV uploads. Forecasting can be added later if users repeatedly ask for it.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
              <h2 className="text-lg font-semibold text-gray-950">Get a diagnosis instead</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">Upload a CSV and generate a revenue leak report.</p>
              <Link
                href="/stores"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Upload CSV
              </Link>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
              <h2 className="text-lg font-semibold text-gray-950">Review recovery actions</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">Open your report to see leaks, quick wins, and the recovery plan.</p>
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
