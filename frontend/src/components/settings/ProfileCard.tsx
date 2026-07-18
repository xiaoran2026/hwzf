"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import SettingsCard from "./SettingsCard";

interface ProfileCardProps {
  displayName: string;
}

export default function ProfileCard({ displayName }: ProfileCardProps) {
  const { t } = useI18n();
  const { user } = useAuth();

  const accountId = `USR_${String(user?.id || 0).padStart(6, "0")}`;

  const memberSince = (() => {
    if (!user?.createdTime) return t("settings.unknown");
    try {
      return new Date(user.createdTime).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" }
      );
    } catch {
      return t("settings.unknown");
    }
  })();

  return (
    <SettingsCard className="p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0 group">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
            <span className="text-xl font-bold text-orange-700">
              {(displayName || user?.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-[10px] font-medium text-white text-center leading-tight">
              {t("common.comingSoon")}
            </span>
          </div>
        </div>
        {/* Info grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.displayName")}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {displayName || "\u2014"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.email")}
            </p>
            <div className="flex items-center mt-0.5">
              <p className="text-sm font-semibold text-gray-900">
                {user?.email || "\u2014"}
              </p>
              {user?.email && <CopyButton text={user.email} />}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.accountId")}
            </p>
            <div className="flex items-center mt-0.5">
              <p className="text-sm font-semibold text-gray-900">{accountId}</p>
              <CopyButton text={accountId} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.currentPlan")}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {user?.plan || t("common.free")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.memberSince")}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {memberSince}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("settings.status")}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-gray-900">
                {t("common.active")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      aria-label={t("common.copy")}
      title={t("common.copy")}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}