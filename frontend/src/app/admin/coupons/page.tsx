"use client";

import Link from "next/link";
import { useState } from "react";

const coupons = [
  { id: 1, code: "WELCOME20", discount: "20%", type: "Percentage", usageLimit: 100, used: 34, expires: "2026-12-31", status: "Active" },
  { id: 2, code: "SUMMER50", discount: "$50", type: "Fixed", usageLimit: 50, used: 12, expires: "2026-08-31", status: "Active" },
  { id: 3, code: "LAUNCH25", discount: "25%", type: "Percentage", usageLimit: 200, used: 200, expires: "2026-06-30", status: "Expired" },
  { id: 4, code: "BETA100", discount: "$100", type: "Fixed", usageLimit: 20, used: 8, expires: "2026-09-15", status: "Active" },
  { id: 5, code: "OLDPROMO10", discount: "10%", type: "Percentage", usageLimit: 500, used: 89, expires: "2026-03-01", status: "Disabled" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Expired":
      return "bg-gray-100 text-gray-500 border border-gray-200";
    case "Disabled":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

export default function CouponsPage() {
  const [search, setSearch] = useState("");

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Coupons</h1>
          <p className="text-xs text-gray-400 mt-0.5">Create and manage discount coupons for your users</p>
        </div>
        <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          Create Coupon
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Active Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.filter((c) => c.status === "Active").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Redeemed</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.reduce((sum, c) => sum + c.used, 0)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <input
          type="text"
          placeholder="Search coupons by code or status..."
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
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Usage Limit</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Used</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expires</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6 text-sm text-gray-900 font-mono font-semibold">{coupon.code}</td>
                  <td className="py-3 px-6 text-sm text-gray-700 font-medium">{coupon.discount}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">{coupon.type}</td>
                  <td className="py-3 px-6 text-sm text-gray-700 text-right">{coupon.usageLimit}</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-gray-700">{coupon.used}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min((coupon.used / coupon.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{coupon.expires}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Edit
                      </Link>
                      {coupon.status === "Active" && (
                        <Link
                          href="#"
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Disable
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">No coupons found</p>
          </div>
        )}
      </div>
    </div>
  );
}