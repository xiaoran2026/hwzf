"use client";

import { useI18n } from "@/lib/i18n/I18nContext";

interface SettingsSectionProps {
  titleKey: string;
  children: React.ReactNode;
}

export default function SettingsSection({ titleKey, children }: SettingsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
        {t(titleKey)}
      </h2>
      {children}
    </section>
  );
}
