"use client";

import type { AdminHealthCheck, AdminServiceHealth } from "@/lib/types";

interface Props {
  data: AdminHealthCheck | null;
  loading: boolean;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string }> = {
  HEALTHY: { dot: "bg-emerald-400", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Healthy" },
  WARNING: { dot: "bg-amber-400", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "Warning" },
  OFFLINE: { dot: "bg-red-400", bg: "bg-red-50 text-red-700 border-red-200", text: "Offline" },
};

const SERVICE_ICONS: Record<string, string> = {
  Frontend: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  Backend: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  Database: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  Redis: "M13 10V3L4 14h7v7l9-11h-7z",
  Storage: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
  SMTP: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  PayPal: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  "AI Service": "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
};

function ServiceRow({ service }: { service: AdminServiceHealth }) {
  const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.OFFLINE;
  const icon = SERVICE_ICONS[service.name] || SERVICE_ICONS.Backend;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700">{service.name}</p>
        <p className="text-[11px] text-gray-400 truncate">{service.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-gray-400 font-mono">{service.responseTimeMs}ms</span>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.text}
        </span>
      </div>
    </div>
  );
}

export default function HealthCheckCard({ data, loading, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-100 rounded w-28" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">System Health</h2>
          {data?.checkedAt && (
            <p className="text-[11px] text-gray-400 mt-0.5">Checked at {data.checkedAt}</p>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {data?.services.map((s) => <ServiceRow key={s.name} service={s} />) ||
          [1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100" />
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-5 bg-gray-100 rounded-full w-16" />
            </div>
          ))
        }
      </div>
    </div>
  );
}