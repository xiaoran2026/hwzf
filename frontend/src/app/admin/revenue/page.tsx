"use client";

import Link from "next/link";
import { useState } from "react";

const metrics = [
  { label: "Monthly Recurring Revenue", value: "$2,471", change: "+12.5%", positive: true },
  { label: "Annual Recurring Revenue", value: "$29,652", change: "+8.3%", positive: true },
  { label: "Avg Revenue / User", value: "$41.18", change: "+2.1%", positive: true },
  { label: "Conversion Rate", value: "8.2%", change: "-0.4%", positive: false },
];

export default function RevenuePage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Revenue</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track revenue metrics, trends, and financial performance</p>
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

      {/* Summary Cards */}
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

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">Revenue chart coming soon</p>
            <p className="text-xs text-gray-300 mt-1">Integrate with your preferred charting library</p>
          </div>
        </div>
      </div>

      {/* Daily Revenue Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Daily Revenue Breakdown</h2>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-400">Daily revenue chart coming soon</p>
            <p className="text-xs text-gray-300 mt-1">Track day-by-day revenue performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}