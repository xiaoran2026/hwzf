"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

interface NotifItem {
  key: string;
  descKey: string;
  defaultEnabled: boolean;
}

const NOTIF_ITEMS: NotifItem[] = [
  { key: "settings.emailNotifications", descKey: "settings.emailNotificationsDesc", defaultEnabled: true },
  { key: "settings.aiReportReady", descKey: "settings.aiReportReadyDesc", defaultEnabled: true },
  { key: "settings.weeklyDigest", descKey: "settings.weeklyDigestDesc", defaultEnabled: false },
  { key: "settings.marketing", descKey: "settings.marketingDesc", defaultEnabled: false },
];

function Toggle({
  enabled,
  loading,
  onToggle,
  ariaLabel,
}: {
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      } ${loading ? "opacity-50 cursor-wait" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function NotificationCard() {
  const { t } = useI18n();
  const [items, setItems] = useState<Record<string, { enabled: boolean; loading: boolean }>>(() => {
    const init: Record<string, { enabled: boolean; loading: boolean }> = {};
    NOTIF_ITEMS.forEach((item) => {
      init[item.key] = { enabled: item.defaultEnabled, loading: false };
    });
    return init;
  });
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleToggle = useCallback((key: string) => {
    const current = items[key];
    const nextEnabled = !current.enabled;

    // Immediately set loading and disabled state (optimistic)
    setItems((prev) => ({
      ...prev,
      [key]: { enabled: nextEnabled, loading: true },
    }));

    // Simulate API call
    setTimeout(() => {
      setItems((prev) => ({
        ...prev,
        [key]: { enabled: nextEnabled, loading: false },
      }));
      showToast("success", t("settings.notifUpdateSuccess"));
    }, 800);
  }, [items, t, showToast]);

  return (
    <>
      <SettingsCard className="p-6 divide-y divide-gray-50">
        {NOTIF_ITEMS.map((item) => {
          const state = items[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="pr-4">
                <p className="text-sm font-semibold text-gray-900">{t(item.key)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(item.descKey)}</p>
              </div>
              <Toggle
                enabled={state.enabled}
                loading={state.loading}
                onToggle={() => handleToggle(item.key)}
                ariaLabel={t(item.key)}
              />
            </div>
          );
        })}
      </SettingsCard>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
          role="status"
        >
          {toast.type === "success" ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}