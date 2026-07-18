"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/types";
import Loading from "@/components/ui/Loading";

const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboard();
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch admin dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Admin Overview</h1>
        <p className="text-xs text-gray-400">
          Platform operations at a glance
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {stats && (
        <>
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 border-l-[3px] border-l-blue-500 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalUsers)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 border-l-[3px] border-l-purple-500 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Stores
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalStores)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 border-l-[3px] border-l-emerald-500 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Reports Generated
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalReports)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 border-l-[3px] border-l-orange-500 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Monthly Revenue (MRR)
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Active Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalSubscriptions)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                AI Tasks Processed
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalTasks)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Today&apos;s Uploads
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.todayUploads)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Today&apos;s New Users
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.todayNewUsers)}
              </p>
            </div>
          </div>

          {/* Tertiary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Webhook Logs
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.totalWebhookLogs)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Today&apos;s Payments
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">
                {fmtNumber(stats.todayPayments)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Average Store Health
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">72</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-950 mt-1">8.2%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All Users
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Manage Subscriptions
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/admin/logs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View System Logs
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}