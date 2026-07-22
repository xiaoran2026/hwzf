"use client";

import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { ReportData } from "@/lib/types";

const fmtCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);
const fmtPercent = (v: number) => `${v.toFixed(1)}%`;
const fmtDate = (d: string) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return d; }
};

function healthColor(score: number) {
  if (score >= 70) return { text: "#059669", bg: "#ecfdf5", label: "Good" };
  if (score >= 40) return { text: "#d97706", bg: "#fffbeb", label: "Fair" };
  return { text: "#dc2626", bg: "#fef2f2", label: "Poor" };
}

function InsightBlock({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  if (!items.length) return null;
  const colors: Record<string, string> = {
    blue: "#3b82f6", red: "#ef4444", purple: "#8b5cf6", emerald: "#10b981", amber: "#f59e0b",
  };
  const color = colors[accent] || colors.blue;
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 3, minWidth: 3, height: "100%", minHeight: 24, backgroundColor: color, borderRadius: 2, marginTop: 2 }} />
            <p style={{ fontSize: 11, lineHeight: 1.5, color: "#374151", margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== PDF Print Layout ==========
function PdfContent({ data }: { data: ReportData }) {
  const hc = healthColor(data.healthScore);
  const sa = data.salesAnalysis;
  const ca = data.customerAnalysis;

  return (
    <div
      id="report-pdf-content"
      style={{
        width: 794,
        padding: 40,
        backgroundColor: "#ffffff",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#111827",
        boxSizing: "border-box",
      }}
    >
      {/* Header / Branding */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: -0.5 }}>StoreAI Doctor</h1>
          <p style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 0" }}>AI-Powered Store Analytics Report</p>
        </div>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{fmtDate(new Date().toISOString())}</p>
      </div>

      {/* Health Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, padding: 16, backgroundColor: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", border: `4px solid ${hc.text}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: hc.text }}>{data.healthScore}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: hc.text, backgroundColor: hc.bg, padding: "1px 6px", borderRadius: 10 }}>{hc.label}</span>
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Store Health Summary</h2>
          <p style={{ fontSize: 11, lineHeight: 1.5, color: "#4b5563", margin: 0 }}>{data.summary}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Revenue", value: sa ? fmtCurrency(sa.totalRevenue) : "—", color: "#059669" },
          { label: "Total Orders", value: sa ? fmtNumber(sa.totalOrders) : "—", color: "#3b82f6" },
          { label: "Avg Order Value", value: sa ? fmtCurrency(sa.averageOrderValue) : "—", color: "#8b5cf6" },
          { label: "Repeat Rate", value: ca ? fmtPercent(ca.repeatRate) : "—", color: "#d97706" },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 8, border: "1px solid #f3f4f6", backgroundColor: "#ffffff" }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>{kpi.label}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: kpi.color, margin: 0 }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts placeholder note */}
      <div style={{ marginBottom: 24, padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
        <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, textAlign: "center" }}>
          Revenue, Orders and Product charts are available in the interactive dashboard.
        </p>
      </div>

      {/* Insights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
        <InsightBlock title="Sales Insights" items={data.salesInsights} accent="blue" />
        <InsightBlock title="Product Insights" items={data.productInsights} accent="purple" />
        <InsightBlock title="Customer Insights" items={data.customerInsights} accent="emerald" />
        <InsightBlock title="Problems Identified" items={data.problems} accent="red" />
      </div>

      {/* Recommendations */}
      <InsightBlock title="Recommendations" items={data.recommendations} accent="amber" />

      {/* Footer */}
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
        <p style={{ fontSize: 9, color: "#9ca3af", margin: 0 }}>Generated by StoreAI Doctor — storeai-doctor.com</p>
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

      // Calculate how many pages we need
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

      pdf.save(`StoreAI-Report-${reportId}.pdf`);
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
