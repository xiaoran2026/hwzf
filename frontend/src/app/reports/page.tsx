"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { reportsApi } from "@/lib/api";
import type { ReportListItem } from "@/lib/types";
import Loading from "@/components/ui/Loading";

const fmtCurrency = (n?: number) =>
  n == null || isNaN(n)
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return value;
  }
}

function estimateLostRevenue(report: ReportListItem) {
  const revenue = report.totalRevenue || 0;
  const scorePenalty = Math.max(0.05, ((100 - (report.healthScore || 0)) / 100) * 0.3);
  return Math.round((revenue / 6) * scorePenalty);
}

function topLeakText(report: ReportListItem) {
  const summary = (report.summary || "").toLowerCase();
  if (summary.includes("repeat") || summary.includes("retention")) return "Repeat purchase leak";
  if (summary.includes("bundle") || summary.includes("upsell") || summary.includes("aov")) return "Low AOV opportunity";
  if (summary.includes("product")) return "Product concentration risk";
  return "Revenue leak detected";
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportsApi.getReports();
      if (res.data.code === 200 && res.data.data) {
        setReports(res.data.data);
      } else {
        setError(res.data.message || "Failed to load reports.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? reports.filter((report) =>
          report.storeName?.toLowerCase().includes(q) ||
          report.fileName?.toLowerCase().includes(q) ||
          report.summary?.toLowerCase().includes(q)
        )
      : reports;

    return [...list].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [reports, query]);

  const latestReport = filtered[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">History</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">My Revenue Leak Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review your latest reports, compare leak estimates, and reopen the next action to take.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors"
          >
            Upload New CSV
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="py-16 flex items-center justify-center">
          <Loading size="lg" text="Loading reports..." />
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-950">No reports yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload a Shopify CSV to generate your first revenue leak report.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/stores" className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors">
              Upload CSV
            </Link>
            <Link href="/demo" className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors">
              View Demo Report
            </Link>
          </div>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-6">
          {latestReport && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Latest Report</p>
              <div className="mt-4 grid lg:grid-cols-[1fr_0.9fr] gap-6 items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                    {latestReport.storeName || "Store"} · {fmtCurrency(estimateLostRevenue(latestReport))}/month estimated revenue lost
                  </h2>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
                    {latestReport.summary || "Open the latest report to see the full leak breakdown and recovery actions."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/reports/${latestReport.reportId}`}
                      className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors"
                    >
                      Open Latest Report
                    </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-orange-500 font-semibold">Next Action</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">
                      {topLeakText(latestReport) === "Repeat purchase leak"
                        ? "Launch a win-back campaign and review returning customer behavior."
                        : topLeakText(latestReport) === "Low AOV opportunity"
                          ? "Test one bundle offer and one upsell message on top products."
                          : "Reduce dependence on the top product and promote complementary products."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Top Leak</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">{topLeakText(latestReport)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Health Score</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">{latestReport.healthScore}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">All Reports</p>
                <p className="mt-1 text-sm text-gray-600">{filtered.length} report{filtered.length === 1 ? "" : "s"}</p>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5"
              />
            </div>

            <div className="mt-5 space-y-3">
              {filtered.map((report) => (
                <div key={report.reportId} className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-950">{report.storeName || "Store"}</p>
                        <span className="text-xs text-gray-500">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {report.summary || "Revenue leak report generated from uploaded store data."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>Estimated lost revenue: {fmtCurrency(estimateLostRevenue(report))}/month</span>
                        <span>Top leak: {topLeakText(report)}</span>
                        <span>Health score: {report.healthScore}</span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        Next action: {topLeakText(report) === "Repeat purchase leak"
                          ? "Launch a win-back email and monitor repeat purchase rate."
                          : topLeakText(report) === "Low AOV opportunity"
                            ? "Test a bundle or upsell on top-selling products."
                            : "Promote complementary products and reduce top-product concentration."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/reports/${report.reportId}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
                      >
                        View Report
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
