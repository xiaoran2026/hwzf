"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import type { AdminLog, AdminPageResponse } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";

const logTypes = [
  { label: "All", value: "" },
  { label: "Login", value: "LOGIN" },
  { label: "Payment", value: "PAYMENT" },
  { label: "Webhook", value: "WEBHOOK" },
  { label: "Upload", value: "UPLOAD" },
  { label: "AI", value: "AI" },
  { label: "Operation", value: "OPERATION" },
  { label: "Error", value: "ERROR" },
];

function getTypeBadge(type: string) {
  switch (type) {
    case "LOGIN": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "PAYMENT": return "bg-green-50 text-green-700 border border-green-200";
    case "WEBHOOK": return "bg-purple-50 text-purple-700 border border-purple-200";
    case "UPLOAD": return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    case "AI": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "ERROR": return "bg-red-50 text-red-700 border border-red-200";
    case "OPERATION": return "bg-gray-100 text-gray-600 border border-gray-200";
    default: return "bg-gray-50 text-gray-500 border border-gray-200";
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [activeType, setActiveType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = async (page: number, type: string = activeType) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (type === "WEBHOOK") {
        res = await adminApi.listWebhookLogs(page, pageSize);
      } else {
        res = await adminApi.listLogs(type || undefined, page, pageSize);
      }
      const data: AdminPageResponse<AdminLog> = res.data.data;
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.warn("Failed to fetch logs:", err);
      setError("Failed to load logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(0); }, []);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setCurrentPage(0);
    fetchLogs(0, type);
  };

  const handlePageChange = (page: number) => { setCurrentPage(page); fetchLogs(page); };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Loading logs..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">System Logs</h1>
        <p className="text-xs text-gray-400 mt-0.5">{totalElements} log entries</p>
      </div>

      {/* Type Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {logTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeType === type.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchLogs(currentPage, activeType)} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">IP</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getTypeBadge(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{log.userEmail || `User #${log.userId}`}</td>
                  <td className="py-3 px-6 text-sm text-gray-900 font-medium">{log.operation}</td>
                  <td className="py-3 px-6 text-sm text-gray-500 max-w-[300px]">
                    <span className="block truncate" title={log.details}>{log.details || "-"}</span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-400 font-mono">{log.ipAddress || "-"}</td>
                  <td className="py-3 px-6 text-sm text-gray-500 whitespace-nowrap">{log.createdTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && !loading && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No log entries found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}