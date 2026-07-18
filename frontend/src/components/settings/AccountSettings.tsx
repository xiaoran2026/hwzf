"use client";

import { useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

interface AccountSettingsProps {
  displayName: string;
  onDisplayNameChange: (v: string) => void;
}

const TIMEZONES = [
  "UTC",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
];

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export default function AccountSettings({ displayName, onDisplayNameChange }: AccountSettingsProps) {
  const { t, locale, setLocale } = useI18n();
  const [name, setName] = useState(displayName);
  const [nameError, setNameError] = useState("");
  const [timezone, setTimezone] = useState(detectTimezone());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(t("settings.displayNameRequired"));
      return;
    }
    setNameError("");
    onDisplayNameChange(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Locale;
    setLocale(val);
  };

  const inputCls =
    "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-transparent transition-colors duration-150";
  const inputErrCls =
    "block w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus:border-transparent transition-colors duration-150";

  return (
    <SettingsCard className="p-6">
      <div className="space-y-4">
        {/* Display Name */}
        <div>
          <label htmlFor="settings-displayName" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {t("settings.displayName")}
          </label>
          <input
            id="settings-displayName"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            placeholder={t("settings.displayNamePlaceholder")}
            className={nameError ? inputErrCls : inputCls}
            aria-label={t("settings.displayName")}
          />
          {nameError && (
            <p className="text-[11px] text-red-500 mt-1" role="alert">{nameError}</p>
          )}
        </div>

        {/* Timezone & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-timezone" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t("settings.timezone")}
            </label>
            <select
              id="settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-transparent transition-colors duration-150 bg-white"
              aria-label={t("settings.timezone")}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="settings-language" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t("settings.language")}
            </label>
            <select
              id="settings-language"
              value={locale}
              onChange={handleLanguageChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-transparent transition-colors duration-150 bg-white"
              aria-label={t("settings.language")}
            >
              <option value="en">{t("settings.english")}</option>
              <option value="zh">{t("settings.chinese")}</option>
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={t("common.save")}
          >
            {t("common.save")}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium" role="status">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {t("common.saveSuccess")}
            </span>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}