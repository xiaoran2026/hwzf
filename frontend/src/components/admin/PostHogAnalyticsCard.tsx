"use client";

import { useState } from "react";
import type { AdminSystemSettings } from "@/lib/types";
import { adminApi } from "@/lib/api";

interface Props {
  data: AdminSystemSettings | null;
  loading: boolean;
  onRefresh: () => void;
}

const EVENT_LABELS: Record<string, string> = {
  page_views: "Page Views",
  sign_ups: "Sign Ups",
  payments: "Payments",
  csv_uploads: "CSV Uploads",
  ai_reports: "AI Reports",
  store_created: "Store Created",
  subscription_upgrade: "Subscription Upgrade",
  api_calls: "API Calls",
};

export default function PostHogAnalyticsCard({ data, loading, onRefresh }: Props) {
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const connected = data?.posthogEnabled && !!data?.posthogProjectId;
  const events = data?.posthogEvents || {};

  const handleVerify = async () => {
    setVerifyLoading(true);
    setToast(null);
    try {
      const res = await adminApi.verifyPostHog();
      setToast(res.data.data || "Connection verified successfully.");
    } catch {
      setToast("Connection verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-28 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Analytics</h2>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            Disconnected
          </span>
        )}
      </div>

      {toast && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
          {toast}
        </div>
      )}

      {connected ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-400">Project Name</span>
              <span className="text-xs text-gray-700 font-medium">{data?.posthogProjectName || "-"}</span>
            </div>
            <div className="border-t border-gray-50" />
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-400">API Host</span>
              <span className="text-xs text-gray-700 font-mono">{data?.posthogApiHost || "-"}</span>
            </div>
            <div className="border-t border-gray-50" />
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-400">Project ID</span>
              <span className="text-xs text-gray-700 font-mono">{data?.posthogProjectId || "-"}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-4">
            <p className="text-xs text-gray-400 mb-3">Collected Events</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(EVENT_LABELS).map(([key, label]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-sm font-semibold text-gray-900">{events[key] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={handleVerify}
              disabled={verifyLoading}
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {verifyLoading ? "Verifying..." : "Verify Connection"}
            </button>
            <button
              onClick={onRefresh}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Reconnect
            </button>
            <button className="border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p className="text-xs text-gray-500">Connect PostHog to track product analytics.</p>
          <button
            onClick={onRefresh}
            className="mt-3 bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          >
            Configure
          </button>
        </div>
      )}
    </div>
  );
}