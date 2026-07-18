"use client";

import Link from "next/link";

const sections = [
  {
    title: "Service scope",
    body: "StoreAI Doctor provides a CSV-based diagnosis workflow that turns store exports into revenue leak reports, quick wins, and recovery recommendations.",
  },
  {
    title: "User responsibility",
    body: "You are responsible for ensuring you have the right to upload the data you submit and for removing unnecessary sensitive information before upload.",
  },
  {
    title: "Report accuracy",
    body: "Reports are directional product outputs based on the uploaded data and product heuristics. They are meant to support decisions, not replace accounting, legal, or compliance advice.",
  },
  {
    title: "Data retention",
    body: "The service is intended to use uploaded CSV files to generate reports and should not keep original raw files longer than needed for parsing and report generation.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Terms</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Terms of service for the revenue leak checker.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            These terms describe the intended use of the product while the service remains focused on lightweight CSV analysis and report generation.
          </p>

          <div className="mt-8 grid gap-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
                <h2 className="text-lg font-semibold text-gray-950">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Privacy policy
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
