"use client";

import { useState } from "react";
import type { AdminSystemSettings } from "@/lib/types";
import { adminApi } from "@/lib/api";

interface Props {
  data: AdminSystemSettings | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function SentryMonitoringCard({ data, loading, onRefresh }: Props) {
  const [testLoading, setTestLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const connected = data?.sentryEnabled && !!data?.sentryDsn;

  const handleTest = async () => {
    setTestLoading(true);
    setToast(null);
    try {
      const res = await adminApi.testSentryError();
      setToast(res.data.data || "Test event sent successfully.");
    } catch {
      setToast("Failed to send test event.");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Monitoring</h2>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-400">DSN</span>
            <span className="text-xs text-gray-700 font-mono">
              {data?.sentryDsn ? `${data.sentryDsn.substring(0, 30)}...` : "-"}
            </span>
          </div>
          <div className="border-t border-gray-50" />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-400">Environment</span>
            <span className="text-xs text-gray-700 font-medium">{data?.sentryEnvironment || "Production"}</span>
          </div>
          <div className="border-t border-gray-50" />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-400">Release</span>
            <span className="text-xs text-gray-700 font-mono">{data?.sentryRelease || "v1.0.0"}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <p className="text-xs text-gray-400 mb-2">Error Statistics <span className="text-gray-300">(24h)</span></p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-base font-semibold text-gray-900">{data?.errorCount24h ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Errors</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-base font-semibold text-gray-900">{data?.warningCount24h ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Warnings</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-base font-semibold text-gray-900">{data?.crashFreeRate != null ? `${data.crashFreeRate.toFixed(1)}%` : "-"}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Crash Free</p>
              </div>
            </div>
            {data?.lastErrorTime && (
              <p className="text-[11px] text-gray-400 mt-2">Last error: {data.lastErrorTime}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleTest}
              disabled={testLoading}
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {testLoading ? "Sending..." : "Test Error"}
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
        </div>
      ) : (
        <div className="py-6 text-center">
          <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-xs text-gray-500">Connect Sentry to monitor application errors.</p>
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