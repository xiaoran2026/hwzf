// Single source of truth for plan configuration
// Must stay in sync with backend PlanEnum.java

export type PlanId = "FREE" | "STARTER" | "PRO" | "GROWTH" | "AGENCY";

export type AnalysisType =
  | "store_health"
  | "revenue_analysis"
  | "product_analysis"
  | "customer_retention"
  | "ai_forecast"
  | "growth_opportunities"
  | "deep_analysis";

export interface AnalysisTypeInfo {
  id: AnalysisType;
  labelKey: string;           // i18n key
  descriptionKey: string;     // i18n key for description
  outputKey: string;          // i18n key for expected output
  icon: string;               // SVG path data
  requiredPlan: PlanId;       // minimum plan required
  featureFlag: string;        // backend feature flag name
  href: string;               // navigation target
  implemented: boolean;       // whether this analysis type is actually built
}

export interface PlanFeatureConfig {
  id: PlanId;
  name: string;
  nameKey: string;             // i18n key for plan name
  price: number;
  period: string;
  description: string;
  descriptionKey: string;      // i18n key
  maxStores: number | null;    // null = unlimited
  maxUploadsPerMonth: number | null;
  maxReportsPerMonth: number | null;
  maxCsvRows: number;
  features: string[];          // i18n keys for feature list
  limits: string[];            // i18n keys for limitations
  popular?: boolean;
  badge?: string;
  comingSoonFeatures?: string[];  // features not yet implemented
}

// Feature flag to analysis type mapping
export const ANALYSIS_TYPE_CONFIG: AnalysisTypeInfo[] = [
  {
    id: "store_health",
    labelKey: "aiAnalysis.types.storeHealth.label",
    descriptionKey: "aiAnalysis.types.storeHealth.description",
    outputKey: "aiAnalysis.types.storeHealth.output",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    requiredPlan: "FREE",
    featureFlag: "STORE_HEALTH",
    href: "/stores",
    implemented: true,
  },
  {
    id: "revenue_analysis",
    labelKey: "aiAnalysis.types.revenueAnalysis.label",
    descriptionKey: "aiAnalysis.types.revenueAnalysis.description",
    outputKey: "aiAnalysis.types.revenueAnalysis.output",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    requiredPlan: "STARTER",
    featureFlag: "HISTORICAL_TRENDS",
    href: "/reports",
    implemented: true,
  },
  {
    id: "product_analysis",
    labelKey: "aiAnalysis.types.productAnalysis.label",
    descriptionKey: "aiAnalysis.types.productAnalysis.description",
    outputKey: "aiAnalysis.types.productAnalysis.output",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    requiredPlan: "STARTER",
    featureFlag: "AI_INSIGHTS",
    href: "/reports",
    implemented: true,
  },
  {
    id: "customer_retention",
    labelKey: "aiAnalysis.types.customerRetention.label",
    descriptionKey: "aiAnalysis.types.customerRetention.description",
    outputKey: "aiAnalysis.types.customerRetention.output",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    requiredPlan: "GROWTH",
    featureFlag: "CUSTOMER_RETENTION",
    href: "/reports",
    implemented: false,
  },
  {
    id: "ai_forecast",
    labelKey: "aiAnalysis.types.aiForecast.label",
    descriptionKey: "aiAnalysis.types.aiForecast.description",
    outputKey: "aiAnalysis.types.aiForecast.output",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    requiredPlan: "STARTER",
    featureFlag: "AI_FORECAST",
    href: "/reports",
    implemented: true,
  },
  {
    id: "growth_opportunities",
    labelKey: "aiAnalysis.types.growthOpportunities.label",
    descriptionKey: "aiAnalysis.types.growthOpportunities.description",
    outputKey: "aiAnalysis.types.growthOpportunities.output",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    requiredPlan: "STARTER",
    featureFlag: "GROWTH_OPPORTUNITIES",
    href: "/reports",
    implemented: true,
  },
  {
    id: "deep_analysis",
    labelKey: "aiAnalysis.types.deepAnalysis.label",
    descriptionKey: "aiAnalysis.types.deepAnalysis.description",
    outputKey: "aiAnalysis.types.deepAnalysis.output",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    requiredPlan: "GROWTH",
    featureFlag: "DEEP_AI_ANALYSIS",
    href: "/reports",
    implemented: false,
  },
];

// Plan hierarchy for comparison: higher number = better plan
export const PLAN_HIERARCHY: Record<PlanId, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  GROWTH: 2,
  AGENCY: 3,
};

// Check if a plan meets the minimum requirement
export function planMeetsRequirement(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];
}

// Get analysis types available for a given plan
export function getAvailableAnalysisTypes(currentPlan: PlanId): AnalysisTypeInfo[] {
  return ANALYSIS_TYPE_CONFIG.filter(
    (type) => type.implemented && planMeetsRequirement(currentPlan, type.requiredPlan)
  );
}

// Get locked analysis types for a given plan
export function getLockedAnalysisTypes(currentPlan: PlanId): AnalysisTypeInfo[] {
  return ANALYSIS_TYPE_CONFIG.filter(
    (type) => !planMeetsRequirement(currentPlan, type.requiredPlan)
  );
}

// Check if a specific analysis type is available
export function isAnalysisAvailable(currentPlan: PlanId, analysisType: AnalysisType): boolean {
  const config = ANALYSIS_TYPE_CONFIG.find((t) => t.id === analysisType);
  if (!config) return false;
  return config.implemented && planMeetsRequirement(currentPlan, config.requiredPlan);
}

// Plan display configurations (use i18n keys so text can be translated)
export const PLANS: PlanFeatureConfig[] = [
  {
    id: "FREE",
    name: "Free",
    nameKey: "billing.plans.free.name",
    price: 0,
    period: "",
    description: "For trying out the product",
    descriptionKey: "billing.plans.free.description",
    maxStores: 1,
    maxUploadsPerMonth: 1,
    maxReportsPerMonth: 1,
    maxCsvRows: 500,
    features: [
      "billing.plans.free.features.store",
      "billing.plans.free.features.upload",
      "billing.plans.free.features.report",
      "billing.plans.free.features.healthScore",
      "billing.plans.free.features.basicInsights",
      "billing.plans.free.features.problems",
    ],
    limits: [
      "billing.plans.free.limits.noForecast",
      "billing.plans.free.limits.noPdfExport",
      "billing.plans.free.limits.noAdvancedAnalysis",
    ],
  },
  {
    id: "STARTER",
    name: "Paid",
    nameKey: "billing.plans.paid.name",
    price: 29,
    period: "/month",
    description: "Unlock the full growth plan",
    descriptionKey: "billing.plans.paid.description",
    maxStores: 3,
    maxUploadsPerMonth: null,
    maxReportsPerMonth: null,
    maxCsvRows: 50000,
    features: [
      "billing.plans.paid.features.unlimitedReports",
      "billing.plans.paid.features.fullRecommendations",
      "billing.plans.paid.features.growthOpportunities",
      "billing.plans.paid.features.forecast",
      "billing.plans.paid.features.pdfExport",
    ],
    limits: [],
  },
  {
    id: "PRO",
    name: "Full Report",
    nameKey: "billing.plans.paid.name",
    price: 19,
    period: "",
    description: "Unlock the full revenue leak report",
    descriptionKey: "billing.plans.paid.description",
    maxStores: -1,
    maxUploadsPerMonth: null,
    maxReportsPerMonth: null,
    maxCsvRows: 50000,
    features: [
      "billing.plans.paid.features.unlimitedReports",
      "billing.plans.paid.features.fullRecommendations",
      "billing.plans.paid.features.growthOpportunities",
      "billing.plans.paid.features.forecast",
      "billing.plans.paid.features.pdfExport",
    ],
    limits: [],
  },
  {
    id: "GROWTH",
    name: "Growth",
    nameKey: "billing.plans.growth.name",
    price: 79,
    period: "/month",
    description: "For scaling businesses ready for AI-powered growth",
    descriptionKey: "billing.plans.growth.description",
    maxStores: 10,
    maxUploadsPerMonth: null,
    maxReportsPerMonth: null,
    maxCsvRows: 50000,
    features: [
      "billing.plans.growth.features.stores",
      "billing.plans.growth.features.reports",
      "billing.plans.growth.features.uploads",
      "billing.plans.growth.features.productAnalysis",
      "billing.plans.growth.features.customerAnalysis",
      "billing.plans.growth.features.aiCampaigns",
      "billing.plans.growth.features.forecast",
      "billing.plans.growth.features.aiAssistant",
      "billing.plans.growth.features.advancedAnalysis",
      "billing.plans.growth.features.retention",
      "billing.plans.growth.features.pdfExport",
    ],
    popular: true,
    badge: "Most Popular",
    limits: [],
  },
  {
    id: "AGENCY",
    name: "Agency",
    nameKey: "billing.plans.agency.name",
    price: 199,
    period: "/month",
    description: "For agencies managing multiple client stores",
    descriptionKey: "billing.plans.agency.description",
    maxStores: null,
    maxUploadsPerMonth: null,
    maxReportsPerMonth: null,
    maxCsvRows: 50000,
    features: [
      "billing.plans.agency.features.stores",
      "billing.plans.agency.features.reports",
      "billing.plans.agency.features.uploads",
      "billing.plans.agency.features.advancedAnalysis",
      "billing.plans.agency.features.retention",
      "billing.plans.agency.features.cohort",
      "billing.plans.agency.features.crossStore",
      "billing.plans.agency.features.advancedForecast",
      "billing.plans.agency.features.anomaly",
      "billing.plans.agency.features.scheduledReports",
      "billing.plans.agency.features.emailAlerts",
      "billing.plans.agency.features.apiAccess",
      "billing.plans.agency.features.teamCollaboration",
      "billing.plans.agency.features.clientReporting",
    ],
    badge: "For Teams",
    comingSoonFeatures: [
      "billing.plans.agency.comingSoon.scheduledReports",
      "billing.plans.agency.comingSoon.emailAlerts",
      "billing.plans.agency.comingSoon.apiAccess",
      "billing.plans.agency.comingSoon.teamCollaboration",
    ],
    limits: [],
  },
];
