"use client";

import Link from "next/link";
import type { AIInsight, AIPrediction, AIRecommendation, AIAction, DailyDigest } from "@/lib/ai-engine";

// ---- Icon Map ----

const ICONS: Record<string, (cls: string) => React.ReactNode> = {
  trend_up: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  ),
  trend_down: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
  ),
  alert: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
  ),
  lightbulb: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
  ),
  shield: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  ),
  target: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  chart: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  users: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  ),
  package: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  ),
  megaphone: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
  ),
  sparkles: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
  ),
};

const ACCENT_MAP: Record<string, { bg: string; icon: string; text: string; border: string }> = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-500",    text: "text-blue-800",    border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-800", border: "border-emerald-200" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-500",   text: "text-amber-800",   border: "border-amber-200" },
  red:     { bg: "bg-red-50",     icon: "text-red-500",     text: "text-red-800",     border: "border-red-200" },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-500",  text: "text-purple-800",  border: "border-purple-200" },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-500",  text: "text-indigo-800",  border: "border-indigo-200" },
};

// ---- AI Badge ----

export function AIBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "sparkle" }) {
  if (variant === "sparkle") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
        {ICONS.sparkles("w-3 h-3")}
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider">
      {ICONS.sparkles("w-3 h-3")}
      {children}
    </span>
  );
}

// ---- Insight Card ----

export function AIInsightCard({ insight, index = 0 }: { insight: AIInsight; index?: number }) {
  const a = ACCENT_MAP[insight.accent] || ACCENT_MAP.blue;
  const IconComponent = ICONS[insight.icon] || ICONS.lightbulb;
  return (
    <div
      className={`relative p-4 rounded-xl border ${a.border} ${a.bg} animate-in`}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${a.icon}`}>{IconComponent("w-4 h-4")}</div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${a.text}`}>{insight.title}</p>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

// ---- Prediction Card ----

export function AIPredictionCard({ prediction }: { prediction: AIPrediction }) {
  const dirColor = prediction.direction === "up" ? "text-emerald-500" : prediction.direction === "down" ? "text-red-500" : "text-gray-400";
  const dirBg = prediction.direction === "up" ? "bg-emerald-50" : prediction.direction === "down" ? "bg-red-50" : "bg-gray-50";
  const dirIcon = prediction.direction === "up" ? "trend_up" : prediction.direction === "down" ? "trend_down" : "chart";
  const DirIcon = ICONS[dirIcon];
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
      <div className={`shrink-0 w-9 h-9 rounded-lg ${dirBg} flex items-center justify-center ${dirColor}`}>
        {DirIcon("w-4 h-4")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{prediction.metric}</p>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${dirBg} ${dirColor}`}>
            {prediction.direction}
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{prediction.detail}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${prediction.direction === "up" ? "bg-emerald-500" : prediction.direction === "down" ? "bg-red-400" : "bg-gray-400"}`}
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-gray-400">{prediction.confidence}% confidence</span>
        </div>
      </div>
    </div>
  );
}

// ---- Recommendation Card ----

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};
const EFFORT_STYLE: Record<string, string> = {
  quick: "text-emerald-600",
  medium: "text-amber-600",
  significant: "text-red-600",
};

export function AIRecommendationCard({ rec, index = 0 }: { rec: AIRecommendation; index?: number }) {
  return (
    <div
      className="p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors animate-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 text-blue-500">{ICONS.lightbulb("w-4 h-4")}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
          <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{rec.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${IMPACT_STYLE[rec.impact]}`}>
              {rec.impact} impact
            </span>
            <span className={`text-[10px] font-medium ${EFFORT_STYLE[rec.effort]}`}>
              {rec.effort} effort
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Next Action Button ----

const URGENCY_STYLE: Record<string, { ring: string; text: string; bg: string; pulse?: string }> = {
  critical: { ring: "ring-red-500/30", text: "text-red-700", bg: "bg-red-50 hover:bg-red-100", pulse: "animate-pulse" },
  high:     { ring: "ring-amber-500/20", text: "text-amber-700", bg: "bg-amber-50 hover:bg-amber-100" },
  medium:   { ring: "ring-blue-500/20", text: "text-blue-700", bg: "bg-blue-50 hover:bg-blue-100" },
  low:      { ring: "ring-gray-300/30", text: "text-gray-600", bg: "bg-gray-50 hover:bg-gray-100" },
};

export function AINextAction({ action }: { action: AIAction }) {
  const u = URGENCY_STYLE[action.urgency] || URGENCY_STYLE.medium;
  const isExternal = action.href.startsWith("http");
  const Tag = isExternal ? "a" : Link;
  return (
    <Tag
      href={action.href}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${u.bg} ${u.text} ring-1 ${u.ring} transition-all ${u.pulse || ""}`}
    >
      {action.urgency === "critical" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {action.label}
      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Tag>
  );
}

// ---- Daily Digest Hero ----

export function AIDailyDigest({ digest, primaryAction }: { digest: DailyDigest; primaryAction?: AIAction }) {
  return (
    <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-950 to-gray-900 text-white overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          {ICONS.sparkles("w-4 h-4 text-blue-400")}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400">AI Assistant</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">{digest.greeting}. Here's what I see.</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-2xl">{digest.summary}</p>

        {primaryAction && (
          <div className="mb-6">
            <AINextActionLight action={primaryAction} />
          </div>
        )}

        {digest.insights.length > 0 && (
          <div className="space-y-2">
            {digest.insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <div className="shrink-0 mt-0.5 text-blue-400">{ICONS[insight.icon]?.("w-3.5 h-3.5") || ICONS.lightbulb("w-3.5 h-3.5")}</div>
                <div>
                  <p className="text-[13px] font-medium text-gray-200">{insight.title}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{insight.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AINextActionLight({ action }: { action: AIAction }) {
  const isExternal = action.href.startsWith("http");
  const Tag = isExternal ? "a" : Link;
  const isCritical = action.urgency === "critical";
  return (
    <Tag
      href={action.href}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isCritical
          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-900/30"
          : "bg-white text-gray-900 hover:bg-gray-100"
      }`}
    >
      {isCritical && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      {action.label}
      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Tag>
  );
}

// ---- AI Section Header ----

export function AISection({ title, description, badge, children, className = "" }: {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          {ICONS.sparkles("w-3.5 h-3.5 text-white")}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{title}</h2>
            {badge && <AIBadge>{badge}</AIBadge>}
          </div>
          {description && <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// ---- Billing AI Signal ----

const SEVERITY_STYLE: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  urgent:  { bg: "bg-red-50",   border: "border-red-200",   icon: "text-red-500",   text: "text-red-800" },
  warning: { bg: "bg-amber-50",  border: "border-amber-200",  icon: "text-amber-500",  text: "text-amber-800" },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-500",   text: "text-blue-800" },
};

export function AIBillingSignal({ signal }: { signal: { headline: string; body: string; action?: AIAction; severity: "info" | "warning" | "urgent" } }) {
  const s = SEVERITY_STYLE[signal.severity] || SEVERITY_STYLE.info;
  return (
    <div className={`p-4 rounded-xl border ${s.border} ${s.bg} animate-in`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${s.icon}`}>{ICONS.alert("w-4 h-4")}</div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${s.text}`}>{signal.headline}</p>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{signal.body}</p>
          {signal.action && (
            <div className="mt-3">
              <AINextAction action={signal.action} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- AI Thinking Dots ----

export function AIThinkingDots({ text = "Analyzing" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {ICONS.sparkles("w-3.5 h-3.5 animate-pulse")}
      <span>{text}</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
    </div>
  );
}

// ---- Store Priority Indicator ----

export function AIStorePriority({ signal, index = 0 }: { signal: { priority: number; headline: string; reason: string; action: AIAction; healthTrend: "improving" | "stable" | "declining" }; index?: number }) {
  const trendIcon = signal.healthTrend === "improving" ? "trend_up" : signal.healthTrend === "declining" ? "trend_down" : "chart";
  const trendColor = signal.healthTrend === "improving" ? "text-emerald-500" : signal.healthTrend === "declining" ? "text-red-500" : "text-gray-400";
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors animate-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <div className={`shrink-0 ${trendColor}`}>{ICONS[trendIcon]?.("w-4 h-4")}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-gray-900 truncate">{signal.headline}</p>
        <p className="text-[12px] text-gray-500 truncate">{signal.reason}</p>
      </div>
      <Link href={signal.action.href} className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
        {signal.action.label} →
      </Link>
    </div>
  );
}

// ---- Report Comparison Insight ----

export function AIReportDigest({ digest, healthTrajectory }: { digest: string; healthTrajectory: string }) {
  const trajColor = healthTrajectory === "up" ? "text-emerald-500" : healthTrajectory === "down" ? "text-red-500" : "text-gray-400";
  const trajIcon = healthTrajectory === "up" ? "trend_up" : healthTrajectory === "down" ? "trend_down" : "chart";
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white">
        {ICONS.sparkles("w-4 h-4")}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Summary</span>
          <span className={`inline-flex items-center gap-1 ${trajColor}`}>
            {ICONS[trajIcon]?.("w-3 h-3")}
            <span className="text-[11px] font-semibold capitalize">{healthTrajectory}</span>
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{digest}</p>
      </div>
    </div>
  );
}