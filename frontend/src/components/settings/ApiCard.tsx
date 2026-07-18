"use client";

import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

const API_FEATURES = [
  { key: "restApi", descKey: "restApiDesc", icon: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },
  { key: "webhook", descKey: "webhookDesc", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.121a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.342" },
  { key: "sdk", descKey: "sdkDesc", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
];

export default function ApiCard() {
  const { t } = useI18n();

  return (
    <SettingsCard className="p-6">
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900">{t("settings.apiAccess")}</p>
        <p className="text-xs text-gray-500 mt-0.5">{t("settings.apiAccessDesc")}</p>
      </div>

      {/* Feature list */}
      <div className="space-y-3 mb-5">
        {API_FEATURES.map((feat) => (
          <div
            key={feat.key}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feat.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{t(`settings.${feat.key}`)}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-px rounded bg-gray-100 text-gray-500">
                  {t("common.comingSoon")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{t(`settings.${feat.descKey}`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={t("settings.joinWaitlist")}
        >
          {t("settings.joinWaitlist")}
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={t("settings.learnMore")}
        >
          {t("settings.learnMore")}
        </button>
      </div>
    </SettingsCard>
  );
}