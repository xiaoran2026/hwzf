"use client";

import Link from "next/link";
import { useState } from "react";

const metrics = [
  { label: "OpenAI Tokens", value: "1.2M", sub: "tokens today", accent: "bg-green-50 border-green-200", iconColor: "text-green-500" },
  { label: "Claude Tokens", value: "847K", sub: "tokens today", accent: "bg-orange-50 border-orange-200", iconColor: "text-orange-500" },
  { label: "Gemini Tokens", value: "320K", sub: "tokens today", accent: "bg-blue-50 border-blue-200", iconColor: "text-blue-500" },
  { label: "Total Reports", value: "1,847", sub: "generated this month", accent: "bg-purple-50 border-purple-200", iconColor: "text-purple-500" },
  { label: "Avg Response Time", value: "847ms", sub: "across all providers", accent: "bg-cyan-50 border-cyan-200", iconColor: "text-cyan-500" },
  { label: "AI Cost Today", value: "$42.50", sub: "+$3.20 from yesterday", accent: "bg-amber-50 border-amber-200", iconColor: "text-amber-500" },
  { label: "AI Cost This Month", value: "$892.30", sub: "budget: $2,000", accent: "bg-rose-50 border-rose-200", iconColor: "text-rose-500" },
  { label: "Failures", value: "3", sub: "in the last 24 hours", accent: "bg-red-50 border-red-200", iconColor: "text-red-500" },
];

export default function AiUsagePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">AI Usage</h1>
        <p className="text-xs text-gray-400 mt-0.5">Monitor AI provider usage, costs, and performance metrics</p>
      </div>

      {/* Metric Cards - 2x4 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className={`bg-white rounded-xl border p-6 ${m.accent}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{m.label}</p>
              <svg className={`h-4 w-4 ${m.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Usage Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Usage Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Model</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tokens</th>
                <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Latency</th>
                <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: "2 min ago", provider: "OpenAI", model: "gpt-4o", tokens: "4,250", latency: "1.2s", status: "Success" },
                { time: "5 min ago", provider: "Claude", model: "claude-3.5-sonnet", tokens: "3,100", latency: "0.9s", status: "Success" },
                { time: "8 min ago", provider: "OpenAI", model: "gpt-4o", tokens: "5,800", latency: "1.5s", status: "Success" },
                { time: "12 min ago", provider: "Gemini", model: "gemini-1.5-pro", tokens: "2,400", latency: "0.7s", status: "Success" },
                { time: "15 min ago", provider: "OpenAI", model: "gpt-4o", tokens: "1,200", latency: "3.1s", status: "Failed" },
                { time: "18 min ago", provider: "Claude", model: "claude-3.5-sonnet", tokens: "6,300", latency: "1.1s", status: "Success" },
              ].map((log, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-6 text-sm text-gray-700">{log.time}</td>
                  <td className="py-3 px-6 text-sm text-gray-700 font-medium">{log.provider}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">{log.model}</td>
                  <td className="py-3 px-6 text-sm text-gray-700 text-right">{log.tokens}</td>
                  <td className="py-3 px-6 text-sm text-gray-700 text-right">{log.latency}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === "Success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Cost by Provider</h2>
        <div className="space-y-4">
          {[
            { provider: "OpenAI", amount: "$512.40", pct: 57 },
            { provider: "Claude", amount: "$268.70", pct: 30 },
            { provider: "Gemini", amount: "$111.20", pct: 13 },
          ].map((item) => (
            <div key={item.provider}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 font-medium">{item.provider}</span>
                <span className="text-sm text-gray-900 font-semibold">{item.amount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}