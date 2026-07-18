"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dashboardApi, paymentApi, reportsApi, storesApi, uploadApi } from "@/lib/api";
import type { Store, ReportListItem, UsageSummary } from "@/lib/types";
import type { DashboardData, UploadHistoryItem } from "@/lib/api";
import Loading from "@/components/ui/Loading";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

function estimateLostRevenue(report: ReportListItem | null, dashboard: DashboardData | null) {
  const revenue = report?.totalRevenue ?? dashboard?.totalRevenue ?? 0;
  const score = report?.healthScore ?? dashboard?.healthScore ?? 55;
  const lossFactor = Math.max(0.06, ((100 - score) / 100) * 0.28);
  return Math.round((revenue / 6) * lossFactor);
}

function healthStatus(score: number | null | undefined) {
  if (score == null) return { label: "No report yet", tone: "bg-gray-100 text-gray-600" };
  if (score >= 70) return { label: "Stable", tone: "bg-emerald-50 text-emerald-700" };
  if (score >= 40) return { label: "Needs work", tone: "bg-amber-50 text-amber-700" };
  return { label: "At risk", tone: "bg-red-50 text-red-700" };
}

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = Number(params.storeId as string);

  const [store, setStore] = useState<Store | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [uploads, setUploads] = useState<UploadHistoryItem[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(storeId) || storeId <= 0) {
      setError("Invalid store ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [storeRes, dashboardRes, reportsRes, uploadsRes, usageRes] = await Promise.allSettled([
          storesApi.getStore(storeId),
          dashboardApi.getStoreDashboard(storeId),
          reportsApi.getStoreReports(storeId).catch(() => null),
          uploadApi.getUploadHistory(storeId).catch(() => null),
          paymentApi.getUsage().catch(() => null),
        ]);

        if (cancelled) return;

        if (storeRes.status === "fulfilled" && storeRes.value?.data?.code === 200 && storeRes.value.data.data) {
          setStore(storeRes.value.data.data);
        } else {
          setError("Store not found.");
          return;
        }

        if (dashboardRes.status === "fulfilled" && dashboardRes.value?.data?.code === 200 && dashboardRes.value.data.data) {
          setDashboard(dashboardRes.value.data.data);
        }

        if (reportsRes.status === "fulfilled" && reportsRes.value?.data?.code === 200 && reportsRes.value.data.data) {
          setReports(reportsRes.value.data.data);
        }

        if (uploadsRes.status === "fulfilled" && uploadsRes.value?.data?.code === 200 && uploadsRes.value.data.data) {
          setUploads(uploadsRes.value.data.data);
        }

        if (usageRes.status === "fulfilled" && usageRes.value?.data?.code === 200 && usageRes.value.data.data) {
          setUsage(usageRes.value.data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load store details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const latestReport = reports[0] || null;
  const latestUpload = uploads[0] || null;
  const latestReadyReport = uploads.find((item) => item.reportId) || null;
  const estimatedLostRevenue = useMemo(() => estimateLostRevenue(latestReport, dashboard), [latestReport, dashboard]);
  const health = healthStatus(latestReport?.healthScore ?? dashboard?.healthScore ?? null);
  const isFree = usage?.plan === "FREE";

  if (loading) {
    return (
      <div className="flex items-center justify-center px-4 py-24 sm:px-6">
        <Loading size="lg" text="Loading store..." />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error || "Store not available."}</p>
          <Link href="/stores" className="mt-3 inline-flex text-sm font-medium text-red-700 hover:text-red-800">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 sm:px-6">
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/stores" className="hover:text-gray-700">
          Stores
        </Link>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">{store.storeName}</span>
      </nav>

      <section className="mb-8 overflow-hidden rounded-[28px] border border-black/5 bg-white">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Store report center</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                {store.platform}
              </span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${health.tone}`}>{health.label}</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{store.storeName}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              This page now stays focused on one job: open the latest report, upload a fresh CSV, and keep moving toward a better revenue recovery plan.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/stores/${storeId}/upload`}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Upload CSV
              </Link>
              {latestReport && (
                <Link
                  href={`/reports/${latestReport.reportId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Open latest report
                </Link>
              )}
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                All reports
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Est. revenue lost</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{fmtCurrency(estimatedLostRevenue)}</p>
              <p className="mt-1 text-sm text-gray-600">Directional estimate based on report score and revenue</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Latest report</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{latestReport?.healthScore ?? "—"}</p>
              <p className="mt-1 text-sm text-gray-600">{latestReport ? fmtDate(latestReport.createdAt) : "No report generated yet"}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Plan</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{usage?.planDisplay || "Free"}</p>
              <p className="mt-1 text-sm text-gray-600">{isFree ? "Preview first, unlock later" : "Expanded report access"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-gray-100 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Latest report</p>
          {latestReport ? (
            <>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-950">{latestReport.healthScore}</p>
                  <p className="mt-1 text-sm text-gray-600">{fmtDate(latestReport.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${health.tone}`}>{health.label}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-600">{latestReport.summary || "Open the report to review the latest leaks and recovery actions."}</p>
              <Link
                href={`/reports/${latestReport.reportId}`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                View report
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-7 text-gray-600">No report yet. Upload a CSV first to generate the initial diagnosis for this store.</p>
              <Link
                href={`/stores/${storeId}/upload`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Upload first CSV
              </Link>
            </>
          )}
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Store metrics</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#fafaf8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Revenue</p>
              <p className="mt-1 text-lg font-bold text-gray-950">{fmtCurrency(dashboard?.totalRevenue || 0)}</p>
            </div>
            <div className="rounded-2xl bg-[#fafaf8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Orders</p>
              <p className="mt-1 text-lg font-bold text-gray-950">{fmtNumber(dashboard?.totalOrders || 0)}</p>
            </div>
            <div className="rounded-2xl bg-[#fafaf8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Reports</p>
              <p className="mt-1 text-lg font-bold text-gray-950">{reports.length}</p>
            </div>
            <div className="rounded-2xl bg-[#fafaf8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Uploads</p>
              <p className="mt-1 text-lg font-bold text-gray-950">{uploads.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Next action</p>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl bg-[#fafaf8] p-3">
              <p className="text-sm font-semibold text-gray-950">{latestReport ? "Refresh the diagnosis" : "Generate the first diagnosis"}</p>
              <p className="mt-1 text-sm leading-7 text-gray-600">Upload a fresh CSV if you want the report to reflect the latest store performance.</p>
            </div>
            <Link
              href={`/stores/${storeId}/upload`}
              className="inline-flex w-full items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Upload CSV
            </Link>
            {isFree && (
              <Link
                href="/billing"
                className="inline-flex w-full items-center justify-center rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
              >
                Unlock full report
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Recent uploads</p>
              <h2 className="mt-2 text-xl font-bold text-gray-950">Upload activity</h2>
            </div>
            <Link href={`/stores/${storeId}/upload`} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Upload again
            </Link>
          </div>

          {uploads.length > 0 ? (
            <div className="mt-5 space-y-3">
              {uploads.slice(0, 6).map((item) => (
                <div key={item.fileId} className="flex flex-col gap-2 rounded-2xl border border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{item.fileName}</p>
                    <p className="mt-1 text-xs text-gray-500">{fmtDate(item.completedAt || item.uploadedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      item.reportId ? "bg-emerald-50 text-emerald-700" : item.taskStatus === "FAILED" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {item.reportId ? "Report ready" : item.taskStatus || item.status}
                    </span>
                    {item.reportId && (
                      <Link href={`/reports/${item.reportId}`} className="text-sm font-semibold text-gray-900 hover:text-orange-600">
                        View report
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-[#fafaf8] p-6 text-center">
              <p className="text-sm font-semibold text-gray-950">No uploads yet</p>
              <p className="mt-2 text-sm text-gray-600">Upload your first CSV export to create a report for this store.</p>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Report path</p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">What to do next</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">1</span>
              <div>
                <p className="text-sm font-semibold text-gray-950">Upload a clean CSV</p>
                <p className="mt-1 text-sm leading-7 text-gray-600">Use a fresh export from Shopify, WooCommerce, or Amazon.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">2</span>
              <div>
                <p className="text-sm font-semibold text-gray-950">Open the latest report</p>
                <p className="mt-1 text-sm leading-7 text-gray-600">Review the biggest leak, quick wins, and the estimated money lost.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">3</span>
              <div>
                <p className="text-sm font-semibold text-gray-950">Decide whether to unlock</p>
                <p className="mt-1 text-sm leading-7 text-gray-600">Use the preview to validate value, then unlock the full report when needed.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
            <p className="text-sm font-semibold text-gray-950">Latest ready report</p>
            <p className="mt-1 text-sm text-gray-600">
              {latestReadyReport?.reportId ? `Report #${latestReadyReport.reportId} is ready to review.` : "No completed report yet."}
            </p>
            {latestReadyReport?.reportId && (
              <Link
                href={`/reports/${latestReadyReport.reportId}`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Open ready report
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
