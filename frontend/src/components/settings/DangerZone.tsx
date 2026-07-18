"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

interface DangerZoneProps {
  onDelete: () => void;
}

export default function DangerZone({ onDelete }: DangerZoneProps) {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const canDelete = confirmText === "DELETE";

  const handleConfirm = () => {
    if (!canDelete) {
      setError(t("settings.deleteModalInputPlaceholder"));
      return;
    }
    setShowModal(false);
    setConfirmText("");
    setError("");
    onDelete();
  };

  const handleCancel = () => {
    setShowModal(false);
    setConfirmText("");
    setError("");
  };

  return (
    <>
      <SettingsCard danger className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-700">{t("settings.deleteAccount")}</p>
            <p className="text-xs text-red-500/80 mt-1 leading-relaxed max-w-md">
              {t("settings.deleteAccountDesc")}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 shrink-0"
            aria-label={t("settings.deleteAccount")}
          >
            {t("settings.deleteAccount")}
          </button>
        </div>
      </SettingsCard>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-modal-title" className="text-base font-bold text-gray-950">
              {t("settings.deleteModalTitle")}
            </h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              {t("settings.deleteModalDesc")}
            </p>

            {/* Confirmation input */}
            <div className="mt-4">
              <label htmlFor="delete-confirm-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {t("settings.deleteModalInputPlaceholder")}
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
                placeholder="DELETE"
                className="block w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus:border-transparent transition-colors"
                aria-label={t("settings.deleteModalInputPlaceholder")}
                autoFocus
              />
              {error && <p className="text-[11px] text-red-500 mt-1" role="alert">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canDelete}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  canDelete
                    ? "bg-red-600 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {t("settings.deleteModalConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}