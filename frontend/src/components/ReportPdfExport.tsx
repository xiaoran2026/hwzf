"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { ReportData } from "@/lib/types";

const fmtCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);
const fmtDate = (d: string) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return d; }
};

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

// ========== Shared styles ==========
const S = {
  page: {
    width: 794,
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: "#111827",
    boxSizing: "border-box" as const,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700 as const,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    margin: "0 0 12px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    padding: 16,
  },
  grayCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    padding: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: 600 as const,
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    margin: "0 0 4px",
  },
  value: {
    fontSize: 14,
    fontWeight: 700 as const,
    color: "#111827",
    margin: 0,
  },
  smallText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.5,
    margin: 0,
  },
  divider: {
    borderTop: "1px solid #e5e7eb",
    margin: "20px 0",
  },
};

// ========== PDF Print Layout — mirrors web report exactly ==========
function PdfContent({ data }: { data: ReportData }) {
  const sa = data.salesAnalysis;
  const ca = data.customerAnalysis;

  // ---- Same calculations as web report ----
  const monthlyRevenue = (() => {
    if (!sa) return 0;
    const trend = sa.monthlyRevenueTrend;
    if (trend && Object.keys(trend).length > 0) {
      const values = Object.values(trend).map(Number).filter((v) => !isNaN(v));
      if (values.length > 0) return values.reduce((s, v) => s + v, 0) / values.length;
    }
    return Math.max(0, sa.totalRevenue / 6);
  })();

  const repeatPenalty = ca && ca.repeatRate < 35 ? 0.08 : 0.03;
  const scorePenalty = ((100 - data.healthScore) / 100) * 0.55;
  const factor = Math.min(0.35, Math.max(0.05, scorePenalty + repeatPenalty));
  const estimatedLostRevenue = Math.round(monthlyRevenue * factor);
  const retentionOpportunity = Math.round(estimatedLostRevenue * 0.34);

  const topLeaks = (() => {
    const problems = data.problems.slice(0, 3);
    const actions = data.recommendations;
    return problems.map((problem, index) => {
      const action = actions[index] || actions[0] || "Review the issue and prioritize the fastest recovery action.";
      const impactRatio = [0.42, 0.31, 0.24][index] || 0.18;
      return {
        priority: `P${index + 1}`,
        title: normalizeSentence(problem),
        impact: Math.round(estimatedLostRevenue * impactRatio),
        why: data.salesInsights[index] || data.customerInsights[index] || data.productInsights[index] || "Uploaded order data shows this issue is limiting repeat purchase, order value, or product mix performance.",
        action: normalizeSentence(action),
        difficulty: inferDifficulty(action),
        time: inferTime(action),
      };
    });
  })();

  const quickWins = (() => {
    if (!data.recommendations.length) return [];
    return data.recommendations.slice(0, 3).map((rec, index) => ({
      title: normalizeSentence(rec),
      impact: Math.round(estimatedLostRevenue * ([0.12, 0.09, 0.06][index] || 0.05)),
      difficulty: inferDifficulty(rec),
      time: inferTime(rec),
    }));
  })();

  const benchmarkRepeatRate = ca ? Math.max(24, Math.min(40, ca.repeatRate + 14)) : 32;
  const repeatRateGap = ca ? Math.max(0, benchmarkRepeatRate - ca.repeatRate) : 0;

  const benchmarkVisuals = (() => {
    const repeatRate = ca?.repeatRate || 0;
    const aov = sa?.averageOrderValue || 0;
    const benchmarkAov = Math.round(aov * 1.18);
    const topProductShare = data.topProducts?.length && sa?.totalRevenue
      ? Math.min(100, (data.topProducts[0].revenue / sa.totalRevenue) * 100)
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
  })();

  const watchMetrics = (() => {
    const metrics: { label: string; value: string }[] = [];
    if (ca) {
      metrics.push({ label: "Returning Customer Rate", value: `${ca.repeatRate.toFixed(1)}%` });
      metrics.push({ label: "Orders Per Customer", value: (ca.totalCustomers > 0 && sa ? (sa.totalOrders / ca.totalCustomers).toFixed(1) : "0") });
    }
    if (sa) {
      metrics.push({ label: "Average Order Value", value: fmtCurrency(sa.averageOrderValue) });
    }
    if (data.topProducts?.length) {
      const totalRevenue = sa?.totalRevenue || 0;
      const topRevenue = data.topProducts[0]?.revenue || 0;
      const share = totalRevenue > 0 ? (topRevenue / totalRevenue) * 100 : 0;
      metrics.push({ label: "Top Product Revenue Share", value: `${share.toFixed(1)}%` });
    }
    return metrics.slice(0, 4);
  })();

  const emailRecoveryKit = [
    { title: "14-Day Win-Back Email", subject: "We miss you - here is something for your next order", goal: "Bring recent one-time buyers back quickly." },
    { title: "30-Day Reminder Offer", subject: "A special offer for your next purchase", goal: "Recover customers before they fully churn." },
    { title: "60-Day Last Chance Campaign", subject: "Still interested? Here is a final reason to come back", goal: "Reactivate colder customers with a stronger hook." },
  ];

  return (
    <div id="report-pdf-content" style={S.page}>

      {/* ===== Header ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.5 }}>Store Leak</h1>
          <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0" }}>Shopify Revenue Recovery Audit</p>
        </div>
        <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>{fmtDate(new Date().toISOString())}</p>
      </div>

      {/* ===== Hero: Estimated Lost Revenue ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 24 }}>
        <p style={S.sectionTitle}>Based on Uploaded Shopify Order Data</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "8px 0 12px", letterSpacing: -0.5 }}>
          You may be missing {fmtCurrency(estimatedLostRevenue)}/month in revenue opportunity
        </h2>
        <p style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px", maxWidth: 600 }}>
          {data.summary || "This store is generating orders, but repeat purchase, order value, and product mix are limiting growth."}
          {" "}This audit highlights the biggest recovery opportunities and the fastest actions to take next.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Revenue Health Score", value: `${data.healthScore} / 100` },
            { label: "Main Opportunity", value: topLeaks[0]?.title || "Revenue opportunity detected" },
            { label: "Quickest Win", value: quickWins[0]?.title || "Review the first recovery action" },
            { label: "Recovery Potential", value: data.healthScore >= 70 ? "Medium" : data.healthScore >= 45 ? "High" : "Very High" },
          ].map((item, i) => (
            <div key={i} style={{ ...S.grayCard, padding: 12 }}>
              <p style={S.label}>{item.label}</p>
              <p style={{ ...S.value, fontSize: 12 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== How We Calculated This ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>How We Calculated This</p>
        <p style={{ ...S.smallText, marginBottom: 14, maxWidth: 600 }}>
          We estimate revenue opportunity by comparing repeat purchase behavior, order value, and product mix against healthy growth patterns. These numbers are directional estimates designed to help you prioritize action.
        </p>

        {/* Formula chain */}
        <div style={{ ...S.grayCard, padding: 14, marginBottom: 14 }}>
          <p style={{ ...S.label, marginBottom: 10 }}>The Exact Formula Behind The Headline Number</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6", padding: 10 }}>
              <p style={{ ...S.label, marginBottom: 4 }}>Monthly Revenue Baseline</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 2px" }}>{fmtCurrency(monthlyRevenue)}</p>
              <p style={{ fontSize: 9, color: "#9ca3af", margin: 0 }}>Average of your monthly revenue trend</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#d1d5db" }}>×</span>
            <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6", padding: 10 }}>
              <p style={{ ...S.label, marginBottom: 4 }}>Opportunity Factor</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 2px" }}>{(factor * 100).toFixed(1)}%</p>
              <p style={{ fontSize: 9, color: "#9ca3af", margin: 0 }}>
                Score {data.healthScore}/100 ({(scorePenalty * 100).toFixed(1)}%) + repeat penalty {(repeatPenalty * 100).toFixed(0)}%
              </p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#d1d5db" }}>=</span>
            <div style={{ flex: 1, backgroundColor: "#fff7ed", borderRadius: 8, border: "1px solid #fed7aa", padding: 10 }}>
              <p style={{ ...S.label, color: "#ea580c", marginBottom: 4 }}>Estimated Opportunity</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 2px" }}>{fmtCurrency(estimatedLostRevenue)}/month</p>
              <p style={{ fontSize: 9, color: "#9ca3af", margin: 0 }}>Directional estimate, capped 5%-35% of baseline</p>
            </div>
          </div>
        </div>

        {/* Key metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[
            { label: "Your Repeat Purchase Rate", value: ca ? `${ca.repeatRate.toFixed(1)}%` : "—" },
            { label: "Healthy Benchmark", value: `${benchmarkRepeatRate.toFixed(1)}%` },
            { label: "Gap", value: `${repeatRateGap.toFixed(1)}%` },
            { label: "Average Order Value", value: sa ? fmtCurrency(sa.averageOrderValue) : "—" },
            { label: "Retention Opportunity", value: `+${fmtCurrency(retentionOpportunity)}/mo` },
          ].map((item) => (
            <div key={item.label} style={{ padding: 10, borderRadius: 8, border: "1px solid #f3f4f6", backgroundColor: "#f9fafb" }}>
              <p style={S.label}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "4px 0 0" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Benchmark Comparison ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>Benchmark Comparison</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {benchmarkVisuals.map((item) => (
            <div key={item.title} style={{ ...S.grayCard, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#111827", margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "6px 0 0", letterSpacing: -0.5 }}>{item.current}</p>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <p style={{ ...S.label, marginBottom: 2 }}>Benchmark</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#059669", margin: 0 }}>{item.benchmark}</p>
                </div>
              </div>
              <div style={{ marginTop: 10, height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(to right, #fb923c, #10b981)", width: `${item.progress}%` }} />
              </div>
              <p style={{ ...S.smallText, marginTop: 8 }}>{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Top Revenue Opportunities ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>Top Revenue Opportunities</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topLeaks.map((leak) => (
            <div key={leak.title} style={{ ...S.grayCard, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, backgroundColor: "#111827", color: "#ffffff" }}>{leak.priority}</span>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{leak.title}</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
                {[
                  { label: "Impact", value: `+${fmtCurrency(leak.impact)}/mo`, color: "#059669" },
                  { label: "Difficulty", value: leak.difficulty, color: "#111827" },
                  { label: "Est. Time", value: leak.time, color: "#111827" },
                  { label: "Action", value: "Recovery Ready", color: "#ea580c" },
                ].map((m) => (
                  <div key={m.label} style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#ffffff", border: "1px solid #f3f4f6" }}>
                    <p style={{ ...S.label, fontSize: 8, marginBottom: 2 }}>{m.label}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: m.color, margin: 0 }}>{m.value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#374151", lineHeight: 1.5, margin: "0 0 4px" }}>
                <strong>Why This Matters:</strong> {leak.why}
              </p>
              <p style={{ fontSize: 10, color: "#374151", lineHeight: 1.5, margin: 0 }}>
                <strong>Recommended Action:</strong> {leak.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Fastest Recovery Actions ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>Fastest Recovery Actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {quickWins.map((item) => (
            <div key={item.title} style={{ ...S.grayCard, padding: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#111827", margin: "0 0 8px", lineHeight: 1.4 }}>{item.title}</p>
              <p style={{ ...S.label, marginBottom: 2 }}>Potential Impact</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#059669", margin: "0 0 8px" }}>+{fmtCurrency(item.impact)}/month</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}>
                <span>{item.difficulty}</span>
                <span>{item.time}</span>
              </div>
              <p style={{ ...S.smallText, marginTop: 6, fontSize: 9 }}>Use this this week to test recovery potential.</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Revenue Recovery Plan ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>Your Revenue Recovery Plan</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 10 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>This Week</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#4b5563", lineHeight: 1.6 }}>
              {data.recommendations.slice(0, 3).map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>{normalizeSentence(item)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Next 30 Days</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#4b5563", lineHeight: 1.6 }}>
              {data.problems.slice(0, 3).map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>Monitor: {normalizeSentence(item)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Ongoing</p>
            <ul style={{ margin: 0, paddingLeft: 16, color: "#4b5563", lineHeight: 1.6 }}>
              {["Track returning customer rate weekly", "Compare AOV after changes", "Reduce dependence on your top product"].map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Email Recovery Kit ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>Email Recovery Kit</p>
        <p style={{ ...S.smallText, marginBottom: 12 }}>Ready-to-use campaign ideas based on the recovery opportunities found in your store.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {emailRecoveryKit.map((item) => (
            <div key={item.title} style={{ ...S.grayCard, padding: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{item.title}</p>
              <p style={{ ...S.label, marginBottom: 2 }}>Subject</p>
              <p style={{ fontSize: 10, color: "#1f2937", margin: "0 0 8px" }}>{item.subject}</p>
              <p style={{ ...S.label, marginBottom: 2 }}>Goal</p>
              <p style={{ fontSize: 10, color: "#374151", margin: "0 0 8px" }}>{item.goal}</p>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 6, border: "1px solid #f3f4f6", padding: 8 }}>
                <p style={{ fontSize: 9, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>
                  Hi {"{{first_name}}"}, we noticed it has been a while since your last order. If you have been thinking about coming back, here is a small reason to do it today.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== What To Watch Next ===== */}
      <div style={{ ...S.card, marginBottom: 16, padding: 20 }}>
        <p style={S.sectionTitle}>What To Watch Next</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {watchMetrics.map((metric) => (
            <div key={metric.label} style={{ ...S.grayCard, padding: 12 }}>
              <p style={S.label}>{metric.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "6px 0 0" }}>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #e5e7eb", textAlign: "center" as const }}>
        <p style={{ fontSize: 9, color: "#9ca3af", margin: 0 }}>Generated by Store Leak — store-leak.com</p>
      </div>
    </div>
  );
}

// ========== Export Button ==========
export default function ReportPdfExport({ data, reportId, isPaid }: { data: ReportData; reportId: string | number; isPaid?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [794, 1123],
      });

      const pdfWidth = 794;
      const pdfHeight = 1123;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const scale = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * scale;
      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage([794, 1123]);
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`StoreLeak-Report-${reportId}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [reportId]);

  if (!isPaid) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        PDF Export (Paid)
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
      >
        {exporting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        )}
        {exporting ? "Generating..." : "Download PDF"}
      </button>

      {/* Hidden PDF print layout — off-screen but fully rendered for html2canvas */}
      <div
        ref={containerRef}
        style={{ position: "fixed", left: "-9999px", top: 0 }}
        aria-hidden="true"
      >
        <PdfContent data={data} />
      </div>
    </>
  );
}
