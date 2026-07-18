"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminSystemSettings, AdminHealthCheck, AdminDeploymentInfo, AdminRecentLogs } from "@/lib/types";
import { adminApi } from "@/lib/api";
import SentryMonitoringCard from "@/components/admin/SentryMonitoringCard";
import PostHogAnalyticsCard from "@/components/admin/PostHogAnalyticsCard";
import HealthCheckCard from "@/components/admin/HealthCheckCard";
import DeploymentInfoCard from "@/components/admin/DeploymentInfoCard";
import RecentLogsCard from "@/components/admin/RecentLogsCard";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-150 ${checked ? "bg-gray-900" : "bg-gray-200"}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-150 ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.example.com/webhooks/storeai");

  // New state for system settings modules
  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [health, setHealth] = useState<AdminHealthCheck | null>(null);
  const [deployment, setDeployment] = useState<AdminDeploymentInfo | null>(null);
  const [logs, setLogs] = useState<AdminRecentLogs | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [deploymentLoading, setDeploymentLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await adminApi.getSettingsGroup();
      setSettings(res.data.data);
    } catch {
      // keep null
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await adminApi.getHealthCheck();
      setHealth(res.data.data);
    } catch {
      // keep null
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const fetchDeployment = useCallback(async () => {
    try {
      const res = await adminApi.getDeploymentInfo();
      setDeployment(res.data.data);
    } catch {
      // keep null
    } finally {
      setDeploymentLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await adminApi.getRecentLogs();
      setLogs(res.data.data);
    } catch {
      // keep null
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchHealth();
    fetchDeployment();
    fetchLogs();
  }, [fetchSettings, fetchHealth, fetchDeployment, fetchLogs]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Configure platform integrations, API keys, and preferences</p>
      </div>

      <div className="space-y-6">
        {/* API Keys */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">API Keys</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">OpenAI API Key</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">sk-...xK8mP2nQ</p>
              </div>
              <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                Update
              </button>
            </div>
            <div className="border-t border-gray-50" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Claude API Key</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">sk-ant-...bR4wY9tL</p>
              </div>
              <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                Update
              </button>
            </div>
            <div className="border-t border-gray-50" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Gemini API Key</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">AIza...mN7pQ3sK</p>
              </div>
              <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Stripe Configuration */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Stripe Configuration</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Payment processing</p>
              <p className="text-xs text-gray-400 mt-0.5">Accept subscription payments via Stripe</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </span>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">SMTP Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Host</label>
              <input
                type="text"
                placeholder="smtp.example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Port</label>
              <input
                type="text"
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="noreply@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <button className="mt-4 bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            Save SMTP Settings
          </button>
        </div>

        {/* ========== NEW: Monitoring (Sentry) ========== */}
        <SentryMonitoringCard
          data={settings}
          loading={settingsLoading}
          onRefresh={fetchSettings}
        />

        {/* ========== NEW: Analytics (PostHog) ========== */}
        <PostHogAnalyticsCard
          data={settings}
          loading={settingsLoading}
          onRefresh={fetchSettings}
        />

        {/* ========== NEW: System Health Check ========== */}
        <HealthCheckCard
          data={health}
          loading={healthLoading}
          onRefresh={fetchHealth}
        />

        {/* ========== NEW: Deployment Information ========== */}
        <DeploymentInfoCard
          data={deployment}
          loading={deploymentLoading}
        />

        {/* ========== NEW: Recent Logs ========== */}
        <RecentLogsCard
          data={logs}
          loading={logsLoading}
          onRefresh={fetchLogs}
        />

        {/* Storage */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Storage</h2>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-700 font-medium">Local Storage</p>
              <p className="text-xs text-gray-400 mt-0.5">Files are stored on the local server</p>
            </div>
            <span className="text-sm text-gray-500">12.4 GB / 50 GB</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-gray-900 h-2 rounded-full transition-all" style={{ width: "24.8%" }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">24.8% of storage used</p>
        </div>

        {/* Webhook URL */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Webhook URL</h2>
          <p className="text-xs text-gray-400 mb-3">Receive event notifications at this endpoint</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
            />
            <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Branding</h2>
          <p className="text-xs text-gray-400 mb-3">Customize the platform logo and brand identity</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Upload Logo
              </button>
              <p className="text-xs text-gray-400 mt-2">Recommended: 512x512px, PNG or SVG</p>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Maintenance Mode</h2>
              <p className="text-xs text-gray-400 mt-0.5">When enabled, users will see a maintenance page instead of the app</p>
            </div>
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-xs text-gray-400 mb-4">Irreversible and destructive actions. Proceed with extreme caution.</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Reset All Data</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently delete all stores, reports, users, and platform data. This action cannot be undone.</p>
            </div>
            <button className="bg-red-600 text-white hover:bg-red-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}