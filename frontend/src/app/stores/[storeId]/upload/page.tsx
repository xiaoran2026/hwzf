"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { paymentApi, tasksApi, uploadApi, type UploadHistoryItem } from "@/lib/api";
import type { UsageSummary } from "@/lib/types";

type Phase = "idle" | "uploading" | "processing" | "completed" | "error";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function statusLabel(item: UploadHistoryItem) {
  if (item.reportId) return "Report ready";
  if (item.taskStatus === "FAILED") return "Failed";
  if (item.taskStatus === "COMPLETED") return "Completed";
  if (item.taskStatus) return "Processing";
  return item.status || "Uploaded";
}

export default function UploadPage() {
  const params = useParams();
  const storeId = Number(params.storeId as string);

  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [csvSource, setCsvSource] = useState<"shopify" | "woocommerce" | "amazon">("shopify");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await uploadApi.getUploadHistory(storeId);
      if (res.data.code === 200 && res.data.data) setHistory(res.data.data);
    } catch {
      // ignore
    }
  }, [storeId]);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await paymentApi.getUsage();
      if (res.data.code === 200 && res.data.data) setUsage(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchUsage();
  }, [fetchHistory, fetchUsage]);

  useEffect(() => {
    if (!taskId || phase !== "processing") return;

    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const res = await tasksApi.getTaskStatus(taskId);
        if (cancelled || res.data.code !== 200 || !res.data.data) return;
        const task = res.data.data;
        setProgress(task.progress || 0);

        if (task.status === "COMPLETED" && task.reportId) {
          clearInterval(timer);
          setReportId(task.reportId);
          setPhase("completed");
          fetchHistory();
          fetchUsage();
        }

        if (task.status === "FAILED") {
          clearInterval(timer);
          setPhase("error");
          setError(task.errorMessage || "Analysis failed. Please try another CSV.");
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [taskId, phase, fetchHistory, fetchUsage]);

  async function handleUpload() {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds the 10 MB limit.");
      return;
    }

    try {
      setError(null);
      setPhase("uploading");
      const res = await uploadApi.uploadCsv(file, storeId, csvSource);
      if (res.data.code === 200 && res.data.data) {
        setTaskId(res.data.data.taskId);
        setProgress(10);
        setPhase("processing");
        fetchHistory();
      } else {
        setPhase("error");
        setError(res.data.message || "Upload failed.");
      }
    } catch (err: any) {
      setPhase("error");
      setError(err?.response?.data?.message || err?.message || "Upload failed.");
    }
  }

  function resetFlow() {
    setPhase("idle");
    setFile(null);
    setTaskId(null);
    setReportId(null);
    setProgress(0);
    setError(null);
  }

  const canUpload = usage?.canUpload ?? true;
  const latestReadyReport = history.find((item) => item.reportId);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Upload CSV</span>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Free Audit</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">Upload Your Shopify Orders</h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
            We only need your order export to estimate lost revenue opportunities and generate your recovery plan.
            No Shopify API required.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Your audit includes</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {[
                "Revenue Health Score",
                "Estimated Revenue Opportunity",
                "Customer Retention Analysis",
                "Product Growth Opportunities",
                "Recovery Actions",
                "Email Recovery Templates",
              ].map((item) => (
                <div key={item} className="rounded-xl bg-white border border-gray-100 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {!canUpload && (
            <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-gray-950">Your free audit has already been used.</p>
              <p className="mt-1 text-sm text-gray-600">
                Upgrade to unlock the full recovery plan and generate additional reports.
              </p>
              <Link
                href="/billing"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Unlock Full Plan
              </Link>
            </div>
          )}

          {canUpload && (
            <>
              <div className="mt-6">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2">
                  CSV Format
                </label>
                <select
                  value={csvSource}
                  onChange={(e) => setCsvSource(e.target.value as "shopify" | "woocommerce" | "amazon")}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300"
                >
                  <option value="shopify">Shopify export CSV</option>
                  <option value="woocommerce">WooCommerce CSV</option>
                  <option value="amazon">Amazon report CSV</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Choose the closest format. We will normalize the CSV before generating the report.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-6">
                {!file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">Choose your CSV file</p>
                    <p className="mt-2 text-sm text-gray-600">Upload your exported Shopify order CSV to generate your free revenue audit.</p>
                    <label className="mt-5 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-gray-950 text-white cursor-pointer hover:bg-gray-800 transition-colors">
                      Select CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const nextFile = e.target.files?.[0];
                          if (!nextFile) return;
                          if (!nextFile.name.toLowerCase().endsWith(".csv")) {
                            setError("Only CSV files are accepted.");
                            return;
                          }
                          setError(null);
                          setFile(nextFile);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Recommended Fields</p>
                <p className="mt-2 text-sm text-gray-700 font-mono break-all">
                  order_id, date, customer_id, product_name, quantity, price, country
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>Max 10 MB</span>
                  <span>Max 50k rows</span>
                  <span>Raw CSV is deleted automatically after analysis</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Your Data Stays Yours</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>No customer emails, names, or addresses required — order-level data only.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>Your raw CSV is permanently deleted from our servers right after analysis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>Your store data is never sold or shared with third parties.</span>
                  </li>
                </ul>
                <Link href="/privacy" className="mt-3 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Read our Privacy Policy →
                </Link>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {phase === "idle" && (
                <button
                  type="button"
                  disabled={!file}
                  onClick={handleUpload}
                  className="mt-5 w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl bg-gray-950 text-white hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Get My Free Audit
                </button>
              )}

              {(phase === "uploading" || phase === "processing" || phase === "completed" || phase === "error") && (
                <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900">
                      {phase === "uploading" && "Uploading your order data"}
                      {phase === "processing" && "Generating your revenue recovery audit"}
                      {phase === "completed" && "Your audit is ready"}
                      {phase === "error" && "Upload failed"}
                    </span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        phase === "completed" ? "bg-emerald-500" : phase === "error" ? "bg-red-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${phase === "completed" ? 100 : progress}%` }}
                    />
                  </div>

                  {phase === "completed" && reportId && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/reports/${reportId}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
                      >
                        View My Audit
                      </Link>
                      <button
                        type="button"
                        onClick={resetFlow}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        Upload Another CSV
                      </button>
                    </div>
                  )}

                  {phase === "error" && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={resetFlow}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">What You'll See</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>Revenue Health Score</li>
              <li>Estimated revenue opportunity</li>
              <li>Top growth blockers</li>
              <li>Recommended recovery actions</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Latest Report</p>
              {latestReadyReport?.reportId && (
                <Link href={`/reports/${latestReadyReport.reportId}`} className="text-xs font-semibold text-gray-900 hover:text-gray-700">
                  Open
                </Link>
              )}
            </div>
            <div className="mt-4">
              {latestReadyReport ? (
                <>
                  <p className="text-sm font-semibold text-gray-900">{latestReadyReport.fileName}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(latestReadyReport.completedAt || latestReadyReport.uploadedAt)}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No completed report yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Recent Uploads</p>
              <Link href="/reports" className="text-xs font-semibold text-gray-900 hover:text-gray-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No uploads yet.</p>
              ) : (
                history.slice(0, 4).map((item) => (
                  <div key={item.fileId} className="rounded-xl border border-gray-100 p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span>{statusLabel(item)}</span>
                      <span>{formatDate(item.uploadedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
