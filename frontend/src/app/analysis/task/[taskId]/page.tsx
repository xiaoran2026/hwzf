"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { tasksApi } from "@/lib/api";
import type { TaskStatus } from "@/lib/types";
import Loading from "@/components/ui/Loading";

const statusConfig: Record<string, { title: string; description: string; tone: string; progressTone: string }> = {
  PENDING: {
    title: "Upload received",
    description: "Your CSV is in the queue and will start processing shortly.",
    tone: "bg-gray-100 text-gray-700",
    progressTone: "bg-gray-900",
  },
  PARSING: {
    title: "Parsing CSV",
    description: "We are reading the file and validating the fields we need for diagnosis.",
    tone: "bg-blue-100 text-blue-700",
    progressTone: "bg-blue-500",
  },
  ANALYZING: {
    title: "Finding revenue leaks",
    description: "We are analyzing trends, score signals, and likely recovery opportunities.",
    tone: "bg-orange-100 text-orange-700",
    progressTone: "bg-orange-500",
  },
  GENERATING_REPORT: {
    title: "Building report",
    description: "The report preview and recovery plan are being prepared now.",
    tone: "bg-purple-100 text-purple-700",
    progressTone: "bg-purple-500",
  },
  COMPLETED: {
    title: "Report ready",
    description: "Your revenue leak report is ready to open.",
    tone: "bg-emerald-100 text-emerald-700",
    progressTone: "bg-emerald-500",
  },
  FAILED: {
    title: "Processing failed",
    description: "The CSV could not be processed. Try uploading again.",
    tone: "bg-red-100 text-red-700",
    progressTone: "bg-red-500",
  },
};

const steps = [
  { key: "PENDING", label: "Upload received" },
  { key: "PARSING", label: "Parse CSV" },
  { key: "ANALYZING", label: "Find leaks" },
  { key: "GENERATING_REPORT", label: "Generate report" },
  { key: "COMPLETED", label: "Open report" },
];

function getStepIndex(status: string) {
  return steps.findIndex((step) => step.key === status);
}

export default function AnalysisTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericTaskId = Number(taskId);
  const isValidId = !Number.isNaN(numericTaskId) && numericTaskId > 0;

  useEffect(() => {
    if (!isValidId) {
      setError("Invalid task ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId: NodeJS.Timeout;

    async function fetchStatus() {
      try {
        const res = await tasksApi.getTaskStatus(numericTaskId);

        if (cancelled) return;

        if (res.data.code === 200 && res.data.data) {
          const currentTask = res.data.data;
          setTask(currentTask);
          setError(null);

          if (currentTask.status === "COMPLETED" && currentTask.reportId) {
            clearInterval(intervalId);
            setTimeout(() => {
              router.push(`/reports/${currentTask.reportId}`);
            }, 1200);
          }

          if (currentTask.status === "FAILED") {
            clearInterval(intervalId);
          }
        } else {
          setError(res.data.message || "Failed to load task status.");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load task status.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStatus();
    intervalId = setInterval(fetchStatus, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isValidId, numericTaskId, router]);

  const currentStatus = task?.status || "PENDING";
  const config = statusConfig[currentStatus] || statusConfig.PENDING;
  const currentStep = getStepIndex(currentStatus);
  const progress = task?.progress ?? 0;
  const progressWidth = Math.max(6, Math.min(progress, 100));

  const readyHref = useMemo(() => {
    if (task?.reportId) return `/reports/${task.reportId}`;
    return "/reports";
  }, [task?.reportId]);

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center px-4 py-24 sm:px-6">
        <Loading text="Loading task status..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800">Task unavailable</h1>
          <p className="mt-3 text-sm leading-7 text-red-700">{error}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/stores"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Back to stores
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/stores" className="hover:text-gray-700">
          Stores
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">Report task #{taskId}</span>
      </nav>

      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white">
        <div className="px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Report generation</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{config.title}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.tone}`}>{currentStatus}</span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">{config.description}</p>

          <div className="mt-6 rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-950">{task?.fileName || "CSV upload"}</p>
                <p className="mt-1 text-sm text-gray-600">Task ID: {task?.taskId || taskId}</p>
              </div>
              <p className="text-sm font-semibold text-gray-950">{progress}%</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
              <div className={`h-full rounded-full transition-all duration-500 ${config.progressTone}`} style={{ width: `${progressWidth}%` }} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => {
              const isCompleted = currentStep > index;
              const isActive = currentStep === index;
              const isFuture = currentStep < index && currentStatus !== "FAILED";
              const isFailed = currentStatus === "FAILED" && index >= Math.max(currentStep, 0);

              return (
                <div key={step.key} className="rounded-2xl border border-gray-100 p-4">
                  <div
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : isActive
                        ? "bg-orange-100 text-orange-700"
                        : isFailed
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-950">{step.label}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {isCompleted ? "Done" : isActive ? "In progress" : isFailed ? "Stopped" : isFuture ? "Waiting" : "Waiting"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {currentStatus === "COMPLETED" && task?.reportId && (
              <Link
                href={readyHref}
                className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Open report
              </Link>
            )}

            {currentStatus === "FAILED" && (
              <Link
                href="/stores"
                className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Upload again
              </Link>
            )}

            <Link
              href="/reports"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              All reports
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
