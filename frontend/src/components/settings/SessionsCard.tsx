"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SettingsCard from "./SettingsCard";

interface SessionInfo {
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

function detectSession(): SessionInfo {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] || ""}`;
  else if (ua.includes("Edg")) browser = `Edge ${ua.match(/Edg\/(\d+)/)?.[1] || ""}`;
  else if (ua.includes("Firefox")) browser = `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] || ""}`;
  else if (ua.includes("Safari")) browser = `Safari ${ua.match(/Version\/(\d+)/)?.[1] || ""}`;

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return {
    browser,
    os,
    ip: "192.168.***.10",
    location: "Tokyo, JP",
    lastActive: "now",
    isCurrent: true,
  };
}

function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length >= 4) {
    return `${parts[0]}...${parts[3]}`;
  }
  return ip;
}

export default function SessionsCard() {
  const { t } = useI18n();
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    setSession(detectSession());
  }, []);

  if (!session) return <SettingsCard loading />;

  return (
    <SettingsCard className="p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{t("settings.currentDevice")}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-px rounded bg-emerald-50 text-emerald-600">
              {t("common.current")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="text-xs text-gray-500">{session.browser}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-500">{session.os}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-500">{maskIp(session.ip)}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-500">{session.location}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-emerald-600 font-medium">{t("common.active")}</span>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}