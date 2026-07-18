"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import SettingsCard from "./SettingsCard";

export default function SubscriptionCard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const plan = user?.plan || "FREE";
  const isFree = plan.toUpperCase() === "FREE";
  const isPro = plan.toUpperCase() === "PRO";

  const storeUsage = { used: isFree ? 1 : isPro ? 8 : 2, limit: isFree ? 1 : isPro ? "\u221E" : 5 };
  const uploadUsage = { used: isFree ? 3 : 12, limit: isFree ? 10 : "\u221E" };
  const csvLimit = isFree ? 500 : isPro ? 100000 : 50000;
  const renewText = isFree ? t("settings.unlimited") : "Aug 15, 2026";

  return (
    <SettingsCard className="p-6">
      {/* Info grid - clean layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-5">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t("settings.currentPlan")}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-bold text-gray-900">{plan}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t("common.active")}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t("settings.storeUsage")}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {storeUsage.used} / {storeUsage.limit}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t("settings.uploads")}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {uploadUsage.used} / {uploadUsage.limit}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t("settings.csvRows")}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {csvLimit.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t("settings.renew")}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{renewText}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        {isFree ? (
          <Link
            href="/billing"
            className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            aria-label={t("settings.upgradeToStarter")}
          >
            {t("settings.upgradeToStarter")}
          </Link>
        ) : (
          <>
            <Link
              href="/billing"
              className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              aria-label={t("settings.upgradePlan")}
            >
              {t("settings.upgradePlan")}
            </Link>
            <Link
              href="/billing"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={t("settings.manageSubscription")}
            >
              {t("settings.manageSubscription")}
            </Link>
          </>
        )}
      </div>
    </SettingsCard>
  );
}