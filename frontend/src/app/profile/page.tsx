"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/lib/api";
import type { UsageSummary } from "@/lib/types";

const fmtDate = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await paymentApi.getUsage().catch(() => null);
        if (!cancelled && res?.data?.code === 200 && res.data.data) {
          setUsage(res.data.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const seed = user?.email || "U";
    return seed.slice(0, 2).toUpperCase();
  }, [user?.email]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Account</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Keep your account simple and your data path clear.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                This product stays intentionally small: create a store, upload a CSV, review the revenue leak report, and decide when to unlock the full plan.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/stores"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Go to stores
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  View pricing
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Data privacy
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Plan</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{usage?.planDisplay || user?.plan || "Free"}</p>
                <p className="mt-1 text-sm text-gray-600">Use preview access first, then unlock when the report proves value.</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Store slots</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{usage?.storeCount ?? "—"}</p>
                <p className="mt-1 text-sm text-gray-600">{usage ? `${usage.remainingStoreSlots} slots remaining` : "Usage info loading"}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Uploads</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{usage?.uploadCount ?? "—"}</p>
                <p className="mt-1 text-sm text-gray-600">{usage ? `${usage.remainingUploads} uploads remaining` : "Usage info loading"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Identity</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-lg font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-950">{user?.email || "Unknown user"}</p>
                <p className="mt-1 text-sm text-gray-600">Account ID: {user?.id ?? "—"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p>Role: {user?.role || "User"}</p>
              <p>Member since: {fmtDate(user?.createdTime)}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Trust</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-[#fafaf8] p-4">
                <p className="text-sm font-semibold text-gray-950">CSV-first workflow</p>
                <p className="mt-1 text-sm leading-7 text-gray-600">No Shopify API connection is required for the core diagnosis flow.</p>
              </div>
              <div className="rounded-2xl bg-[#fafaf8] p-4">
                <p className="text-sm font-semibold text-gray-950">Minimal retention</p>
                <p className="mt-1 text-sm leading-7 text-gray-600">Uploaded CSV files are only used to generate reports and should not be kept longer than needed.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Actions</p>
            <div className="mt-4 space-y-3">
              <Link
                href="/billing"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Unlock full report
              </Link>
              <Link
                href="/terms"
                className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Terms
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500">
          <span>{loading ? "Loading usage..." : "Account center ready"}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms
            </Link>
            <a href="mailto:wen.dyens0038@gmail.com" className="hover:text-gray-900">
              Support
            </a>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
