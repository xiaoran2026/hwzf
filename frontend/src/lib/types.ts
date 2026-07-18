export interface User {
  id: number;
  email: string;
  name?: string;
  plan?: string;
  role?: string;
  createdTime?: string;
}

export interface Store {
  id: number;
  storeName: string;
  platform: string;
  createdAt: string;
}

export interface UploadedFile {
  id: number;
  fileName: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
}

export interface AnalysisReport {
  id: number;
  storeId: number;
  healthScore: number;
  salesAnalysis: any;
  productInsights: any;
  customerInsights: any;
  businessProblems: any;
  recommendations: any;
  createdAt: string;
}

export interface ReportData {
  healthScore: number;
  summary: string;
  salesInsights: string[];
  productInsights: string[];
  customerInsights: string[];
  problems: string[];
  recommendations: string[];
  salesAnalysis?: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    monthlyRevenueTrend?: Record<string, number>;
    monthlyOrdersTrend?: Record<string, number>;
  };
  topProducts?: {
    productName: string;
    revenue: number;
    quantity: number;
    orderCount: number;
  }[];
  customerAnalysis?: {
    totalCustomers: number;
    newCustomerCount: number;
    repeatCustomerCount: number;
    repeatRate: number;
  };
  countryStats?: {
    country: string;
    orderCount: number;
    revenue: number;
  }[];
}

export interface ReportListItem {
  reportId: number;
  taskId?: number;
  storeId?: number;
  storeName?: string;
  fileName?: string;
  healthScore: number;
  summary: string;
  totalRevenue?: number;
  totalOrders?: number;
  averageOrderValue?: number;
  repeatRate?: number;
  taskStatus?: string;
  createdAt: string;
  archived?: boolean;
  favorite?: boolean;
}

export interface TaskStatus {
  taskId: number;
  fileId: number;
  fileName: string;
  status: string;
  progress: number;
  reportId: number | null;
  errorMessage: string | null;
  createdTime: string;
}

export interface UploadResponse {
  fileId: number;
  fileName: string;
  status: string;
  storeId: number;
  taskId: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  paymentProvider?: string;
  paymentId?: string;
  startTime?: string;
  expireTime?: string;
  renewTime?: string;
  cancelledAt?: string;
  createdTime?: string;
}

export interface PaymentRecord {
  id: number;
  plan: string;
  amount: number;
  currency: string;
  paymentProvider?: string;
  providerTransactionId?: string;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  createdTime?: string;
}

export interface BillingData {
  subscription: Subscription | null;
  paymentHistory: PaymentRecord[];
  currentPlan: string;
  canUpgrade: boolean;
  canCancel: boolean;
}

export interface UsageSummary {
  plan: string;
  planDisplay: string;
  monthlyPrice: number;
  maxStores: number | null;
  maxUploadsPerMonth: number | null;
  maxCsvRows: number;
  unlimitedStores: boolean;
  unlimitedUploads: boolean;
  storeCount: number;
  storeLimit: number | null;
  storeUsagePct: number;
  canCreateStore: boolean;
  remainingStoreSlots: number;
  uploadCount: number;
  uploadLimit: number | null;
  uploadUsagePct: number;
  canUpload: boolean;
  remainingUploads: number;
  // Report usage (added for centralized plan config)
  reportCount: number;
  reportLimit: number | null;
  canCreateReport: boolean;
  remainingReports: number;
}

// ==================== Admin Types ====================

export interface AdminDashboardStats {
  totalUsers: number;
  totalStores: number;
  totalReports: number;
  totalRevenue: number;
  todayUploads: number;
  todayPayments: number;
  todayNewUsers: number;
  totalTasks: number;
  totalSubscriptions: number;
  totalWebhookLogs: number;
}

export interface AdminUser {
  id: number;
  email: string;
  plan: string;
  role: string;
  banned: boolean;
  storeCount: number;
  reportCount: number;
  createdTime: string;
}

export interface AdminStore {
  id: number;
  userId: number;
  userEmail: string;
  storeName: string;
  platform: string;
  uploadCount: number;
  taskCount: number;
  createdTime: string;
}

export interface AdminReport {
  id: number;
  userId: number;
  userEmail: string;
  storeId: number;
  storeName: string;
  taskId: number;
  healthScore: number;
  createdAt: string;
}

export interface AdminPayment {
  id: number;
  userId: number;
  userEmail: string;
  plan: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  providerTransactionId: string;
  status: string;
  paymentMethod: string;
  paidAt: string;
  createdTime: string;
}

export interface AdminLog {
  id: number;
  userId: number;
  userEmail: string;
  type: string;
  operation: string;
  details: string;
  ipAddress: string;
  createdTime: string;
}

export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ==================== System Settings Types ====================

export interface AdminSystemSettings {
  sentryEnabled: boolean;
  sentryDsn: string;
  sentryEnvironment: string;
  sentryRelease: string;
  sentryStatus: string;
  posthogEnabled: boolean;
  posthogProjectName: string;
  posthogApiHost: string;
  posthogProjectId: string;
  posthogStatus: string;
  errorCount24h: number;
  warningCount24h: number;
  crashFreeRate: number;
  lastErrorTime: string;
  posthogEvents: Record<string, number>;
}

export interface AdminServiceHealth {
  name: string;
  status: "HEALTHY" | "WARNING" | "OFFLINE";
  message: string;
  responseTimeMs: number;
}

export interface AdminHealthCheck {
  services: AdminServiceHealth[];
  checkedAt: string;
}

export interface AdminDeploymentInfo {
  frontendVersion: string;
  backendVersion: string;
  javaVersion: string;
  springBootVersion: string;
  databaseVersion: string;
  serverTime: string;
  timezone: string;
  environment: string;
  dockerVersion: string;
  containerId: string;
  buildTime: string;
  gitCommit: string;
}

export interface AdminLogEntry {
  id: number;
  level: string;
  message: string;
  source: string;
  timestamp: string;
}

export interface AdminRecentLogs {
  logs: AdminLogEntry[];
  total: number;
}
