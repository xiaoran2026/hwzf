"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import type { AdminUser, AdminPageResponse } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";

const plans = ["FREE", "STARTER", "PRO"];
const roles = ["USER", "ADMIN"];

function getPlanBadge(plan: string) {
  switch (plan) {
    case "PRO": return "bg-gray-900 text-white";
    case "STARTER": return "bg-gray-100 text-gray-700 border border-gray-200";
    default: return "bg-gray-50 text-gray-500 border border-gray-200";
  }
}

function getRoleBadge(role: string) {
  return role === "ADMIN"
    ? "bg-orange-50 text-orange-700 border border-orange-200"
    : "bg-gray-50 text-gray-500 border border-gray-200";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchUsers = async (page: number, searchText: string = search) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listUsers(searchText.trim() || undefined, page, pageSize);
      const data: AdminPageResponse<AdminUser> = res.data.data;
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.warn("Failed to fetch users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(0); }, []);

  const handleSearch = () => { setCurrentPage(0); fetchUsers(0, search); };
  const handlePageChange = (page: number) => { setCurrentPage(page); fetchUsers(page); };

  const handleUpdatePlan = async (userId: number, newPlan: string) => {
    try { await adminApi.updateUserPlan(userId, newPlan); fetchUsers(currentPage); }
    catch (err) { console.warn("Failed to update plan:", err); alert("Failed to update plan."); }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try { await adminApi.updateUserRole(userId, newRole); fetchUsers(currentPage); }
    catch (err) { console.warn("Failed to update role:", err); alert("Failed to update role."); }
  };

  const handleToggleBan = async (user: AdminUser) => {
    try { await adminApi.toggleBanUser(user.id, !user.banned); fetchUsers(currentPage); }
    catch (err) { console.warn("Failed to toggle ban:", err); alert("Action failed."); }
  };

  const handleDelete = async (userId: number) => {
    try {
      await adminApi.deleteUser(userId);
      setConfirmDeleteId(null);
      fetchUsers(currentPage === 0 ? 0 : Math.min(currentPage, Math.max(0, totalPages - 2)));
    } catch (err) {
      console.warn("Failed to delete user:", err);
      alert("Failed to delete user.");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Loading users..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Users</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {totalElements} total users
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search by email..."
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
          <button onClick={() => fetchUsers(currentPage)} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Stores</th>
                <th className="text-center py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reports</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gray-500">{user.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                        <p className="text-[10px] text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <select
                      value={user.plan}
                      onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getPlanBadge(user.plan)} focus:outline-none focus:ring-2 focus:ring-gray-300`}
                    >
                      {plans.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-6">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleBadge(user.role)} focus:outline-none focus:ring-2 focus:ring-gray-300`}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.banned
                          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      }`}
                    >
                      {user.banned ? "Suspended" : "Active"}
                    </button>
                  </td>
                  <td className="py-3 px-6 text-center text-sm text-gray-600">{user.storeCount}</td>
                  <td className="py-3 px-6 text-center text-sm text-gray-600">{user.reportCount}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">{user.createdTime}</td>
                  <td className="py-3 px-6 text-right">
                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(user.id)} className="px-2.5 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Confirm</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(user.id)} className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}