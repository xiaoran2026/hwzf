"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { paymentApi } from "@/lib/api";
import type { UsageSummary } from "@/lib/types";
import Loading from "@/components/ui/Loading";

interface StoreItem {
  storeId: number;
  storeName: string;
  platform: string;
  createdAt: string;
  healthScore: number | null;
  totalReports: number | null;
  latestUploadDate: string | null;
  lastAnalysisDate: string | null;
  totalRevenue: number | null;
  totalOrders: number | null;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return d;
  }
};

function platformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("shopify")) {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  if (p.includes("amazon")) {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function healthStatus(score: number | null) {
  if (score === null) return { label: "No report yet", tone: "bg-gray-100 text-gray-600" };
  if (score >= 70) return { label: "Stable", tone: "bg-emerald-50 text-emerald-700" };
  if (score >= 40) return { label: "Needs work", tone: "bg-amber-50 text-amber-700" };
  return { label: "At risk", tone: "bg-red-50 text-red-700" };
}

function estimateLostRevenue(store: StoreItem) {
  const revenue = store.totalRevenue || 0;
  const score = store.healthScore ?? 55;
  const lossFactor = Math.max(0.06, ((100 - score) / 100) * 0.28);
  return Math.round((revenue / 6) * lossFactor);
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const isFree = usage?.plan === "FREE";

  const summary = useMemo(() => {
    const totalReports = stores.reduce((sum, store) => sum + (store.totalReports || 0), 0);
    const activeStores = stores.filter((store) => (store.totalReports || 0) > 0).length;
    const totalLostRevenue = stores.reduce((sum, store) => sum + estimateLostRevenue(store), 0);

    return {
      totalReports,
      activeStores,
      totalLostRevenue,
    };
  }, [stores]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [storeRes, usageRes] = await Promise.allSettled([api.get("/stores"), paymentApi.getUsage()]);

        if (!cancelled && storeRes.status === "fulfilled" && storeRes.value.data.code === 200) {
          setStores(storeRes.value.data.data || []);
        }

        if (!cancelled && usageRes.status === "fulfilled" && usageRes.value.data.code === 200) {
          setUsage(usageRes.value.data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load stores.");
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
  }, []);

  return (
    <div className="max-w-6xl px-4 sm:px-6">
      <section className="mb-8 overflow-hidden rounded-[28px] border border-black/5 bg-white">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Upload workflow</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Choose a store, upload a CSV, and generate a revenue leak report.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              This page now works as a simple store hub. Pick the store you want to analyze, jump into uploads, or review reports without the old store management noise.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {usage?.canCreateStore && (
                <Link
                  href="/stores/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add store
                </Link>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View pricing
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Data privacy
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Stores</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{stores.length}</p>
              <p className="mt-1 text-sm text-gray-600">{usage ? `${usage.planDisplay} plan` : "Current workspace"}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Reports</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{summary.totalReports}</p>
              <p className="mt-1 text-sm text-gray-600">{summary.activeStores} store(s) already analyzed</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Est. revenue lost</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{fmtCurrency(summary.totalLostRevenue)}</p>
              <p className="mt-1 text-sm text-gray-600">Across the stores listed here</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-black/5 px-6 py-5 text-sm text-gray-600 sm:px-8 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">1</span>
            <p>Select the store you want to review.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">2</span>
            <p>Upload a fresh CSV from Shopify, WooCommerce, or Amazon.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">3</span>
            <p>Open the report and decide whether to unlock the full growth plan.</p>
          </div>
        </div>
      </section>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-950">Your stores</h2>
          <p className="mt-0.5 text-sm text-gray-500">Upload new CSVs or review the latest diagnosis for each store.</p>
        </div>
        <div className="flex items-center gap-2">
          {usage && (
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              {usage.planDisplay} · {usage.storeCount}
              {usage.unlimitedStores ? "" : ` / ${usage.storeLimit}`}
            </span>
          )}
          {usage?.canCreateStore && (
            <Link
              href="/stores/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add store
            </Link>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loading text="Loading stores..." />
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">No stores yet</p>
          <p className="mt-2 text-sm text-gray-500">Create a store shell first, then upload a CSV to generate your first report.</p>
          {usage?.canCreateStore && (
            <Link
              href="/stores/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first store
            </Link>
          )}
        </div>
      )}

      {!loading && !error && stores.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => {
            const status = healthStatus(store.healthScore);
            const estimatedLostRevenue = estimateLostRevenue(store);

            return (
              <div key={store.storeId} className="rounded-[24px] border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                        {platformIcon(store.platform)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">{store.storeName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                            {store.platform}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status.tone}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Health</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">{store.healthScore ?? "—"}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fafaf8] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Reports</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">{store.totalReports ?? 0}</p>
                    <p className="mt-1 text-xs text-gray-500">Latest upload {fmtDate(store.latestUploadDate)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fafaf8] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Est. lost</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">{fmtCurrency(estimatedLostRevenue)}</p>
                    <p className="mt-1 text-xs text-gray-500">Based on current score and revenue</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/stores/${store.storeId}/upload`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Upload CSV
                  </Link>
                  <Link
                    href={`/stores/${store.storeId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3.5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Open store
                  </Link>
                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3.5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    View reports
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {store.totalRevenue != null && store.totalRevenue > 0 && <span>{fmtCurrency(store.totalRevenue)} revenue</span>}
                  {store.totalOrders != null && store.totalOrders > 0 && <span>{fmtNumber(store.totalOrders)} orders</span>}
                  <span>Last report {fmtDate(store.lastAnalysisDate)}</span>
                </div>
              </div>
            );
          })}

          {usage?.canCreateStore ? (
            <Link href="/stores/new" className="group flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white transition-all hover:border-gray-300">
              <svg className="h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Add another store</span>
              <span className="mt-1 text-xs text-gray-500">Create a store shell before uploading its CSV</span>
            </Link>
          ) : (
            <Link href="/billing" className="group flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-orange-200 bg-orange-50/60 transition-all hover:border-orange-300 hover:bg-orange-50">
              <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="mt-2 text-sm font-semibold text-orange-700">Unlock more stores</span>
              <span className="mt-1 text-xs text-orange-600">Upgrade when you want more uploads and reports</span>
            </Link>
          )}
        </div>
      )}

      {!loading && !error && isFree && stores.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-orange-800">
              Free plan keeps this lightweight: one store, one report preview, and a simple diagnosis. Upgrade when you want more uploads or a deeper recovery plan.
            </p>
          </div>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Unlock full report
          </Link>
        </div>
      )}
    </div>
  );
}
