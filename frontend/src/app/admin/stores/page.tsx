"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import type { AdminStore, AdminPageResponse } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";

function getPlatformBadge(platform: string) {
  switch (platform?.toLowerCase()) {
    case "shopify": return "bg-green-50 text-green-700 border border-green-200";
    case "woocommerce": return "bg-purple-50 text-purple-700 border border-purple-200";
    case "amazon": return "bg-orange-50 text-orange-700 border border-orange-200";
    case "etsy": return "bg-rose-50 text-rose-700 border border-rose-200";
    default: return "bg-gray-50 text-gray-500 border border-gray-200";
  }
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchStores = async (page: number, searchText: string = search) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listStores(searchText.trim() || undefined, page, pageSize);
      const data: AdminPageResponse<AdminStore> = res.data.data;
      setStores(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.warn("Failed to fetch stores:", err);
      setError("Failed to load stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(0); }, []);

  const handleSearch = () => { setCurrentPage(0); fetchStores(0, search); };
  const handlePageChange = (page: number) => { setCurrentPage(page); fetchStores(page); };

  const handleDelete = async (storeId: number) => {
    try {
      await adminApi.deleteStore(storeId);
      setConfirmDeleteId(null);
      fetchStores(currentPage === 0 ? 0 : Math.min(currentPage, Math.max(0, totalPages - 2)));
    } catch (err) {
      console.warn("Failed to delete store:", err);
      alert("Failed to delete store.");
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Loading stores..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Stores</h1>
        <p className="text-xs text-gray-400 mt-0.5">{totalElements} total stores</p>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search by store name or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchStores(currentPage)} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Stores Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Store</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Platform</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Uploads</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reports</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{store.storeName}</p>
                        <p className="text-[10px] text-gray-400">ID: {store.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformBadge(store.platform)}`}>
                      {store.platform || "Unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">{store.userEmail || `User #${store.userId}`}</td>
                  <td className="py-3 px-6 text-center text-sm text-gray-600">{store.uploadCount}</td>
                  <td className="py-3 px-6 text-center text-sm text-gray-600">{store.taskCount}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">{store.createdTime}</td>
                  <td className="py-3 px-6 text-right">
                    {confirmDeleteId === store.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(store.id)} className="px-2.5 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Confirm</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(store.id)} className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stores.length === 0 && !loading && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No stores found</p>
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