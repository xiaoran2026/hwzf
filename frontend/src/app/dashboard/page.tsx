"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dashboardApi } from "@/lib/api";

type DashboardStoreItem = {
  storeId: number;
  storeName: string;
  platform: string;
  latestHealthScore: number | null;
  reportCount: number;
  createdAt: string;
};

type DashboardData = {
  storeId: number;
  storeName: string;
  healthScore: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  repeatRate: number;
  summary: string;
  latestReport: { reportId: number; healthScore: number; createdAt: string } | null;
  latestUpload: { fileName: string; createdAt: string; report?: { reportId: number; healthScore: number; createdAt: string } } | null;
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function estimateOpportunityFromDashboard(data: DashboardData | null) {
  if (!data) return 0;
  const monthlyRevenue = Math.max(0, data.totalRevenue / 6);
  const repeatPenalty = data.repeatRate < 35 ? 0.08 : 0.03;
  const scorePenalty = ((100 - data.healthScore) / 100) * 0.55;
  const factor = Math.min(0.35, Math.max(0.05, scorePenalty + repeatPenalty));
  return Math.round(monthlyRevenue * factor);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return value;
  }
}

function healthLabel(score: number | null | undefined) {
  if (score == null) return "No score";
  if (score >= 70) return "Healthy";
  if (score >= 45) return "Needs attention";
  return "At risk";
}

export default function DashboardPage() {
  const [stores, setStores] = useState<DashboardStoreItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    const res = await dashboardApi.getStores();
    if (res.data.code === 200 && res.data.data) {
      setStores(res.data.data);
      if (!activeStoreId && res.data.data.length > 0) {
        setActiveStoreId(res.data.data[0].storeId);
      }
      return res.data.data;
    }
    return [];
  }, [activeStoreId]);

  const fetchDashboard = useCallback(async (storeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStoreDashboard(storeId);
      if (res.data.code === 200 && res.data.data) {
        setData(res.data.data as DashboardData);
      } else {
        setError(res.data.message || "Failed to load dashboard.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores()
      .then((list) => {
        if (list.length > 0) fetchDashboard(list[0].storeId);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fetchStores, fetchDashboard]);

  useEffect(() => {
    if (activeStoreId) fetchDashboard(activeStoreId);
  }, [activeStoreId, fetchDashboard]);

  const activeStore = useMemo(
    () => stores.find((store) => store.storeId === activeStoreId) || null,
    [stores, activeStoreId]
  );

  const estimatedOpportunity = useMemo(() => estimateOpportunityFromDashboard(data), [data]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Report Center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Your Revenue Recovery Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            See your latest revenue opportunity, biggest growth blocker, and next recovery action.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stores.length > 1 && (
            <select
              value={activeStoreId || ""}
              onChange={(e) => setActiveStoreId(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5"
            >
              {stores.map((store) => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName}
                </option>
              ))}
            </select>
          )}
          {activeStoreId && (
            <Link
              href={`/stores/${activeStoreId}/upload`}
              className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors"
            >
              Upload New Store Data
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && stores.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-950">No audit yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload your Shopify orders to see your revenue score, missed growth opportunities, and first recovery actions.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/stores" className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors">
              Get Free Audit
            </Link>
            <Link href="/demo" className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors">
              See Example Report
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      )}

      {!loading && data && activeStore && (
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Latest Store Summary</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">{activeStore.storeName}</h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {data.summary || "Upload data to see revenue leak findings and recovery actions."}
                </p>

                <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-orange-500 font-semibold">Estimated Opportunity</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">{fmtCurrency(estimatedOpportunity)}/month</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Latest Report</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">
                      {data.latestReport ? formatDate(data.latestReport.createdAt) : "No report yet"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Health Score</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">
                      {data.healthScore || 0} · {healthLabel(data.healthScore)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Reports</p>
                    <p className="mt-2 text-sm font-semibold text-gray-950">{activeStore.reportCount}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {data.latestReport && (
                    <Link
                      href={`/reports/${data.latestReport.reportId}`}
                      className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors"
                    >
                      Open Latest Audit
                    </Link>
                  )}
                  <Link
                    href={`/stores/${activeStore.storeId}/upload`}
                    className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Upload New Store Data
                  </Link>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-gray-100 bg-white sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Latest Opportunity Summary</p>
                  <p className="mt-2 text-sm font-semibold text-gray-950">
                    Main opportunity: {data.repeatRate < 35 ? "Improve repeat purchase rate" : "Increase average order value"}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Next action: {data.repeatRate < 35 ? "Launch a win-back email campaign and monitor returning customer rate." : "Test one bundle offer and one upsell message on top-selling products."}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Revenue</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{fmtCurrency(data.totalRevenue || 0)}</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Orders</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{data.totalOrders || 0}</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Average Order Value</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{fmtCurrency(data.averageOrderValue || 0)}</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Repeat Rate</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{(data.repeatRate || 0).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-[1fr_1fr] gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Recent Upload</p>
              <div className="mt-4">
                {data.latestUpload ? (
                  <>
                    <p className="text-sm font-semibold text-gray-950">{data.latestUpload.fileName}</p>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(data.latestUpload.createdAt)}</p>
                    {data.latestUpload.report?.reportId && (
                      <Link
                        href={`/reports/${data.latestUpload.report.reportId}`}
                        className="mt-4 inline-flex items-center text-sm font-semibold text-gray-900 hover:text-gray-700"
                      >
                        Open generated report
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">No upload yet for this store.</p>
                    <Link
                      href={`/stores/${activeStore.storeId}/upload`}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-gray-900 hover:text-gray-700"
                    >
                      Upload your first CSV
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Other Stores</p>
              <div className="mt-4 space-y-3">
                {stores.slice(0, 4).map((store) => (
                  <div key={store.storeId} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{store.storeName}</p>
                      <p className="text-xs text-gray-500 mt-1">{store.platform || "Store"} · {store.reportCount} reports</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStoreId(store.storeId)}
                      className="text-sm font-semibold text-gray-900 hover:text-gray-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
