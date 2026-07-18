"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

function PasswordStrength({ password }: { password: string }) {
  const { t } = useI18n();

  const checks = useMemo(
    () => ({
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passed = Object.values(checks).filter(Boolean).length;

  let label = t("settings.weak");
  let color = "text-red-500";
  if (passed >= 5) { label = t("settings.strong"); color = "text-emerald-500"; }
  else if (passed >= 3) { label = t("settings.medium"); color = "text-amber-500"; }

  // Only show when password is non-empty
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold ${color}`}>{label}</span>
      </div>
      <div className="space-y-1">
        {[
          { ok: checks.len, text: t("settings.min8Chars") },
          { ok: checks.upper, text: t("settings.uppercase") },
          { ok: checks.lower, text: t("settings.lowercase") },
          { ok: checks.number, text: t("settings.number") },
          { ok: checks.special, text: t("settings.specialChar") },
        ].map((r) => (
          <div key={r.text} className="flex items-center gap-1.5">
            {r.ok ? (
              <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`text-[11px] ${r.ok ? "text-gray-600" : "text-gray-400"}`}>{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecurityCard() {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const fields = [
    { id: "settings-currentPw", label: t("settings.currentPassword"), value: currentPassword, setValue: setCurrentPassword, show: showCurrentPw, setShow: setShowCurrentPw },
    { id: "settings-newPw", label: t("settings.newPassword"), value: newPassword, setValue: setNewPassword, show: showNewPw, setShow: setShowNewPw },
    { id: "settings-confirmPw", label: t("settings.confirmPassword"), value: confirmPassword, setValue: setConfirmPassword, show: showConfirmPw, setShow: setShowConfirmPw },
  ];

  return (
    <SettingsCard className="p-6">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-900">{t("settings.changePassword")}</p>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            <div className="relative">
              <input
                id={field.id}
                type={field.show ? "text" : "password"}
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                placeholder={field.label}
                className="block w-full rounded-lg border border-gray-300 pr-10 pl-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-transparent transition-colors duration-150"
                aria-label={field.label}
              />
              <button
                type="button"
                onClick={() => field.setShow(!field.show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                aria-label={field.show ? t("common.close") : "Show password"}
              >
                {field.show ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
        <PasswordStrength password={newPassword} />
        <div className="pt-1">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={t("settings.updatePassword")}
          >
            {t("settings.updatePassword")}
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}