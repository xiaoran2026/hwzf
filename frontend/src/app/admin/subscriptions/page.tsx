"use client";

import Link from "next/link";
import { useState } from "react";

const subscriptions = [
  { id: 1, user: "sarah.chen@example.com", plan: "Pro", status: "Active", started: "2026-01-15", expires: "2026-07-15" },
  { id: 2, user: "mike.johnson@company.com", plan: "Enterprise", status: "Active", started: "2025-12-01", expires: "2026-12-01" },
  { id: 3, user: "emma.wilson@gmail.com", plan: "Pro", status: "Canceled", started: "2026-02-10", expires: "2026-03-10" },
  { id: 4, user: "james.lee@startup.io", plan: "Pro", status: "Active", started: "2026-03-22", expires: "2026-09-22" },
  { id: 5, user: "olivia.brown@outlook.com", plan: "Enterprise", status: "Active", started: "2025-11-05", expires: "2026-11-05" },
  { id: 6, user: "david.kim@techcorp.com", plan: "Pro", status: "Past Due", started: "2026-04-01", expires: "2026-05-01" },
  { id: 7, user: "lisa.wang@ecom.store", plan: "Enterprise", status: "Active", started: "2026-01-30", expires: "2027-01-30" },
  { id: 8, user: "robert.taylor@gmail.com", plan: "Pro", status: "Active", started: "2026-05-18", expires: "2026-11-18" },
  { id: 9, user: "anna.martinez@shop.co", plan: "Pro", status: "Canceled", started: "2026-03-01", expires: "2026-04-01" },
  { id: 10, user: "chris.anderson@brand.com", plan: "Enterprise", status: "Active", started: "2026-02-14", expires: "2027-02-14" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Canceled":
      return "bg-red-50 text-red-700 border border-red-200";
    case "Past Due":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");

  const filtered = subscriptions.filter(
    (s) =>
      s.user.toLowerCase().includes(search.toLowerCase()) ||
      s.plan.toLowerCase().includes(search.toLowerCase()) ||
      s.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Subscriptions</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage user subscription plans and billing cycles</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Active Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">24</p>
          <p className="text-xs text-green-600 mt-1">+3 this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">$2,471</p>
          <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Canceled</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          <p className="text-xs text-red-500 mt-1">+1 this month</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <input
          type="text"
          placeholder="Search subscriptions by user, plan, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Started</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expires</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6 text-sm text-gray-700 font-medium">{sub.user}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{sub.plan}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{sub.started}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{sub.expires}</td>
                  <td className="py-3 px-6 text-right">
                    <Link
                      href={`/admin/users`}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No subscriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}