import axios from "axios";
import type { ApiResponse, User, ReportData, ReportListItem, TaskStatus, UploadResponse, BillingData, Subscription, PaymentRecord, UsageSummary, AdminDashboardStats, AdminPageResponse, AdminUser, AdminStore, AdminReport, AdminPayment, AdminLog, AdminSystemSettings, AdminHealthCheck, AdminDeploymentInfo, AdminRecentLogs } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - clear auth and notify
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason: "unauthorized" } }));
        }
      }

      // Server error - log as warning, components handle the actual error display
      if (status >= 500) {
        console.warn("Server error:", data);
      }
    } else if (error.request) {
      // Network error - request was made but no response received
      // Don't use console.error to avoid triggering Next.js dev error overlay
      console.warn("Network error: No response received");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ id: number; email: string; plan: string; createdTime: string }>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; userId: number; email: string; plan: string; role: string }>>("/auth/login", data),
};

// Reports API
export const reportsApi = {
  getReport: (reportId: number) =>
    api.get<ApiResponse<ReportData>>(`/reports/${reportId}`),

  getStoreReports: (storeId: number) =>
    api.get<ApiResponse<ReportListItem[]>>(`/reports/store/${storeId}`),

  getReports: () =>
    api.get<ApiResponse<ReportListItem[]>>("/reports"),

  deleteReport: (reportId: number) =>
    api.delete<ApiResponse<void>>(`/reports/${reportId}`),

  toggleArchive: (reportId: number) =>
    api.patch<ApiResponse<void>>(`/reports/${reportId}/archive`),

  toggleFavorite: (reportId: number) =>
    api.patch<ApiResponse<void>>(`/reports/${reportId}/favorite`),

  batchDelete: (reportIds: number[]) =>
    api.post<ApiResponse<void>>("/reports/batch/delete", reportIds),

  batchArchive: (reportIds: number[]) =>
    api.post<ApiResponse<void>>("/reports/batch/archive", reportIds),

  batchFavorite: (reportIds: number[]) =>
    api.post<ApiResponse<void>>("/reports/batch/favorite", reportIds),
};

// Tasks API
export const tasksApi = {
  getTaskStatus: (taskId: number) =>
    api.get<ApiResponse<TaskStatus>>(`/tasks/${taskId}`),
};

// Upload API
export const uploadApi = {
  uploadCsv: (file: File, storeId: number, source?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId.toString());
    if (source) formData.append("source", source);
    return api.post<ApiResponse<UploadResponse>>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUploadHistory: (storeId: number) =>
    api.get<ApiResponse<UploadHistoryItem[]>>(`/files/store/${storeId}`),
};

export interface UploadHistoryItem {
  fileId: number;
  fileName: string;
  status: string;
  uploadedAt: string;
  taskStatus: string | null;
  taskId: number | null;
  reportId: number | null;
  healthScore: number | null;
  completedAt: string | null;
}

// Store API
export const storesApi = {
  getStore: (storeId: number) =>
    api.get<ApiResponse<Store>>(`/stores/${storeId}`),
};

// Dashboard API
export const dashboardApi = {
  getStores: () =>
    api.get<ApiResponse<DashboardStoreItem[]>>("/dashboard/stores"),

  getStoreDashboard: (storeId: number) =>
    api.get<ApiResponse<DashboardData>>(`/dashboard/store/${storeId}`),
};

// Types
export interface Store {
  id: number;
  storeName: string;
  platform: string;
  createdAt: string;
}

export interface DashboardStoreItem {
  storeId: number;
  storeName: string;
  platform: string;
  latestHealthScore: number | null;
  reportCount: number;
  createdAt: string;
}

export interface DashboardData {
  storeId: number;
  storeName: string;
  healthScore: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  repeatRate: number;
  topProducts: { name: string; revenue: number }[];
  summary: string;
  monthlyRevenueTrend: Record<string, number>;
  monthlyOrdersTrend: Record<string, number>;
  healthTrend: { reportId: number; createdAt: string; healthScore: number }[];
  latestUpload: {
    fileName: string;
    status: string;
    createdAt: string;
    storeName: string;
    totalRows?: number;
    report?: { reportId: number; healthScore: number; createdAt: string };
  } | null;
  latestReport: { reportId: number; healthScore: number; createdAt: string } | null;
}

// Payment API
export const paymentApi = {
  createPayment: (data: { plan: string }) =>
    api.post<ApiResponse<{ paymentUrl: string; plan: string }>>("/payment/create", data),

  getBilling: () =>
    api.get<ApiResponse<BillingData>>("/payment/billing"),

  getSubscription: () =>
    api.get<ApiResponse<Subscription>>("/payment/subscription"),

  getPaymentHistory: () =>
    api.get<ApiResponse<PaymentRecord[]>>("/payment/history"),

  cancelSubscription: () =>
    api.post<ApiResponse<{ message: string; plan: string }>>("/payment/cancel"),

  getUsage: () =>
    api.get<ApiResponse<UsageSummary>>("/payment/usage"),
};

// Admin API
export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard"),

  listUsers: (search?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminUser>>>("/admin/users", { params: { search, page, size } }),

  updateUserPlan: (userId: number, plan: string) =>
    api.put<ApiResponse<void>>(`/admin/users/${userId}/plan`, { plan }),

  updateUserRole: (userId: number, role: string) =>
    api.put<ApiResponse<void>>(`/admin/users/${userId}/role`, { role }),

  toggleBanUser: (userId: number, banned: boolean) =>
    api.post<ApiResponse<void>>(`/admin/users/${userId}/ban`, { banned }),

  deleteUser: (userId: number) =>
    api.delete<ApiResponse<void>>(`/admin/users/${userId}`),

  listStores: (search?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminStore>>>("/admin/stores", { params: { search, page, size } }),

  deleteStore: (storeId: number) =>
    api.delete<ApiResponse<void>>(`/admin/stores/${storeId}`),

  listReports: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminReport>>>("/admin/reports", { params: { page, size } }),

  deleteReport: (reportId: number) =>
    api.delete<ApiResponse<void>>(`/admin/reports/${reportId}`),

  listPayments: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminPayment>>>("/admin/payments", { params: { page, size } }),

  listLogs: (type?: string, page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminLog>>>("/admin/logs", { params: { type, page, size } }),

  listWebhookLogs: (page = 0, size = 20) =>
    api.get<ApiResponse<AdminPageResponse<AdminLog>>>("/admin/logs/webhook", { params: { page, size } }),

  // ==================== System Settings ====================

  getSettingsGroup: () =>
    api.get<ApiResponse<AdminSystemSettings>>("/admin/settings"),

  updateSetting: (key: string, value: string) =>
    api.put<ApiResponse<void>>("/admin/settings", { key, value }),

  updateSettingsBatch: (settings: Record<string, string>) =>
    api.put<ApiResponse<void>>("/admin/settings/batch", { settings }),

  // ==================== Health Check ====================

  getHealthCheck: () =>
    api.get<ApiResponse<AdminHealthCheck>>("/admin/health-check"),

  // ==================== Deployment Info ====================

  getDeploymentInfo: () =>
    api.get<ApiResponse<AdminDeploymentInfo>>("/admin/deployment-info"),

  // ==================== Recent Logs ====================

  getRecentLogs: (level?: string, search?: string, limit = 100) =>
    api.get<ApiResponse<AdminRecentLogs>>("/admin/recent-logs", { params: { level, search, limit } }),

  // ==================== Sentry ====================

  testSentryError: () =>
    api.post<ApiResponse<string>>("/admin/sentry/test"),

  // ==================== PostHog ====================

  verifyPostHog: () =>
    api.post<ApiResponse<string>>("/admin/posthog/verify"),
};

export default api;
