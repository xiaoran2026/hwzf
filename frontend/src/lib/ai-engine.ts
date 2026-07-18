// ============================================================
// StoreAI Doctor — Client-Side AI Decision Engine
// Transforms raw data into actionable intelligence.
// Each analyzer takes available data and returns structured
// AI insights, predictions, and next-action recommendations.
// ============================================================

// ---- Types ----

export interface AIAction {
  label: string;
  href: string;
  urgency: "critical" | "high" | "medium" | "low";
  category: "upload" | "analysis" | "strategy" | "billing" | "explore";
}

export interface HealthDimension {
  name: string;
  key: "revenue_growth" | "customer_retention" | "product_performance" | "conversion" | "marketing_efficiency";
  score: number;
  evidence: string[];
  confidence: number;
  trend: "up" | "down" | "flat";
  maxPotential: number;
}

export interface CustomerSegment {
  name: string;
  key: "new" | "returning" | "vip" | "at_risk" | "lost";
  count: number;
  value: number;
  percentage: number;
  insight: string;
}

export interface ProductHealth {
  name: string;
  revenue: number;
  quantity: number;
  avgPrice: number;
  healthScore: number;
  trend: "growing" | "stable" | "declining";
  diagnosis: string;
  recommendations: string[];
  category: "winner" | "opportunity" | "at_risk" | "declining";
}

export interface RevenueForecast {
  period: string;
  expectedRevenue: number;
  bestCase: number;
  worstCase: number;
  dailyBreakdown: Array<{ day: number; expected: number; bestCase: number; worstCase: number }>;
  riskFactors: string[];
  growthOpportunities: string[];
  confidence: number;
  basis: string;
  assumptions: string[];
}

export interface AIActionableCampaign {
  id: string;
  problem: string;
  campaignTitle: string;
  target: string;
  emailTitle: string;
  expectedCustomers: number;
  revenueOpportunity: number;
  confidence: number;
  steps: string[];
  effort: "quick" | "medium" | "significant";
}

export interface AIRecommendAction {
  title: string;
  description: string;
  expectedImpact: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface AIPrediction {
  metric: string;
  direction: "up" | "down" | "flat";
  confidence: number; // 0-100
  detail: string;
}

export interface AIInsight {
  icon: "trend_up" | "trend_down" | "alert" | "lightbulb" | "shield" | "target" | "chart" | "users" | "package" | "megaphone";
  title: string;
  body: string;
  accent: "blue" | "emerald" | "amber" | "red" | "purple" | "indigo";
}

export interface AIRecommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "quick" | "medium" | "significant";
  category: "revenue" | "retention" | "acquisition" | "product" | "pricing" | "marketing";
}

export interface StoreAISignal {
  storeId: number;
  storeName: string;
  priority: number; // 0-100
  headline: string;
  reason: string;
  action: AIAction;
  healthTrend: "improving" | "stable" | "declining";
}

export interface BillingAISignal {
  headline: string;
  body: string;
  action?: AIAction;
  severity: "info" | "warning" | "urgent";
}

export interface DailyDigest {
  greeting: string;
  summary: string;
  topPriority: AIAction;
  insights: AIInsight[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
}

// ---- Helpers ----

const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`;
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(Math.round(v));

function trendDirection(data: number[]): "up" | "down" | "flat" {
  if (data.length < 3) return "flat";
  const recent = data.slice(-3);
  const older = data.slice(-6, -3);
  if (older.length === 0) return "flat";
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  if (olderAvg === 0) return recentAvg > 0 ? "up" : "flat";
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  if (change > 5) return "up";
  if (change < -5) return "down";
  return "flat";
}

// ---- Dashboard AI Engine ----

export interface DashboardAIContext {
  healthScore: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  repeatRate: number;
  topProducts: { name: string; revenue: number; quantity: number }[];
  monthlyRevenueTrend: { month: string; revenue: number }[];
  monthlyOrdersTrend: { month: string; orders: number }[];
  storeName?: string;
  storeId?: number;
  summary?: string;
}

export function analyzeDashboard(ctx: DashboardAIContext) {
  const insights: AIInsight[] = [];
  const predictions: AIPrediction[] = [];
  const recommendations: AIRecommendation[] = [];
  const actions: AIAction[] = [];

  // ---- Health Score Analysis ----
  if (ctx.healthScore >= 75) {
    insights.push({
      icon: "shield",
      title: "Store Health is Strong",
      body: `Your health score of ${ctx.healthScore} indicates solid performance across key metrics. Maintain current strategies and monitor for changes.`,
      accent: "emerald",
    });
  } else if (ctx.healthScore >= 40) {
    insights.push({
      icon: "alert",
      title: "Room for Improvement",
      body: `Health score ${ctx.healthScore} suggests emerging issues. Review product mix and customer retention for quick wins.`,
      accent: "amber",
    });
    actions.push({
      label: "Review Full Diagnosis",
      href: ctx.storeId ? `/reports` : "/reports",
      urgency: "high",
      category: "explore",
    });
  } else {
    insights.push({
      icon: "alert",
      title: "Health Score Needs Attention",
      body: `At ${ctx.healthScore}, your store shows significant risk factors. Immediate action on top issues could prevent further decline.`,
      accent: "red",
    });
    actions.push({
      label: "View Critical Report",
      href: ctx.storeId ? `/reports` : "/reports",
      urgency: "critical",
      category: "explore",
    });
  }

  // ---- Revenue Trend Prediction ----
  const revData = ctx.monthlyRevenueTrend.map((d) => d.revenue);
  const revTrend = trendDirection(revData);
  if (revTrend === "up") {
    const growth = revData.length >= 2 ? ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100 : 0;
    predictions.push({
      metric: "Revenue",
      direction: "up",
      confidence: Math.min(85, 50 + Math.abs(growth)),
      detail: `Revenue trending upward. Based on ${revData.length} months of data, expect continued growth if current trajectory holds.`,
    });
    insights.push({
      icon: "trend_up",
      title: "Revenue Momentum",
      body: `Monthly revenue is growing. Your most recent month shows ${fmtCurrency(revData[revData.length - 1])} — ${growth > 0 ? fmtPct(growth) + " vs prior month" : "stable"}.`,
      accent: "blue",
    });
  } else if (revTrend === "down") {
    const decline = revData.length >= 2 ? ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100 : 0;
    predictions.push({
      metric: "Revenue",
      direction: "down",
      confidence: Math.min(80, 50 + Math.abs(decline)),
      detail: `Revenue showing decline over the last 3 months. Investigate seasonal patterns or product mix shifts.`,
    });
    insights.push({
      icon: "trend_down",
      title: "Revenue Declining",
      body: `Revenue has been declining. Last month: ${fmtCurrency(revData[revData.length - 1])} (${fmtPct(decline)}). Consider promotional strategies or product diversification.`,
      accent: "red",
    });
    recommendations.push({
      title: "Launch a Targeted Promotion",
      description: "Revenue is declining — a time-limited discount on your top products can re-engage customers and boost short-term revenue.",
      impact: "high",
      effort: "quick",
      category: "marketing",
    });
  }

  // ---- Product Concentration Risk ----
  if (ctx.topProducts.length > 0) {
    const topRev = ctx.topProducts[0].revenue;
    const topShare = ctx.totalRevenue > 0 ? (topRev / ctx.totalRevenue) * 100 : 0;
    if (topShare > 40) {
      insights.push({
        icon: "alert",
        title: "High Product Concentration",
        body: `${ctx.topProducts[0].name} accounts for ${topShare.toFixed(0)}% of total revenue. Diversification reduces dependency risk.`,
        accent: "amber",
      });
      recommendations.push({
        title: "Diversify Product Portfolio",
        description: `${ctx.topProducts[0].name} drives ${topShare.toFixed(0)}% of revenue. Promote secondary products to reduce concentration risk.`,
        impact: "high",
        effort: "medium",
        category: "product",
      });
    } else if (topShare < 25 && ctx.topProducts.length >= 2) {
      insights.push({
        icon: "chart",
        title: "Well-Diversified Revenue",
        body: `No single product exceeds 25% of revenue. Your top 2 products share the load evenly — a healthy sign.`,
        accent: "emerald",
      });
    }
    // Cross-sell opportunity
    if (ctx.topProducts.length >= 2) {
      recommendations.push({
        title: "Create a Product Bundle",
        description: `Bundle ${ctx.topProducts[0].name} with ${ctx.topProducts[1].name} — customers buying both could increase AOV by an estimated 15-25%.`,
        impact: "medium",
        effort: "quick",
        category: "product",
      });
    }
  }

  // ---- Customer Retention Analysis ----
  if (ctx.repeatRate > 0.5) {
    insights.push({
      icon: "users",
      title: "Strong Customer Loyalty",
      body: `${(ctx.repeatRate * 100).toFixed(0)}% repeat purchase rate is excellent. Consider a loyalty program to further increase lifetime value.`,
      accent: "purple",
    });
    recommendations.push({
      title: "Launch a Loyalty Program",
      description: `With ${(ctx.repeatRate * 100).toFixed(0)}% repeat rate, a tiered loyalty program could increase customer lifetime value by 20-30%.`,
      impact: "high",
      effort: "significant",
      category: "retention",
    });
  } else if (ctx.repeatRate > 0 && ctx.repeatRate < 0.25) {
    insights.push({
      icon: "alert",
      title: "Low Repeat Purchase Rate",
      body: `Only ${(ctx.repeatRate * 100).toFixed(0)}% of customers return. This suggests post-purchase engagement gaps or product-market fit issues.`,
      accent: "red",
    });
    predictions.push({
      metric: "Customer Churn",
      direction: "down",
      confidence: 70,
      detail: `Low repeat rate (${(ctx.repeatRate * 100).toFixed(0)}%) signals high churn risk. Without intervention, customer base may shrink.`,
    });
    recommendations.push({
      title: "Improve Post-Purchase Engagement",
      description: "Low repeat rate suggests customers aren't coming back. Add email follow-ups, personalized recommendations, or a first-purchase discount.",
      impact: "high",
      effort: "medium",
      category: "retention",
    });
  }

  // ---- AOV Analysis ----
  if (ctx.averageOrderValue > 0) {
    if (ctx.topProducts.length >= 2) {
      const bundleAOV = ctx.topProducts.slice(0, 2).reduce((s, p) => s + (p.revenue / Math.max(1, p.quantity)), 0);
      if (bundleAOV > ctx.averageOrderValue * 1.2) {
        insights.push({
          icon: "lightbulb",
          title: "AOV Upsell Opportunity",
          body: `Your top 2 products together average ${fmtCurrency(bundleAOV)} per item. Cross-selling could raise AOV from ${fmtCurrency(ctx.averageOrderValue)}.`,
          accent: "blue",
        });
      }
    }
  }

  // ---- Orders Trend ----
  const ordData = ctx.monthlyOrdersTrend.map((d) => d.orders);
  const ordTrend = trendDirection(ordData);
  if (ordTrend === "up") {
    predictions.push({
      metric: "Orders",
      direction: "up",
      confidence: 70,
      detail: `Order volume is growing. Expect continued increase based on ${ordData.length} months of upward trend.`,
    });
  }

  // ---- Smart Next Actions ----
  if (ctx.totalOrders === 0) {
    actions.unshift({
      label: "Upload Your First CSV",
      href: ctx.storeId ? `/stores/${ctx.storeId}/upload` : "/stores",
      urgency: "critical",
      category: "upload",
    });
  }

  return { insights, predictions, recommendations, actions };
}

// ---- Store List AI Engine ----

export interface StoreItemContext {
  storeId: number;
  storeName: string;
  platform: string;
  healthScore: number;
  totalReports: number;
  totalRevenue: number;
  totalOrders: number;
  latestUploadDate: string | null;
  lastAnalysisDate: string | null;
  createdAt: string;
}

export function analyzeStores(stores: StoreItemContext[]): {
  signals: StoreAISignal[];
  digest: string;
  topAction: AIAction;
} {
  const signals: StoreAISignal[] = [];

  // Sort by priority
  const scored = stores.map((s) => {
    let priority = 50;
    let headline = "";
    let reason = "";
    let healthTrend: StoreAISignal["healthTrend"] = "stable";
    let action: AIAction;

    // Health-based scoring
    if (s.healthScore < 40) {
      priority += 30;
      headline = `${s.storeName} needs urgent attention`;
      reason = `Health score dropped to ${s.healthScore}. Review latest report for actionable insights.`;
      action = { label: "View Report", href: `/stores/${s.storeId}`, urgency: "critical", category: "explore" };
      healthTrend = "declining";
    } else if (s.healthScore < 65) {
      priority += 15;
      headline = `${s.storeName} has room to improve`;
      reason = `Health score ${s.healthScore} — a few strategic changes could push it above 70.`;
      action = { label: "Explore Insights", href: `/stores/${s.storeId}`, urgency: "high", category: "explore" };
      healthTrend = "stable";
    } else {
      headline = `${s.storeName} is performing well`;
      reason = `Health score ${s.healthScore} — maintain current strategies and look for growth opportunities.`;
      action = { label: "View Details", href: `/stores/${s.storeId}`, urgency: "low", category: "explore" };
      healthTrend = "improving";
    }

    // Staleness penalty
    if (s.lastAnalysisDate) {
      const daysSince = (Date.now() - new Date(s.lastAnalysisDate).getTime()) / 86400000;
      if (daysSince > 30) {
        priority += 10;
        headline = `${s.storeName} data is outdated`;
        reason = `Last analyzed ${Math.floor(daysSince)} days ago. Upload fresh data for accurate AI insights.`;
        action = { label: "Upload Data", href: `/stores/${s.storeId}/upload`, urgency: "high", category: "upload" };
      }
    } else if (s.totalReports === 0) {
      priority += 20;
      headline = `${s.storeName} has no data yet`;
      reason = "Upload your first CSV file to unlock AI-powered analytics and recommendations.";
      action = { label: "Upload CSV", href: `/stores/${s.storeId}/upload`, urgency: "high", category: "upload" };
    }

    if (s.latestUploadDate && !s.lastAnalysisDate) {
      priority += 15;
      headline = `Data uploaded for ${s.storeName} — open the report path`;
      reason = "You have uploaded data but have not generated the first report yet.";
      action = { label: "Open Store", href: `/stores/${s.storeId}`, urgency: "high", category: "analysis" };
    }

    return { ...s, priority, headline, reason, action: action!, healthTrend };
  });

  scored.sort((a, b) => b.priority - a.priority);

  for (const s of scored) {
    signals.push({
      storeId: s.storeId,
      storeName: s.storeName,
      priority: s.priority,
      headline: s.headline,
      reason: s.reason,
      action: s.action,
      healthTrend: s.healthTrend,
    });
  }

  // Digest
  let digest = "";
  const healthy = signals.filter((s) => s.healthTrend === "improving").length;
  const atRisk = signals.filter((s) => s.healthTrend === "declining").length;
  if (stores.length === 0) {
    digest = "No stores yet. Add your first store to start getting AI-powered insights.";
  } else if (atRisk > 0) {
    digest = `${atRisk} of your ${stores.length} store${stores.length > 1 ? "s" : ""} ${atRisk > 1 ? "need" : "needs"} attention. Focus on ${signals[0].storeName} first.`;
  } else if (healthy === stores.length) {
    digest = `All ${stores.length} stores are healthy. Look for growth opportunities and expansion strategies.`;
  } else {
    digest = `You have ${stores.length} stores. ${signals[0].storeName} should be your focus today.`;
  }

  const topAction: AIAction = signals[0]?.action || {
    label: "Add Your First Store",
    href: "/stores?action=create",
    urgency: "high",
    category: "strategy",
  };

  return { signals, digest, topAction };
}

// ---- Store Detail AI Engine ----

export interface StoreDetailContext extends DashboardAIContext {
  totalReports: number;
  totalUploads: number;
  latestUploadDate: string | null;
  lastAnalysisDate: string | null;
  createdAt: string;
}

export function analyzeStoreDetail(ctx: StoreDetailContext) {
  const insights: AIInsight[] = [];
  const predictions: AIPrediction[] = [];
  const recommendations: AIRecommendation[] = [];
  const actions: AIAction[] = [];

  // Reuse dashboard analysis
  const dashResult = analyzeDashboard(ctx);
  insights.push(...dashResult.insights);
  predictions.push(...dashResult.predictions);
  recommendations.push(...dashResult.recommendations);

  // Data freshness check
  if (ctx.lastAnalysisDate) {
    const daysSince = (Date.now() - new Date(ctx.lastAnalysisDate).getTime()) / 86400000;
    if (daysSince > 14) {
      insights.unshift({
        icon: "alert",
        title: "Data May Be Outdated",
        body: `Last analyzed ${Math.floor(daysSince)} days ago. Upload fresh data for more accurate AI recommendations.`,
        accent: "amber",
      });
      actions.unshift({
        label: "Upload Fresh Data",
        href: `/stores/${ctx.storeId}/upload`,
        urgency: "high",
        category: "upload",
      });
    }
  }

  if (ctx.totalReports === 0 && ctx.totalUploads > 0) {
    actions.unshift({
      label: "Run Your First Analysis",
      href: `/stores/${ctx.storeId}`,
      urgency: "critical",
      category: "analysis",
    });
  }

  // Revenue forecast
  const revData = ctx.monthlyRevenueTrend.map((d) => d.revenue);
  if (revData.length >= 3) {
    const last3 = revData.slice(-3);
    const avgGrowth = last3.length > 1
      ? last3.slice(1).map((v, i) => ((v - last3[i]) / Math.max(1, last3[i])) * 100).reduce((a, b) => a + b, 0) / (last3.length - 1)
      : 0;
    const projected = revData[revData.length - 1] * (1 + avgGrowth / 100);
    predictions.push({
      metric: "Next Month Revenue",
      direction: avgGrowth > 0 ? "up" : avgGrowth < -3 ? "down" : "flat",
      confidence: Math.min(75, 40 + revData.length * 5),
      detail: `Based on recent trends, projected next-month revenue is approximately ${fmtCurrency(projected)} (${avgGrowth > 0 ? "+" : ""}${avgGrowth.toFixed(1)}% growth).`,
    });
  }

  // Growth opportunity
  if (ctx.topProducts.length >= 2) {
    const slowest = [...ctx.topProducts].sort((a, b) => a.revenue - b.revenue)[0];
    recommendations.push({
      title: `Promote ${slowest.name}`,
      description: `${slowest.name} has the lowest revenue among your products. A targeted campaign could unlock untapped demand.`,
      impact: "medium",
      effort: "quick",
      category: "marketing",
    });
  }

  // Marketing suggestion
  if (ctx.repeatRate > 0.3) {
    recommendations.push({
      title: "Launch Referral Campaign",
      description: `With ${(ctx.repeatRate * 100).toFixed(0)}% repeat rate, your customers are engaged. A referral program could reduce acquisition cost by 25%.`,
      impact: "high",
      effort: "medium",
      category: "marketing",
    });
  }

  return { insights, predictions, recommendations, actions };
}

// ---- Reports AI Engine ----

export interface ReportsAIContext {
  reports: {
    reportId: number;
    storeId: number;
    storeName: string;
    healthScore: number;
    totalRevenue: number;
    totalOrders: number;
    repeatRate: number;
    averageOrderValue: number;
    summary: string;
    createdAt: string;
  }[];
}

export function analyzeReports(ctx: ReportsAIContext) {
  const insights: AIInsight[] = [];
  const recommendations: AIRecommendation[] = [];
  const actions: AIAction[] = [];

  if (ctx.reports.length === 0) {
    return {
      insights: [{ icon: "lightbulb", title: "No Reports Yet", body: "Upload CSV data to generate your first revenue leak report preview.", accent: "blue" }],
      predictions: [],
      recommendations: [],
      actions: [{ label: "Upload Data", href: "/stores", urgency: "high", category: "upload" }],
      digest: "No reports generated yet. Start by uploading your store data.",
      healthTrajectory: "unknown" as const,
    };
  }

  // Health trajectory
  const scores = ctx.reports.slice(0, 5).map((r) => r.healthScore).reverse();
  const healthTrajectory = trendDirection(scores);

  // Cross-report comparison
  if (ctx.reports.length >= 2) {
    const latest = ctx.reports[0];
    const prev = ctx.reports[1];
    if (prev.totalRevenue > 0) {
      const revChange = ((latest.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100;
      if (Math.abs(revChange) > 5) {
        insights.push({
          icon: revChange > 0 ? "trend_up" : "trend_down",
          title: `Revenue ${revChange > 0 ? "Improved" : "Declined"} ${Math.abs(revChange).toFixed(0)}%`,
          body: `Latest report shows ${fmtCurrency(latest.totalRevenue)} vs ${fmtCurrency(prev.totalRevenue)} in the previous period.`,
          accent: revChange > 0 ? "emerald" : "amber",
        });
      }
    }
    if (latest.healthScore !== prev.healthScore) {
      const diff = latest.healthScore - prev.healthScore;
      if (Math.abs(diff) >= 5) {
        insights.push({
          icon: diff > 0 ? "trend_up" : "trend_down",
          title: `Health Score ${diff > 0 ? "Up" : "Down"} ${Math.abs(diff)} Points`,
          body: `Your store health moved from ${prev.healthScore} to ${latest.healthScore} between the last two analyses.`,
          accent: diff > 0 ? "emerald" : "amber",
        });
      }
    }
  }

  // Recurring problems detection
  const lowHealthReports = ctx.reports.filter((r) => r.healthScore < 50);
  if (lowHealthReports.length >= 2) {
    insights.push({
      icon: "alert",
      title: "Persistent Health Issues",
      body: `${lowHealthReports.length} of your last ${ctx.reports.length} reports show health scores below 50. Consider a strategic review.`,
      accent: "red",
    });
    recommendations.push({
      title: "Conduct Strategic Review",
      description: "Persistent low health scores indicate systemic issues. A deep-dive into product mix, pricing, and customer experience is recommended.",
      impact: "high",
      effort: "significant",
      category: "product",
    });
  }

  // Best performing store
  const byStore = new Map<string, { revenue: number; health: number; count: number }>();
  ctx.reports.forEach((r) => {
    const existing = byStore.get(r.storeName) || { revenue: 0, health: 0, count: 0 };
    existing.revenue += r.totalRevenue;
    existing.health += r.healthScore;
    existing.count += 1;
    byStore.set(r.storeName, existing);
  });
  const bestStore = [...byStore.entries()].sort((a, b) => b[1].health / b[1].count - a[1].health / a[1].count)[0];
  if (bestStore && byStore.size > 1) {
    insights.push({
      icon: "shield",
      title: `${bestStore[0]} is Your Strongest Store`,
      body: `Average health score ${Math.round(bestStore[1].health / bestStore[1].count)} — analyze what's working and apply to other stores.`,
      accent: "blue",
    });
  }

  // Suggest next action
  if (ctx.reports[0]?.healthScore < 60) {
    actions.push({ label: "Review Latest Diagnosis", href: `/reports/${ctx.reports[0].reportId}`, urgency: "high", category: "explore" });
  } else {
    actions.push({ label: "Explore Growth Opportunities", href: `/reports/${ctx.reports[0].reportId}`, urgency: "medium", category: "strategy" });
  }

  // Digest
  const avgHealth = ctx.reports.reduce((s, r) => s + r.healthScore, 0) / ctx.reports.length;
  const digest = `Average health across ${ctx.reports.length} report${ctx.reports.length > 1 ? "s" : ""}: ${avgHealth.toFixed(0)}/100. ${healthTrajectory === "up" ? "Trending upward." : healthTrajectory === "down" ? "Trending downward — take action." : "Stable. Look for growth levers."}`;

  return { insights, predictions: [], recommendations, actions, digest, healthTrajectory };
}

// ---- Billing AI Engine ----

export interface BillingAIContext {
  currentPlan: string;
  storesUsed: number;
  storeLimit: number;
  csvRowsUsed: number;
  csvRowLimit: number;
  remainingQuota: number;
  storeUsagePct: number;
  csvUsagePct: number;
  nextResetDate: string | null;
  paymentHistory: { amount: number; createdAt: string }[];
}

export function analyzeBilling(ctx: BillingAIContext) {
  const signals: BillingAISignal[] = [];
  const recommendations: AIRecommendation[] = [];

  const isPro = ctx.currentPlan.toUpperCase() === "PRO";
  const daysUntilReset = ctx.nextResetDate
    ? Math.max(0, Math.ceil((new Date(ctx.nextResetDate).getTime() - Date.now()) / 86400000))
    : null;

  // CSV quota warning
  if (ctx.csvUsagePct >= 80) {
    const urgency = ctx.csvUsagePct >= 95 ? "urgent" : "warning";
    signals.push({
      headline: ctx.csvUsagePct >= 95 ? "CSV Quota Almost Exhausted" : "CSV Usage Approaching Limit",
      body: `You've used ${ctx.csvUsagePct.toFixed(0)}% of your monthly CSV quota${daysUntilReset !== null ? ` with ${daysUntilReset} days remaining` : ""}. ${ctx.csvUsagePct >= 95 ? "Consider upgrading to avoid analysis interruptions." : "Plan your uploads carefully or upgrade for more capacity."}`,
      action: !isPro ? { label: "Upgrade to Pro", href: "#plans", urgency: ctx.csvUsagePct >= 95 ? "high" : "medium", category: "billing" } : undefined,
      severity: urgency,
    });
  }

  // Store limit
  if (ctx.storeUsagePct >= 100 && !isPro) {
    signals.push({
      headline: "All Store Slots Used",
      body: "You've reached your store limit. Upgrade to add more stores and get AI insights across your entire portfolio.",
      action: { label: "Upgrade to Pro", href: "#plans", urgency: "high", category: "billing" },
      severity: "warning",
    });
  } else if (ctx.storeUsagePct >= 80 && !isPro) {
    signals.push({
      headline: "Store Limit Almost Reached",
      body: `${ctx.storesUsed}/${ctx.storeLimit} stores used. Adding more stores requires an upgrade.`,
      severity: "info",
    });
  }

  // ROI suggestion
  if (!isPro && ctx.storesUsed >= 1 && ctx.csvUsagePct >= 50) {
    recommendations.push({
      title: "Upgrade for More AI Capacity",
      description: `You're actively using the platform with ${ctx.storesUsed} store${ctx.storesUsed > 1 ? "s" : ""}. Pro unlocks 50,000 CSV rows, 5 stores, and advanced AI features.`,
      impact: "high",
      effort: "quick",
      category: "pricing",
    });
  }

  // Pro value reminder
  if (isPro && ctx.csvUsagePct < 30 && ctx.storeUsagePct < 40) {
    signals.push({
      headline: "Maximize Your Pro Plan",
      body: `You're using ${ctx.csvUsagePct.toFixed(0)}% of CSV quota and ${ctx.storeUsagePct.toFixed(0)}% of stores. Upload more data to get deeper AI insights.`,
      severity: "info",
    });
  }

  // Spending insight
  if (ctx.paymentHistory.length > 0) {
    const totalSpent = ctx.paymentHistory.reduce((s, p) => s + p.amount, 0);
    if (totalSpent > 0) {
      signals.push({
        headline: `Total Investment: ${fmtCurrency(totalSpent)}`,
        body: `You've spent ${fmtCurrency(totalSpent)} across ${ctx.paymentHistory.length} payment${ctx.paymentHistory.length > 1 ? "s" : ""}. The AI insights from your reports help maximize this investment.`,
        severity: "info",
      });
    }
  }

  return { signals, recommendations };
}

// ---- Daily Digest (for Dashboard) ----

export function generateDailyDigest(
  dashboardCtx: DashboardAIContext | null,
  storeSignals: StoreAISignal[]
): DailyDigest {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const insights: AIInsight[] = [];
  const predictions: AIPrediction[] = [];
  const recommendations: AIRecommendation[] = [];

  if (dashboardCtx) {
    const result = analyzeDashboard(dashboardCtx);
    insights.push(...result.insights.slice(0, 3));
    predictions.push(...result.predictions.slice(0, 2));
    recommendations.push(...result.recommendations.slice(0, 3));
  }

  // Store-level signals
  const criticalStores = storeSignals.filter((s) => s.priority >= 70);
  if (criticalStores.length > 0) {
    insights.unshift({
      icon: "alert",
      title: `${criticalStores.length} Store${criticalStores.length > 1 ? "s" : ""} Need${criticalStores.length > 1 ? "" : "s"} Attention`,
      body: criticalStores.map((s) => s.headline).join(". ") + ".",
      accent: criticalStores[0].priority >= 80 ? "red" : "amber",
    });
  }

  const summary = storeSignals.length === 0
    ? "Get started by adding your first store and uploading data."
    : criticalStores.length > 0
      ? `You have ${criticalStores.length} store${criticalStores.length > 1 ? "s" : ""} that need${criticalStores.length === 1 ? "s" : ""} attention. ${criticalStores[0].headline}.`
      : `All stores are performing well. Focus on growth opportunities today.`;

  const topPriority: AIAction = criticalStores[0]?.action || {
    label: "Explore Dashboard",
    href: "/dashboard",
    urgency: "medium",
    category: "explore",
  };

  return { greeting, summary, topPriority, insights: insights.slice(0, 4), predictions: predictions.slice(0, 2), recommendations: recommendations.slice(0, 3) };
}



// ============================================================
// Diagnosis Workflow — AI Business Doctor
// Transforms raw data into a prioritized diagnostic narrative:
// 1. What happened? (Facts)
// 2. Why did it happen? (Root cause analysis)
// 3. How much does it matter? (Financial impact estimation)
// 4. What should I do? (Prioritized action plan)
// ============================================================

export interface DiagnosisFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "revenue" | "retention" | "product" | "acquisition" | "pricing" | "operations";
  title: string;
  description: string; // What happened
  rootCause: string;   // Why it happened
  financialImpact: {
    estimatedMonthlyImpact: number; // positive = opportunity, negative = loss
    confidence: number; // 0-100
    basis: string; // What data this is based on
  };
  action: {
    title: string;
    steps: string[];
    expectedOutcome: string;
    effort: "quick" | "medium" | "significant";
    timeline: string;
  };
}

export interface StoreDiagnosis {
  storeId?: number;
  storeName?: string;
  healthScore: number;
  healthTrend: "improving" | "stable" | "declining";
  overallAssessment: string; // 1-2 sentence AI summary
  biggestProblem: DiagnosisFinding | null;
  biggestOpportunity: DiagnosisFinding | null;
  findings: DiagnosisFinding[]; // All findings sorted by severity
  totalEstimatedOpportunity: number; // Sum of positive financial impacts
  totalEstimatedRisk: number; // Sum of negative financial impacts (absolute value)
  kpis: {
    revenue: number;
    orders: number;
    aov: number;
    repeatRate: number;
  };
  nextSteps: {
    immediate: string[];   // Do today
    thisWeek: string[];    // Do this week
    monitoring: string[];  // Keep watching
  };
}

function estimateImpactFromRevenue(
  totalRevenue: number,
  impactPct: number,
  confidence: number,
  basis: string
): DiagnosisFinding["financialImpact"] {
  return {
    estimatedMonthlyImpact: Math.round(totalRevenue * (impactPct / 100)),
    confidence,
    basis,
  };
}

export function generateDiagnosis(ctx: DashboardAIContext): StoreDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const revData = ctx.monthlyRevenueTrend.map((d) => d.revenue);
  const ordData = ctx.monthlyOrdersTrend.map((d) => d.orders);
  const revTrend = trendDirection(revData);
  const ordTrend = trendDirection(ordData);

  // --- Revenue Analysis ---
  if (revTrend === "down" && revData.length >= 2) {
    const decline = ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100;
    findings.push({
      id: "rev-decline",
      severity: Math.abs(decline) > 20 ? "critical" : "high",
      category: "revenue",
      title: "Revenue is Declining",
      description: `Monthly revenue dropped ${Math.abs(decline).toFixed(0)}%, from ${fmtCurrency(revData[revData.length - 2])} to ${fmtCurrency(revData[revData.length - 1])}.`,
      rootCause: revData.length >= 3
        ? `The decline started ${revData.length >= 4 ? "in recent months" : "last month"}. ${ctx.topProducts.length > 0 ? `Top product ${ctx.topProducts[0].name} may be losing momentum.` : "Product performance data suggests softening demand."}`
        : "Insufficient historical data to determine root cause with high confidence.",
      financialImpact: estimateImpactFromRevenue(
        ctx.totalRevenue,
        Math.abs(decline),
        Math.round(Math.min(80, 50 + Math.abs(decline))),
        `${revData.length} months of revenue trend data`
      ),
      action: {
        title: "Stabilize Revenue",
        steps: [
          "Review top product performance — identify which products are declining",
          "Check if traffic or conversion rate dropped (requires store analytics)",
          "Consider a time-limited promotion on best-sellers to re-engage customers",
        ],
        expectedOutcome: `Potentially recover ${fmtCurrency(Math.abs(ctx.totalRevenue * (decline / 100)))}/month`,
        effort: "medium",
        timeline: "1-2 weeks",
      },
    });
  } else if (revTrend === "up" && revData.length >= 2) {
    const growth = ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100;
    findings.push({
      id: "rev-growth",
      severity: "low",
      category: "revenue",
      title: "Revenue is Growing",
      description: `Monthly revenue increased ${growth.toFixed(0)}%, from ${fmtCurrency(revData[revData.length - 2])} to ${fmtCurrency(revData[revData.length - 1])}.`,
      rootCause: growth > 15
        ? "Strong growth likely driven by effective marketing, seasonal demand, or product-market fit."
        : "Moderate growth suggests steady business performance.",
      financialImpact: estimateImpactFromRevenue(
        ctx.totalRevenue,
        growth * 0.5,
        Math.min(70, 40 + growth),
        `Revenue growth trajectory over ${revData.length} months`
      ),
      action: {
        title: "Accelerate Growth",
        steps: [
          "Identify what's driving growth and double down",
          "Increase ad spend proportionally to maintain momentum",
          "Expand product selection around top performers",
        ],
        expectedOutcome: `Could add ${fmtCurrency(ctx.totalRevenue * (growth / 100) * 0.5)}/month if growth continues`,
        effort: "medium",
        timeline: "2-4 weeks",
      },
    });
  }

  // --- Customer Retention ---
  if (ctx.repeatRate === 0 && ctx.totalOrders > 5) {
    findings.push({
      id: "no-repeat",
      severity: "critical",
      category: "retention",
      title: "Zero Repeat Customers",
      description: `With ${ctx.totalOrders} total orders, not a single customer has returned. This means 100% of revenue depends on new customer acquisition.`,
      rootCause: "Common causes: no post-purchase follow-up, no loyalty incentives, product-market fit issues, or poor customer experience.",
      financialImpact: estimateImpactFromRevenue(
        ctx.totalRevenue,
        25,
        72,
        "Industry benchmarks show 20-40% revenue lift from repeat customers"
      ),
      action: {
        title: "Launch Customer Retention Campaign",
        steps: [
          "Set up email collection at checkout",
          "Send a personalized follow-up email 7 days after purchase",
          "Create a first-purchase discount for returning customers",
          "Consider a loyalty program or referral incentive",
        ],
        expectedOutcome: "Potential 20-30% revenue increase from repeat purchases within 60 days",
        effort: "medium",
        timeline: "1-3 weeks",
      },
    });
  } else if (ctx.repeatRate > 0 && ctx.repeatRate < 0.2 && ctx.totalOrders > 10) {
    findings.push({
      id: "low-repeat",
      severity: "high",
      category: "retention",
      title: "Low Repeat Purchase Rate",
      description: `Only ${(ctx.repeatRate * 100).toFixed(0)}% of customers return. You're losing potential lifetime value.`,
      rootCause: "Low repeat rate typically indicates gaps in post-purchase engagement or limited product breadth.",
      financialImpact: estimateImpactFromRevenue(
        ctx.totalRevenue,
        15,
        65,
        `Current repeat rate of ${(ctx.repeatRate * 100).toFixed(0)}% vs industry average of 25-40%`
      ),
      action: {
        title: "Improve Customer Retention",
        steps: [
          "Implement post-purchase email sequence (3-5 emails over 30 days)",
          "Add personalized product recommendations",
          "Create bundle offers to encourage second purchase",
        ],
        expectedOutcome: "Could increase repeat rate by 10-15 percentage points",
        effort: "medium",
        timeline: "2-4 weeks",
      },
    });
  } else if (ctx.repeatRate >= 0.4) {
    findings.push({
      id: "good-retention",
      severity: "low",
      category: "retention",
      title: "Strong Customer Retention",
      description: `${(ctx.repeatRate * 100).toFixed(0)}% repeat rate is above average. Your customers are coming back.`,
      rootCause: "Strong retention suggests good product-market fit and effective customer engagement.",
      financialImpact: {
        estimatedMonthlyImpact: Math.round(ctx.totalRevenue * 0.15),
        confidence: 55,
        basis: "Loyalty program and referral program potential",
      },
      action: {
        title: "Maximize Lifetime Value",
        steps: [
          "Launch a formal loyalty program with tiers",
          "Introduce referral incentives for existing customers",
          "Create VIP early access for top customers",
        ],
        expectedOutcome: "Potential additional 15% revenue from increased order frequency",
        effort: "significant",
        timeline: "4-6 weeks",
      },
    });
  }

  // --- Product Concentration ---
  if (ctx.topProducts.length > 0 && ctx.totalRevenue > 0) {
    const topShare = (ctx.topProducts[0].revenue / ctx.totalRevenue) * 100;
    if (topShare > 50) {
      findings.push({
        id: "product-concentration",
        severity: "high",
        category: "product",
        title: "Dangerous Product Concentration",
        description: `${ctx.topProducts[0].name} accounts for ${topShare.toFixed(0)}% of all revenue. If this product underperforms, your entire business is at risk.`,
        rootCause: "Single-product dependency often occurs when other products lack visibility, marketing, or product-market fit.",
        financialImpact: {
          estimatedMonthlyImpact: -Math.round(ctx.totalRevenue * 0.3),
          confidence: 60,
          basis: `Revenue at risk if top product (${topShare.toFixed(0)}% share) declines by 30%`,
        },
        action: {
          title: "Diversify Revenue Sources",
          steps: [
            `Promote ${ctx.topProducts.length >= 2 ? ctx.topProducts[1].name : "secondary products"} alongside your best-seller`,
            "Create product bundles that include top and secondary products",
            "Run targeted campaigns for products with high margins but low sales volume",
          ],
          expectedOutcome: `Reduce top product dependency below 40%, adding ${fmtCurrency(ctx.totalRevenue * 0.1)}/month from diversification`,
          effort: "medium",
        timeline: "2-4 weeks",
        },
      });
    } else if (topShare > 35) {
      findings.push({
        id: "product-concentration-mid",
        severity: "medium",
        category: "product",
        title: "Moderate Product Concentration",
        description: `${ctx.topProducts[0].name} makes up ${topShare.toFixed(0)}% of revenue. Some diversification would reduce risk.`,
        rootCause: "The top product has strong demand but other products need more visibility.",
        financialImpact: {
          estimatedMonthlyImpact: -Math.round(ctx.totalRevenue * 0.15),
          confidence: 50,
          basis: `Top product at ${topShare.toFixed(0)}% concentration — moderate risk`,
        },
        action: {
          title: "Promote Secondary Products",
          steps: [
            `Feature ${ctx.topProducts.length >= 2 ? ctx.topProducts[1].name : "other products"} more prominently`,
            "Create cross-sell recommendations on product pages",
          ],
          expectedOutcome: `Grow secondary product revenue by 20-30%`,
          effort: "quick",
        timeline: "1-2 weeks",
        },
      });
    }
  }

  // --- AOV Opportunity ---
  if (ctx.averageOrderValue > 0 && ctx.topProducts.length >= 2) {
    const top2Avg = ctx.topProducts.slice(0, 2).reduce((s, p) => s + (p.revenue / Math.max(1, p.quantity)), 0) / 2;
    if (top2Avg > ctx.averageOrderValue * 1.15) {
      findings.push({
        id: "aov-upsell",
        severity: "medium",
        category: "pricing",
        title: "AOV Upsell Opportunity",
        description: `Your AOV is ${fmtCurrency(ctx.averageOrderValue)}, but your top products average ${fmtCurrency(top2Avg)} each. Cross-selling could raise AOV.`,
        rootCause: "Customers are buying single items when they could benefit from complementary products.",
        financialImpact: estimateImpactFromRevenue(
          ctx.totalRevenue,
          12,
          60,
          "AOV gap between individual product prices and current average order value"
        ),
        action: {
          title: "Increase Average Order Value",
          steps: [
            "Add 'Frequently bought together' suggestions at checkout",
            `Create a bundle of ${ctx.topProducts[0].name} + ${ctx.topProducts[1].name}`,
            "Offer free shipping threshold slightly above current AOV",
          ],
          expectedOutcome: `Increase AOV by 15-25%, adding ~${fmtCurrency(ctx.totalOrders * ctx.averageOrderValue * 0.2)}/month`,
          effort: "quick",
          timeline: "3-5 days",
        },
      });
    }
  }

  // --- Sort findings by severity ---
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // --- Compute aggregates ---
  const totalOpportunity = findings
    .filter((f) => f.financialImpact.estimatedMonthlyImpact > 0)
    .reduce((s, f) => s + f.financialImpact.estimatedMonthlyImpact, 0);
  const totalRisk = Math.abs(
    findings
      .filter((f) => f.financialImpact.estimatedMonthlyImpact < 0)
      .reduce((s, f) => s + f.financialImpact.estimatedMonthlyImpact, 0)
  );

  // --- Determine biggest problem and opportunity ---
  const biggestProblem = findings.find((f) => f.severity === "critical" || f.severity === "high") || null;
  const biggestOpportunity = [...findings]
    .filter((f) => f.financialImpact.estimatedMonthlyImpact > 0)
    .sort((a, b) => b.financialImpact.estimatedMonthlyImpact - a.financialImpact.estimatedMonthlyImpact)[0] || null;

  // --- Overall assessment ---
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  let overallAssessment: string;
  if (criticalCount > 0) {
    overallAssessment = `Your store has ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} that need immediate attention. ${biggestProblem?.title || ""} is the most urgent.`;
  } else if (highCount > 0) {
    overallAssessment = `Your store is performing moderately. ${highCount} area${highCount > 1 ? "s" : ""} need improvement, with "${biggestProblem?.title || biggestOpportunity?.title || "growth"}" as the top priority.`;
  } else if (findings.length === 0) {
    overallAssessment = "Your store is performing well. Keep monitoring for changes.";
  } else {
    overallAssessment = `Your store is in good shape. The main opportunity is "${biggestOpportunity?.title || "growth optimization"}".`;
  }

  // --- Health trend ---
  const healthTrend: StoreDiagnosis["healthTrend"] =
    ctx.healthScore >= 65 ? "improving" : ctx.healthScore >= 40 ? "stable" : "declining";

  // --- Next steps ---
  const immediate: string[] = [];
  const thisWeek: string[] = [];
  const monitoring: string[] = [];

  if (biggestProblem) {
    immediate.push(biggestProblem.action.steps[0]);
    thisWeek.push(...biggestProblem.action.steps.slice(1, 3));
  }
  if (biggestOpportunity && biggestOpportunity.id !== biggestProblem?.id) {
    thisWeek.push(biggestOpportunity.action.steps[0]);
  }
  if (revTrend === "down") {
    monitoring.push("Monitor revenue trend — check weekly if decline continues");
  }
  if (ctx.repeatRate < 0.2 && ctx.totalOrders > 10) {
    monitoring.push("Track repeat purchase rate after implementing retention steps");
  }
  if (monitoring.length === 0) {
    monitoring.push("Schedule weekly store health review");
  }

  return {
    storeId: ctx.storeId,
    storeName: ctx.storeName,
    healthScore: ctx.healthScore,
    healthTrend,
    overallAssessment,
    biggestProblem,
    biggestOpportunity,
    findings,
    totalEstimatedOpportunity: totalOpportunity,
    totalEstimatedRisk: totalRisk,
    kpis: {
      revenue: ctx.totalRevenue,
      orders: ctx.totalOrders,
      aov: ctx.averageOrderValue,
      repeatRate: ctx.repeatRate,
    },
    nextSteps: { immediate, thisWeek, monitoring },
  };
}

// ============================================================
// Health Score Breakdown Engine
// ============================================================

export function analyzeHealthBreakdown(ctx: DashboardAIContext): HealthDimension[] {
  const dimensions: HealthDimension[] = [];
  const revData = ctx.monthlyRevenueTrend.map((d) => d.revenue);
  const ordData = ctx.monthlyOrdersTrend.map((d) => d.orders);
  const revTrend = trendDirection(revData);
  const ordTrend = trendDirection(ordData);

  const revenueGrowthScore = (): Omit<HealthDimension, "name" | "key"> => {
    if (revData.length < 2) return { score: 50, evidence: ["Insufficient data"], confidence: 50, trend: "flat", maxPotential: 0 };
    const growth = revData.length >= 2 ? ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100 : 0;
    const score = Math.max(0, Math.min(100, 50 + growth));
    const evidence: string[] = [];
    evidence.push(`${revData.length} months of revenue data analyzed`);
    if (growth > 0) evidence.push(`Revenue grew ${growth.toFixed(1)}% vs previous month`);
    else if (growth < 0) evidence.push(`Revenue declined ${Math.abs(growth).toFixed(1)}% vs previous month`);
    return {
      score: Math.round(score),
      evidence,
      confidence: Math.round(Math.min(85, 50 + revData.length * 5)),
      trend: revTrend,
      maxPotential: Math.round(ctx.totalRevenue * 0.3),
    };
  };

  const retentionScore = (): Omit<HealthDimension, "name" | "key"> => {
    const score = Math.round(ctx.repeatRate * 200);
    const cappedScore = Math.max(0, Math.min(100, score));
    const evidence: string[] = [];
    evidence.push(`${ctx.totalOrders} orders analyzed`);
    const uniqueCustomers = ctx.totalOrders > 0 ? Math.round(ctx.totalOrders / (1 + ctx.repeatRate)) : 0;
    evidence.push(`${uniqueCustomers} unique customers`);
    evidence.push(`Repeat purchase rate ${(ctx.repeatRate * 100).toFixed(1)}%`);
    const trend: "up" | "down" | "flat" = ctx.repeatRate >= 0.3 ? "up" : ctx.repeatRate >= 0.1 ? "flat" : "down";
    return {
      score: cappedScore,
      evidence,
      confidence: Math.round(Math.min(92, 60 + ctx.totalOrders / 10)),
      trend,
      maxPotential: Math.round(ctx.totalRevenue * 0.25),
    };
  };

  const productPerformanceScore = (): Omit<HealthDimension, "name" | "key"> => {
    if (ctx.topProducts.length === 0) return { score: 50, evidence: ["No product data"], confidence: 50, trend: "flat", maxPotential: 0 };
    const topShare = (ctx.topProducts[0].revenue / ctx.totalRevenue) * 100;
    const score = topShare > 60 ? Math.round(40 + (100 - topShare) * 1.5) : Math.round(60 + topShare * 0.4);
    const cappedScore = Math.max(0, Math.min(100, score));
    const evidence: string[] = [];
    evidence.push(`${ctx.topProducts.length} products analyzed`);
    evidence.push(`${ctx.topProducts[0].name} leads with ${topShare.toFixed(0)}% of revenue`);
    const trend: "up" | "down" | "flat" = topShare <= 40 ? "up" : topShare <= 55 ? "flat" : "down";
    return {
      score: Math.round(cappedScore),
      evidence,
      confidence: Math.round(Math.min(80, 50 + ctx.topProducts.length * 5)),
      trend,
      maxPotential: Math.round(ctx.totalRevenue * 0.2),
    };
  };

  const conversionScore = (): Omit<HealthDimension, "name" | "key"> => {
    const avgOrders = ctx.totalOrders > 0 && revData.length > 0 ? ctx.totalOrders / revData.length : 0;
    const avgRevenue = ctx.totalRevenue > 0 && revData.length > 0 ? ctx.totalRevenue / revData.length : 0;
    const conversionRatio = avgRevenue > 0 ? avgOrders / (avgRevenue / ctx.averageOrderValue) : 0;
    const score = Math.round(Math.min(100, conversionRatio * 1000));
    const evidence: string[] = [];
    evidence.push(`Average ${avgOrders.toFixed(0)} orders per period`);
    evidence.push(`AOV ${fmtCurrency(ctx.averageOrderValue)}`);
    const trend: "up" | "down" | "flat" = ordTrend;
    return {
      score: Math.round(Math.max(20, Math.min(100, score))),
      evidence,
      confidence: Math.round(Math.min(75, 45 + ctx.totalOrders / 20)),
      trend,
      maxPotential: Math.round(ctx.totalRevenue * 0.15),
    };
  };

  const marketingEfficiencyScore = (): Omit<HealthDimension, "name" | "key"> => {
    const avgRevenue = ctx.totalRevenue > 0 && revData.length > 0 ? ctx.totalRevenue / revData.length : 0;
    const growth = revData.length >= 2 ? ((revData[revData.length - 1] - revData[revData.length - 2]) / Math.max(1, revData[revData.length - 2])) * 100 : 0;
    const efficiency = growth > 0 ? Math.min(100, growth * 2 + 50) : Math.max(20, 50 + growth);
    const evidence: string[] = [];
    evidence.push(`Revenue trend: ${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`);
    evidence.push(`Average ${fmtCurrency(avgRevenue)} per month`);
    return {
      score: Math.round(efficiency),
      evidence,
      confidence: Math.round(Math.min(70, 40 + revData.length * 5)),
      trend: revTrend,
      maxPotential: Math.round(ctx.totalRevenue * 0.1),
    };
  };

  dimensions.push({ name: "Revenue Growth", key: "revenue_growth", ...revenueGrowthScore() });
  dimensions.push({ name: "Customer Retention", key: "customer_retention", ...retentionScore() });
  dimensions.push({ name: "Product Performance", key: "product_performance", ...productPerformanceScore() });
  dimensions.push({ name: "Conversion", key: "conversion", ...conversionScore() });
  dimensions.push({ name: "Marketing Efficiency", key: "marketing_efficiency", ...marketingEfficiencyScore() });

  return dimensions;
}

// ============================================================
// Customer Intelligence Engine
// ============================================================

export function analyzeCustomerSegments(ctx: DashboardAIContext): { segments: CustomerSegment[]; insight: string } {
  const totalOrders = ctx.totalOrders;
  const totalRevenue = ctx.totalRevenue;
  const repeatRate = ctx.repeatRate;

  const newCustomers = Math.round(totalOrders * (1 - repeatRate));
  const returningCustomers = Math.round(totalOrders * repeatRate);
  const vipThreshold = ctx.averageOrderValue * 3;
  const vipCustomers = totalOrders > 0 ? Math.round(totalOrders * 0.06) : 0;
  const atRiskCustomers = repeatRate < 0.2 ? Math.round(newCustomers * 0.3) : Math.round(newCustomers * 0.15);
  const lostCustomers = repeatRate < 0.1 ? Math.round(newCustomers * 0.45) : Math.round(newCustomers * 0.2);

  const segments: CustomerSegment[] = [
    {
      name: "New Customers",
      key: "new",
      count: newCustomers,
      value: Math.round(totalRevenue * (1 - repeatRate)),
      percentage: totalOrders > 0 ? Math.round(((1 - repeatRate) * 100)) : 0,
      insight: `All ${newCustomers} customers are new. Focus on converting them to repeat buyers.`,
    },
    {
      name: "Returning Customers",
      key: "returning",
      count: returningCustomers,
      value: Math.round(totalRevenue * repeatRate),
      percentage: totalOrders > 0 ? Math.round(repeatRate * 100) : 0,
      insight: returningCustomers > 0
        ? `${returningCustomers} customers came back, representing ${(repeatRate * 100).toFixed(1)}% repeat rate.`
        : "No customers have returned yet. Implement retention strategies.",
    },
    {
      name: "VIP Customers",
      key: "vip",
      count: vipCustomers,
      value: Math.round(totalRevenue * 0.25),
      percentage: totalOrders > 0 ? 6 : 0,
      insight: `Top ${vipCustomers} high-value customers drive ~25% of revenue. Reward their loyalty.`,
    },
    {
      name: "At Risk Customers",
      key: "at_risk",
      count: atRiskCustomers,
      value: Math.round(totalRevenue * 0.15),
      percentage: totalOrders > 0 ? Math.round((atRiskCustomers / totalOrders) * 100) : 0,
      insight: `${atRiskCustomers} customers haven't purchased recently. Launch retention campaigns.`,
    },
    {
      name: "Lost Customers",
      key: "lost",
      count: lostCustomers,
      value: Math.round(totalRevenue * 0.2),
      percentage: totalOrders > 0 ? Math.round((lostCustomers / totalOrders) * 100) : 0,
      insight: `${lostCustomers} customers may have churned. Win-back campaigns could recover revenue.`,
    },
  ];

  const atRiskRevenue = Math.round(totalRevenue * 0.2);
  const insight = repeatRate < 0.15
    ? `${atRiskCustomers} customers are likely to churn. Launching retention campaigns may recover ${fmtCurrency(atRiskRevenue)}.`
    : returningCustomers > 10
      ? `Strong retention with ${returningCustomers} repeat customers. Focus on growing VIP segment.`
      : "Your customer base is growing but needs retention focus.";

  return { segments, insight };
}

// ============================================================
// Product Doctor Engine
// ============================================================

export function analyzeProductHealth(ctx: DashboardAIContext): ProductHealth[] {
  if (ctx.topProducts.length === 0) return [];

  const avgRevenue = ctx.topProducts.reduce((s, p) => s + p.revenue, 0) / ctx.topProducts.length;
  const avgQuantity = ctx.topProducts.reduce((s, p) => s + p.quantity, 0) / ctx.topProducts.length;

  return ctx.topProducts.map((product) => {
    const revShare = (product.revenue / ctx.totalRevenue) * 100;
    const qtyShare = (product.quantity / ctx.totalOrders) * 100;
    const isTop = product.revenue === ctx.topProducts[0].revenue;
    const isBottom = product.revenue === [...ctx.topProducts].sort((a, b) => a.revenue - b.revenue)[0].revenue;

    let healthScore: number;
    let trend: "growing" | "stable" | "declining";
    let diagnosis: string;
    let recommendations: string[];
    let category: "winner" | "opportunity" | "at_risk" | "declining";

    if (isTop && revShare > 30) {
      healthScore = Math.round(85 + Math.min(15, (revShare - 30) * 0.5));
      trend = "growing";
      diagnosis = "Winner product driving significant revenue.";
      recommendations = ["Increase advertising budget", "Create bundle offers", "Expand product variants"];
      category = "winner";
    } else if (product.revenue < avgRevenue * 0.3) {
      healthScore = Math.round(25 + (product.revenue / avgRevenue) * 50);
      trend = "declining";
      diagnosis = "Low revenue performance. Product page optimization needed.";
      recommendations = ["Improve product images", "Adjust pricing strategy", "Create bundle with top products"];
      category = "at_risk";
    } else if (revShare > 20) {
      healthScore = Math.round(70 + (revShare - 20) * 0.8);
      trend = "stable";
      diagnosis = "Solid performer with growth potential.";
      recommendations = ["Increase visibility", "Run targeted promotions", "Add upsell options"];
      category = "opportunity";
    } else {
      healthScore = Math.round(50 + (revShare * 0.5));
      trend = "stable";
      diagnosis = "Moderate performance. Needs optimization.";
      recommendations = ["Improve product description", "Test different pricing", "Add customer reviews"];
      category = "opportunity";
    }

    return {
      name: product.name,
      revenue: product.revenue,
      quantity: product.quantity,
      avgPrice: Math.round(product.revenue / Math.max(1, product.quantity)),
      healthScore: Math.round(healthScore),
      trend,
      diagnosis,
      recommendations,
      category,
    };
  });
}

// ============================================================
// Revenue Forecast Engine
// ============================================================

export function generateRevenueForecast(ctx: DashboardAIContext): RevenueForecast {
  const revData = ctx.monthlyRevenueTrend.map((d) => d.revenue);

  const buildDailyBreakdown = (expected: number, best: number, worst: number) => {
    const dailyExpected = expected / 30;
    const dailyBest = best / 30;
    const dailyWorst = worst / 30;
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      expected: Math.round(dailyExpected * (0.9 + Math.random() * 0.2)),
      bestCase: Math.round(dailyBest * (0.9 + Math.random() * 0.2)),
      worstCase: Math.round(dailyWorst * (0.9 + Math.random() * 0.2)),
    }));
  };

  if (revData.length < 2) {
    const expected = ctx.totalRevenue > 0 ? ctx.totalRevenue : 0;
    const best = ctx.totalRevenue > 0 ? Math.round(ctx.totalRevenue * 1.2) : 0;
    const worst = ctx.totalRevenue > 0 ? Math.round(ctx.totalRevenue * 0.8) : 0;
    return {
      period: "Next 30 days",
      expectedRevenue: expected,
      bestCase: best,
      worstCase: worst,
      dailyBreakdown: buildDailyBreakdown(expected, best, worst),
      riskFactors: ["Insufficient historical data for accurate forecasting"],
      growthOpportunities: ["Upload more historical data for better predictions"],
      confidence: 30,
      basis: "Limited data available",
      assumptions: ["Constant daily revenue distribution", "No seasonality adjustments"],
    };
  }

  const last3 = revData.slice(-3);
  const avgGrowth = last3.length > 1
    ? last3.slice(1).map((v, i) => ((v - last3[i]) / Math.max(1, last3[i])) * 100).reduce((a, b) => a + b, 0) / (last3.length - 1)
    : 0;

  const recentRevenue = revData[revData.length - 1];
  const expectedRevenue = Math.round(recentRevenue * (1 + avgGrowth / 100));
  const bestCase = Math.round(expectedRevenue * 1.2);
  const worstCase = Math.round(expectedRevenue * 0.75);

  const riskFactors: string[] = [];
  const growthOpportunities: string[] = [];

  if (avgGrowth < -5) {
    riskFactors.push("Revenue is declining month-over-month");
    riskFactors.push("Market conditions may be unfavorable");
  } else if (avgGrowth < 0) {
    riskFactors.push("Revenue growth has stalled");
  }

  if (ctx.repeatRate < 0.2) {
    riskFactors.push("Low repeat purchase rate indicates churn risk");
  }

  if (avgGrowth > 5) {
    growthOpportunities.push(`Revenue growing at ${avgGrowth.toFixed(1)}% — maintain momentum`);
  }

  if (ctx.topProducts.length >= 2) {
    growthOpportunities.push("Multiple product lines present cross-sell opportunities");
  }

  if (ctx.repeatRate > 0.3) {
    growthOpportunities.push("Strong customer retention supports sustainable growth");
  }

  if (growthOpportunities.length === 0) {
    growthOpportunities.push("Optimize product mix and pricing for growth");
  }

  return {
    period: "Next 30 days",
    expectedRevenue,
    bestCase,
    worstCase,
    dailyBreakdown: buildDailyBreakdown(expectedRevenue, bestCase, worstCase),
    riskFactors,
    growthOpportunities,
    confidence: Math.min(85, 40 + revData.length * 8),
    basis: `${revData.length} months of historical revenue data`,
    assumptions: [
      `Average monthly growth rate: ${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
      "Linear daily distribution of monthly revenue",
      "No major promotional events planned",
    ],
  };
}

// ============================================================
// AI Actionable Campaigns Engine
// ============================================================

export function generateActionableCampaigns(ctx: DashboardAIContext): AIActionableCampaign[] {
  const campaigns: AIActionableCampaign[] = [];

  if (ctx.repeatRate === 0 && ctx.totalOrders > 5) {
    const avgOrderValue = ctx.averageOrderValue;
    const potentialRevenue = Math.round(ctx.totalOrders * avgOrderValue * 0.2);
    campaigns.push({
      id: "winback-zero-repeat",
      problem: "Zero Repeat Customers",
      campaignTitle: "Customer Win-back Email",
      target: "Customers who purchased 30-60 days ago",
      emailTitle: "We miss you - here's 20% OFF",
      expectedCustomers: Math.round(ctx.totalOrders * 0.15),
      revenueOpportunity: potentialRevenue,
      confidence: 72,
      steps: [
        "Send personalized follow-up email with discount",
        "Offer free shipping on next purchase",
        "Highlight new products or improvements",
      ],
      effort: "medium",
    });
  } else if (ctx.repeatRate < 0.2 && ctx.totalOrders > 10) {
    const potentialRevenue = Math.round(ctx.totalRevenue * 0.15);
    campaigns.push({
      id: "retention-low-repeat",
      problem: "Low Repeat Purchase Rate",
      campaignTitle: "Loyalty Reward Program",
      target: "All existing customers",
      emailTitle: "Earn rewards for every purchase",
      expectedCustomers: Math.round(ctx.totalOrders * 0.2),
      revenueOpportunity: potentialRevenue,
      confidence: 65,
      steps: [
        "Implement tiered loyalty program",
        "Offer points for purchases and referrals",
        "Create exclusive rewards for top customers",
      ],
      effort: "significant",
    });
  }

  if (ctx.topProducts.length >= 2) {
    const topShare = (ctx.topProducts[0].revenue / ctx.totalRevenue) * 100;
    if (topShare > 40) {
      const secondaryProduct = ctx.topProducts[1];
      const potentialRevenue = Math.round(ctx.totalRevenue * 0.1);
      campaigns.push({
        id: "bundle-diversification",
        problem: "Dangerous Product Concentration",
        campaignTitle: "Product Bundle Promotion",
        target: "Customers who bought top product",
        emailTitle: `Get ${secondaryProduct.name} at 15% OFF when you bundle`,
        expectedCustomers: Math.round(ctx.totalOrders * 0.25),
        revenueOpportunity: potentialRevenue,
        confidence: 60,
        steps: [
          `Create bundle of ${ctx.topProducts[0].name} + ${secondaryProduct.name}`,
          "Offer bundle discount of 10-15%",
          "Promote on product pages and via email",
        ],
        effort: "quick",
      });
    }
  }

  if (ctx.averageOrderValue > 0 && ctx.topProducts.length >= 2) {
    const top2Avg = ctx.topProducts.slice(0, 2).reduce((s, p) => s + (p.revenue / Math.max(1, p.quantity)), 0) / 2;
    if (top2Avg > ctx.averageOrderValue * 1.15) {
      const potentialRevenue = Math.round(ctx.totalOrders * ctx.averageOrderValue * 0.15);
      campaigns.push({
        id: "aov-boost",
        problem: "Low Average Order Value",
        campaignTitle: "Upsell Campaign",
        target: "Customers in checkout",
        emailTitle: "Add these to save 10%",
        expectedCustomers: Math.round(ctx.totalOrders * 0.3),
        revenueOpportunity: potentialRevenue,
        confidence: 58,
        steps: [
          "Add 'frequently bought together' suggestions",
          "Create threshold-based free shipping",
          "Offer small accessory add-ons",
        ],
        effort: "quick",
      });
    }
  }

  return campaigns;
}

// ============================================================
// AI Recommended Action Engine
// ============================================================

export function generateRecommendedAction(ctx: DashboardAIContext): AIRecommendAction | null {
  const diagnosis = generateDiagnosis(ctx);

  if (diagnosis.biggestProblem) {
    const impact = diagnosis.biggestProblem.financialImpact;
    return {
      title: diagnosis.biggestProblem.action.title,
      description: diagnosis.biggestProblem.action.steps[0],
      expectedImpact: impact.estimatedMonthlyImpact > 0
        ? `+${fmtCurrency(impact.estimatedMonthlyImpact)}/month potential`
        : `${fmtCurrency(Math.abs(impact.estimatedMonthlyImpact))}/month at risk`,
      buttonLabel: "Create Campaign",
      buttonHref: "/ai-analysis",
    };
  }

  if (diagnosis.biggestOpportunity) {
    const impact = diagnosis.biggestOpportunity.financialImpact;
    return {
      title: diagnosis.biggestOpportunity.action.title,
      description: diagnosis.biggestOpportunity.action.steps[0],
      expectedImpact: `+${fmtCurrency(impact.estimatedMonthlyImpact)}/month potential`,
      buttonLabel: "Create Campaign",
      buttonHref: "/ai-analysis",
    };
  }

  if (ctx.totalOrders === 0) {
    return {
      title: "Upload Your First CSV",
      description: "Start by uploading your store data to get AI-powered insights",
      expectedImpact: "Unlock full AI diagnosis capabilities",
      buttonLabel: "Upload Data",
      buttonHref: ctx.storeId ? `/stores/${ctx.storeId}/upload` : "/stores",
    };
  }

  return {
    title: "Run Full AI Analysis",
    description: "Generate a comprehensive business diagnosis with actionable recommendations",
    expectedImpact: "Discover growth opportunities and potential revenue",
    buttonLabel: "Run Analysis",
    buttonHref: "/ai-analysis",
  };
}

// ============================================================
// AI Chat Response Engine
// ============================================================

export async function generateAIChatResponse(query: string, context: DashboardAIContext | null): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    return "AI assistant is not configured. Please contact support.";
  }

  if (!context) {
    return "I need more data to help you. Please upload your store data first.";
  }

  const contextSummary = `Store: ${context.storeName || 'Unknown'}
Health Score: ${context.healthScore}/100
Total Revenue: $${context.totalRevenue.toLocaleString()}
Total Orders: ${context.totalOrders}
Average Order Value: $${context.averageOrderValue.toFixed(2)}
Repeat Purchase Rate: ${(context.repeatRate * 100).toFixed(1)}%
Top Products: ${context.topProducts.slice(0, 3).map(p => p.name).join(', ') || 'None'}
Monthly Revenue Trend: ${context.monthlyRevenueTrend.slice(-3).map(d => `${d.month}: $${d.revenue}`).join('; ') || 'N/A'}`;

  const prompt = `You are a Shopify ecommerce growth expert. Answer the merchant's question based on their store data below.

Store Data:
${contextSummary}

Question: ${query}

Instructions:
1. Always base your answer on the provided data
2. Provide specific, actionable recommendations
3. Include revenue impact estimates where possible
4. Keep your response concise and focused
5. Use a friendly, professional tone

Answer:`;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    return "I couldn't generate a response. Please try again.";
  } catch {
    return "Error connecting to AI service. Please try again later.";
  }
}
