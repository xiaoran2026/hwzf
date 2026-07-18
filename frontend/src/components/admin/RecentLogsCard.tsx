"use client";

import { useState, useCallback } from "react";
import type { AdminRecentLogs, AdminLogEntry } from "@/lib/types";
import { adminApi } from "@/lib/api";

interface Props {
  data: AdminRecentLogs | null;
  loading: boolean;
  onRefresh: () => void;
}

const LEVEL_STYLES: Record<string, { badge: string; dot: string }> = {
  ERROR: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
  WARNING: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  INFO: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  DEBUG: { badge: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

const FILTERS = ["ALL", "ERROR", "WARNING", "INFO"] as const;

export default function RecentLogsCard({ data, loading, onRefresh }: Props) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [localLogs, setLocalLogs] = useState<AdminLogEntry[]>(data?.logs || []);
  const [fetching, setFetching] = useState(false);

  const fetchLogs = useCallback(async (level?: string, search?: string) => {
    setFetching(true);
    try {
      const res = await adminApi.getRecentLogs(
        level && level !== "ALL" ? level : undefined,
        search || undefined
      );
      setLocalLogs(res.data.data?.logs || []);
    } catch {
      // keep existing
    } finally {
      setFetching(false);
    }
  }, []);

  const handleFilter = (f: string) => {
    setFilter(f);
    fetchLogs(f, search);
  };

  const handleSearch = () => {
    fetchLogs(filter, search);
  };

  const handleDownload = () => {
    const logsToDownload = localLogs.length > 0 ? localLogs : (data?.logs || []);
    const csv = [
      "ID,Level,Message,Source,Timestamp",
      ...logsToDownload.map(l =>
        `${l.id},${l.level},"${l.message.replace(/"/g, '""')}",${l.source},${l.timestamp}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayLogs = localLogs.length > 0 ? localLogs : (data?.logs || []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Recent Logs</h2>
          {data?.total != null && (
            <p className="text-[11px] text-gray-400 mt-0.5">{data.total} total entries</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search logs..."
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      {/* Log list */}
      {loading || fetching ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : displayLogs.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">No logs found.</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
          {displayLogs.map((log) => {
            const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO;
            return (
              <div key={log.id} className="flex items-start gap-3 py-2">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 mt-0.5 ${style.badge}`}>
                  <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                  {log.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 break-all">{log.message || log.source}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{log.source}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap mt-0.5">{log.timestamp}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}