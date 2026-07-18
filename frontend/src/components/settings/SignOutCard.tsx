"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

interface SignOutCardProps {
  onSignOut: () => void;
}

export default function SignOutCard({ onSignOut }: SignOutCardProps) {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <SettingsCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t("nav.signOut")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("settings.signOutDesc")}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 shrink-0"
            aria-label={t("nav.signOut")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t("nav.signOut")}
          </button>
        </div>
      </SettingsCard>

      {/* Sign Out Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-modal-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="signout-modal-title" className="text-base font-bold text-gray-950">
              {t("settings.signOutModalTitle")}
            </h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              {t("settings.signOutModalDesc")}
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => { setShowModal(false); onSignOut(); }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                {t("settings.signOutModalTitle")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}