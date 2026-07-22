"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { reportsApi } from "@/lib/api";
import type { ReportData } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { planMeetsRequirement, type PlanId } from "@/lib/planConfig";
import Loading from "@/components/ui/Loading";
import ReportPdfExport from "@/components/ReportPdfExport";
import UnlockButton from "@/components/payment/UnlockButton";

const CARD = "bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function inferDifficulty(text: string) {
  const t = text.toLowerCase();
  if (t.includes("launch") || t.includes("send") || t.includes("test")) return "Easy";
  if (t.includes("build") || t.includes("redesign")) return "Hard";
  return "Medium";
}

function inferTime(text: string) {
  const t = text.toLowerCase();
  if (t.includes("send") || t.includes("email") || t.includes("test")) return "1-2 hours";
  if (t.includes("bundle") || t.includes("upsell")) return "1 day";
  if (t.includes("build") || t.includes("redesign")) return "2-3 days";
  return "1 day";
}

function normalizeSentence(text: string) {
  const trimmed = text.trim();
  return trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
}

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function LockedCard({ label }: { label: string }) {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 flex flex-col items-center justify-center text-center min-h-[100px]">
      <LockIcon />
      <p className="mt-2 text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-[11px] text-gray-400">Unlock with Full Recovery Plan</p>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const userPlan = ((user?.plan || "FREE").toUpperCase()) as PlanId;
  const isPaid = planMeetsRequirement(userPlan, "STARTER");

  const id = Number(reportId);
  const valid = !isNaN(id) && id > 0;

  useEffect(() => {
    if (!valid) {
      setError("Invalid report ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await reportsApi.getReport(id);
        if (!cancelled && res.data.code === 200 && res.data.data) {
          setData(res.data.data);
        } else if (!cancelled) {
          setError(res.data.message || "Failed to load report.");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.status === 404 ? "Report not found." : "Failed to load report.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, valid]);

  const monthlyRevenue = useMemo(() => {
    if (!data?.salesAnalysis) return 0;
    const trend = data.salesAnalysis.monthlyRevenueTrend;
    if (trend && Object.keys(trend).length > 0) {
      const values = Object.values(trend).map(Number).filter((v) => !isNaN(v));
      if (values.length > 0) return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    return Math.max(0, data.salesAnalysis.totalRevenue / 6);
  }, [data]);

  const opportunityModel = useMemo(() => {
    if (!data) return { factor: 0, repeatPenalty: 0, scorePenalty: 0 };
    const repeatPenalty = data.customerAnalysis && data.customerAnalysis.repeatRate < 35 ? 0.08 : 0.03;
    const scorePenalty = ((100 - data.healthScore) / 100) * 0.55;
    const factor = Math.min(0.35, Math.max(0.05, scorePenalty + repeatPenalty));
    return { factor, repeatPenalty, scorePenalty };
  }, [data]);

  const estimatedLostRevenue = useMemo(() => {
    if (!data) return 0;
    return Math.round(monthlyRevenue * opportunityModel.factor);
  }, [data, monthlyRevenue, opportunityModel]);

  const topLeaks = useMemo(() => {
    if (!data) return [];

    const problems = data.problems.slice(0, 3);
    const actions = data.recommendations;

    return problems.map((problem, index) => {
      const action = actions[index] || actions[0] || "Review the issue and prioritize the fastest recovery action.";
      const impactRatio = [0.42, 0.31, 0.24][index] || 0.18;
      return {
        priority: `P${index + 1}`,
        title: normalizeSentence(problem),
        impact: Math.round(estimatedLostRevenue * impactRatio),
        why:
          data.salesInsights[index] ||
          data.customerInsights[index] ||
          data.productInsights[index] ||
          "Uploaded order data shows this issue is limiting repeat purchase, order value, or product mix performance.",
        action: normalizeSentence(action),
        difficulty: inferDifficulty(action),
        time: inferTime(action),
      };
    });
  }, [data, estimatedLostRevenue]);

  const quickWins = useMemo(() => {
    if (!data?.recommendations.length) return [];
    return data.recommendations.slice(0, 3).map((rec, index) => ({
      title: normalizeSentence(rec),
      impact: Math.round(estimatedLostRevenue * ([0.12, 0.09, 0.06][index] || 0.05)),
      difficulty: inferDifficulty(rec),
      time: inferTime(rec),
    }));
  }, [data, estimatedLostRevenue]);

  const watchMetrics = useMemo(() => {
    const metrics: { label: string; value: string }[] = [];
    if (data?.customerAnalysis) {
      metrics.push({ label: "Returning Customer Rate", value: `${data.customerAnalysis.repeatRate.toFixed(1)}%` });
      metrics.push({ label: "Orders Per Customer", value: (data.customerAnalysis.totalCustomers > 0 && data.salesAnalysis ? (data.salesAnalysis.totalOrders / data.customerAnalysis.totalCustomers).toFixed(1) : "0") });
    }
    if (data?.salesAnalysis) {
      metrics.push({ label: "Average Order Value", value: fmtCurrency(data.salesAnalysis.averageOrderValue) });
    }
    if (data?.topProducts?.length) {
      const totalRevenue = data.salesAnalysis?.totalRevenue || 0;
      const topRevenue = data.topProducts[0]?.revenue || 0;
      const share = totalRevenue > 0 ? (topRevenue / totalRevenue) * 100 : 0;
      metrics.push({ label: "Top Product Revenue Share", value: `${share.toFixed(1)}%` });
    }
    return metrics.slice(0, 4);
  }, [data]);

  const benchmarkRepeatRate = useMemo(() => {
    if (!data?.customerAnalysis) return 32;
    return Math.max(24, Math.min(40, data.customerAnalysis.repeatRate + 14));
  }, [data]);

  const repeatRateGap = useMemo(() => {
    if (!data?.customerAnalysis) return 0;
    return Math.max(0, benchmarkRepeatRate - data.customerAnalysis.repeatRate);
  }, [data, benchmarkRepeatRate]);

  const retentionOpportunity = useMemo(() => {
    if (!data) return 0;
    return Math.round(estimatedLostRevenue * 0.34);
  }, [data, estimatedLostRevenue]);

  const benchmarkVisuals = useMemo(() => {
    if (!data) return [];

    const repeatRate = data.customerAnalysis?.repeatRate || 0;
    const aov = data.salesAnalysis?.averageOrderValue || 0;
    const benchmarkAov = Math.round(aov * 1.18);
    const topProductShare = data.topProducts?.length && data.salesAnalysis?.totalRevenue
      ? Math.min(100, (data.topProducts[0].revenue / data.salesAnalysis.totalRevenue) * 100)
      : 0;
    const healthyTopProductShare = Math.max(18, Math.round(topProductShare - 12));

    return [
      {
        title: "Repeat Purchase Rate",
        current: `${repeatRate.toFixed(1)}%`,
        benchmark: `${benchmarkRepeatRate.toFixed(1)}%`,
        progress: Math.max(8, Math.min(100, (repeatRate / benchmarkRepeatRate) * 100)),
        note: "A lower repeat purchase rate usually means missed retention and win-back revenue.",
      },
      {
        title: "Average Order Value",
        current: fmtCurrency(aov),
        benchmark: fmtCurrency(benchmarkAov),
        progress: benchmarkAov > 0 ? Math.max(8, Math.min(100, (aov / benchmarkAov) * 100)) : 0,
        note: "AOV below potential often points to weak bundle, upsell, or threshold offers.",
      },
      {
        title: "Top Product Concentration",
        current: `${topProductShare.toFixed(1)}%`,
        benchmark: `${healthyTopProductShare.toFixed(1)}% or lower`,
        progress: topProductShare > 0 ? Math.max(8, Math.min(100, (healthyTopProductShare / topProductShare) * 100)) : 0,
        note: "Heavy reliance on one product increases risk and limits product mix growth.",
      },
    ];
  }, [data, benchmarkRepeatRate]);

  const emailRecoveryKit = useMemo(
    () => [
      {
        title: "14-Day Win-Back Email",
        subject: "We miss you - here is something for your next order",
        goal: "Bring recent one-time buyers back quickly.",
      },
      {
        title: "30-Day Reminder Offer",
        subject: "A special offer for your next purchase",
        goal: "Recover customers before they fully churn.",
      },
      {
        title: "60-Day Last Chance Campaign",
        subject: "Still interested? Here is a final reason to come back",
        goal: "Reactivate colder customers with a stronger hook.",
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-6 flex items-center justify-center py-32">
        <Loading size="lg" text="Loading report..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 sm:px-6 max-w-5xl mx-auto py-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/reports" className="hover:text-gray-700">Reports</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Report #{reportId}</span>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <p className="text-sm text-red-700">{error || "Report not available."}</p>
          <Link href="/reports" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/reports" className="hover:text-gray-700 transition-colors">My Reports</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Revenue Leak Report #{reportId}</span>
        </div>
        <ReportPdfExport data={data} reportId={reportId} isPaid={isPaid} />
      </div>

      <section className={`${CARD} p-6 md:p-8 mb-8`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Based on Uploaded Shopify Order Data</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-gray-950">
          You may be missing {fmtCurrency(estimatedLostRevenue)}/month in revenue opportunity
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-3xl">
          {data.summary || "This store is generating orders, but repeat purchase, order value, and product mix are limiting growth."}
          {" "}
          This audit highlights the biggest recovery opportunities and the fastest actions to take next.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Revenue Health Score</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{data.healthScore} / 100</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Main Opportunity</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{topLeaks[0]?.title || "Revenue opportunity detected"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Quickest Win</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{quickWins[0]?.title || "Review the first recovery action"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Recovery Potential</p>
            <p className="mt-2 text-sm font-semibold text-gray-950">{data.healthScore >= 70 ? "Medium" : data.healthScore >= 45 ? "High" : "Very High"}</p>
          </div>
        </div>
      </section>

      {isPaid && (
      <section className={`${CARD} p-6 mb-8`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.16em]">How We Calculated This</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-3xl">
              We estimate revenue opportunity by comparing repeat purchase behavior, order value, and product mix against healthy growth patterns. These numbers are directional estimates designed to help you prioritize action.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">The Exact Formula Behind The Headline Number</p>
          <div className="mt-3 flex flex-col lg:flex-row lg:items-center gap-3 text-sm">
            <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Monthly Revenue Baseline</p>
              <p className="mt-1 text-base font-bold text-gray-950">{fmtCurrency(monthlyRevenue)}</p>
              <p className="mt-1 text-xs text-gray-500">Average of your monthly revenue trend</p>
            </div>
            <span className="text-lg font-bold text-gray-400 text-center">×</span>
            <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Opportunity Factor</p>
              <p className="mt-1 text-base font-bold text-gray-950">{(opportunityModel.factor * 100).toFixed(1)}%</p>
              <p className="mt-1 text-xs text-gray-500">
                Health Score {data.healthScore}/100 ({(opportunityModel.scorePenalty * 100).toFixed(1)}%) + repeat-rate penalty {(opportunityModel.repeatPenalty * 100).toFixed(0)}%
              </p>
            </div>
            <span className="text-lg font-bold text-gray-400 text-center">=</span>
            <div className="flex-1 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-orange-500 font-semibold">Estimated Opportunity</p>
              <p className="mt-1 text-base font-bold text-gray-950">{fmtCurrency(estimatedLostRevenue)}/month</p>
              <p className="mt-1 text-xs text-gray-500">Directional estimate, capped between 5% and 35% of baseline</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Your Repeat Purchase Rate", value: data.customerAnalysis ? `${data.customerAnalysis.repeatRate.toFixed(1)}%` : "—" },
            { label: "Estimated Healthy Benchmark", value: `${benchmarkRepeatRate.toFixed(1)}%` },
            { label: "Gap", value: `${repeatRateGap.toFixed(1)}%` },
            { label: "Average Order Value", value: data.salesAnalysis ? fmtCurrency(data.salesAnalysis.averageOrderValue) : "—" },
            { label: "Retention Opportunity", value: `+${fmtCurrency(retentionOpportunity)}/month` },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-gray-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
      )}

      <section className={`${CARD} p-6 mb-8`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.16em]">Benchmark Comparison</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-3xl">
              These visual benchmarks help show where the biggest recovery gap sits right now.
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {benchmarkVisuals.slice(0, isPaid ? undefined : 1).map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{item.current}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Benchmark</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600">{item.benchmark}</p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-emerald-500"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.note}</p>
            </div>
          ))}
          {!isPaid && benchmarkVisuals.length > 1 && (
            <>
              <LockedCard label={`+${benchmarkVisuals.length - 1} more benchmarks`} />
              {benchmarkVisuals.length > 2 && <div className="hidden lg:block" />}
            </>
          )}
        </div>
      </section>

      <section className={`${CARD} p-6 mb-8`}>
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Top Revenue Opportunities</h2>
        <div className="space-y-4">
          {topLeaks.slice(0, isPaid ? undefined : 1).map((leak) => (
            <div key={leak.title} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-900 text-white">{leak.priority}</span>
                    <h3 className="text-base font-semibold text-gray-900">{leak.title}</h3>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-2 mb-4">
                    <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Impact</p>
                      <p className="text-[13px] font-semibold text-emerald-600">+{fmtCurrency(leak.impact)}/month</p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Difficulty</p>
                      <p className="text-[13px] font-semibold text-gray-900">{leak.difficulty}</p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Estimated Time</p>
                      <p className="text-[13px] font-semibold text-gray-900">{leak.time}</p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.14em]">Action</p>
                      <p className="text-[13px] font-semibold text-orange-600">Recovery Ready</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">Why This Matters:</span> {leak.why}
                  </p>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">Recommended Action:</span> {leak.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {!isPaid && topLeaks.length > 1 && (
            <div className="grid sm:grid-cols-2 gap-3">
              <LockedCard label={`+${topLeaks.length - 1} more opportunities`} />
              <LockedCard label="Full priority list with impact details" />
            </div>
          )}
        </div>
      </section>

      <section className={`${CARD} p-6 mb-8`}>
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Fastest Recovery Actions</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {quickWins.slice(0, isPaid ? undefined : 1).map((item) => (
            <div key={item.title} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">{item.title}</p>
              <p className="mt-3 text-xs text-gray-500">Potential Impact</p>
              <p className="text-sm font-semibold text-emerald-600">+{fmtCurrency(item.impact)}/month</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{item.difficulty}</span>
                <span>{item.time}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Use this this week to test recovery potential.</p>
            </div>
          ))}
          {!isPaid && quickWins.length > 1 && (
            <>
              <LockedCard label={`+${quickWins.length - 1} more quick wins`} />
              {quickWins.length > 2 && <LockedCard label="Full recovery action plan" />}
            </>
          )}
        </div>
      </section>

      <section className={`${CARD} p-6 mb-8`}>
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">Your Revenue Recovery Plan</h2>
        {isPaid ? (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">This Week</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              {data.recommendations.slice(0, 3).map((item) => (
                <li key={item}>{normalizeSentence(item)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Next 30 Days</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              {data.problems.slice(0, 3).map((item) => (
                <li key={item}>Monitor: {normalizeSentence(item)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Ongoing</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              {[
                "Track returning customer rate weekly",
                "Compare AOV after changes",
                "Reduce dependence on your top product",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-900">This Week</p>
              <p className="mt-2 text-sm text-gray-600">{normalizeSentence(data.recommendations[0] || "Start your first recovery action")}</p>
            </div>
            <LockedCard label="Full recovery plan with weekly actions" />
          </div>
        )}
      </section>

      <section className={`${CARD} p-6 mb-8`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.16em]">Email Recovery Kit</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ready-to-use campaign ideas based on the recovery opportunities found in your store.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {emailRecoveryKit.slice(0, isPaid ? undefined : 1).map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Subject</p>
              <p className="mt-1 text-sm text-gray-800">{item.subject}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Goal</p>
              <p className="mt-1 text-sm text-gray-700">{item.goal}</p>
              <div className="mt-4 rounded-xl bg-white border border-gray-100 p-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Hi {"{{first_name}}"}, we noticed it has been a while since your last order. If you have been thinking about coming back, here is a small reason to do it today.
                </p>
              </div>
            </div>
          ))}
          {!isPaid && emailRecoveryKit.length > 1 && (
            <>
              <LockedCard label={`+${emailRecoveryKit.length - 1} more email templates`} />
              {emailRecoveryKit.length > 2 && <LockedCard label="Complete email recovery kit" />}
            </>
          )}
        </div>
      </section>

      <section className={`${CARD} p-6 mb-8`}>
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.16em]">What To Watch Next</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {watchMetrics.map((metric) => (
            <div key={metric.label} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">{metric.label}</p>
              <p className="mt-2 text-lg font-semibold text-gray-950">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      {!isPaid && (
      <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Unlock Your Full Recovery Plan</h2>
          <p className="mt-2 text-sm text-gray-600">
            Get the full calculation breakdown, every recovery action, and the complete email recovery kit.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <UnlockButton
            label="Unlock Full Recovery Plan - $19"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-black/5">
            Upload Another Store
          </Link>
        </div>
      </section>
      )}
    </div>
  );
}
