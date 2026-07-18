"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import type { AdminReport, AdminPageResponse } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";

function getScoreBadge(score: number | null | undefined) {
  if (score == null) return { text: "-", bg: "bg-gray-50 text-gray-400 border border-gray-200" };
  const bg = score >= 80 ? "bg-green-50 text-green-700 border border-green-200"
    : score >= 60 ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
    : "bg-red-50 text-red-700 border border-red-200";
  return { text: score.toFixed(1), bg };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listReports(page, pageSize);
      const data: AdminPageResponse<AdminReport> = res.data.data;
      setReports(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.warn("Failed to fetch reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(0); }, []);
  const handlePageChange = (page: number) => { setCurrentPage(page); fetchReports(page); };

  const handleDelete = async (reportId: number) => {
    try {
      await adminApi.deleteReport(reportId);
      setConfirmDeleteId(null);
      fetchReports(currentPage === 0 ? 0 : Math.min(currentPage, Math.max(0, totalPages - 2)));
    } catch (err) {
      console.warn("Failed to delete report:", err);
      alert("Failed to delete report.");
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Loading reports..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">{totalElements} total reports</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchReports(currentPage)} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Report</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Store</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Health Score</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Generated</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const scoreBadge = getScoreBadge(report.healthScore);
                return (
                  <tr key={report.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 font-medium">Report #{report.id}</p>
                          <p className="text-[10px] text-gray-400">AI Analysis</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700 font-medium">{report.storeName || `Store #${report.storeId}`}</td>
                    <td className="py-3 px-6 text-sm text-gray-600">{report.userEmail || `User #${report.userId}`}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBadge.bg}`}>
                        {scoreBadge.text}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500">{report.createdAt}</td>
                    <td className="py-3 px-6 text-right">
                      {confirmDeleteId === report.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(report.id)} className="px-2.5 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Confirm</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(report.id)} className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && !loading && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No reports found</p>
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