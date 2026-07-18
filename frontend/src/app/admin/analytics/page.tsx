"use client";

import Link from "next/link";
import { useState } from "react";

const metrics = [
  { label: "New Users (This Month)", value: "142", change: "+18%", positive: true },
  { label: "Paid Conversions", value: "28", change: "+5", positive: true },
  { label: "Revenue", value: "$8,420", change: "+12.5%", positive: true },
  { label: "Stores Created", value: "67", change: "+9%", positive: true },
  { label: "Reports Generated", value: "1,847", change: "+22%", positive: true },
  { label: "Uploads", value: "3,291", change: "+15%", positive: true },
  { label: "Retention Rate", value: "73.2%", change: "+2.1%", positive: true },
  { label: "Avg Session Duration", value: "4m 32s", change: "-0.8%", positive: false },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Platform-wide metrics, growth trends, and user engagement</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {["7d", "30d", "90d", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{m.value}</p>
            <p className={`text-xs mt-1 ${m.positive ? "text-green-600" : "text-red-500"}`}>
              {m.change} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="flex items-center justify-center h-56 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <p className="mt-3 text-sm text-gray-400">Chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="flex items-center justify-center h-56 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <p className="mt-3 text-sm text-gray-400">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
        <div className="flex items-center justify-center h-56 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.875C3 4.391 3.391 4 3.875 4h16.25c.484 0 .875.391.875.875v11.25c0 .484-.391.875-.875.875H3.875A.875.875 0 013 16.125V4.875zM6 7.5h.008v.008H6V7.5zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">Chart coming soon</p>
            <p className="text-xs text-gray-300 mt-1">Visitors → Signups → Active Users → Paid Users</p>
          </div>
        </div>
      </div>
    </div>
  );
}